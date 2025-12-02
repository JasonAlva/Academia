from fastapi import FastAPI ,Depends ,HTTPException ,status
from fastapi.security import HTTPBearer ,HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime ,timedelta
from jose import JWTError ,jwt,ExpiredSignatureError
from passlib.context import CryptContext
from prisma import Prisma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import os
from pathlib import Path 
from dotenv import load_dotenv 


current_dir = Path(__file__).resolve().parent 
root_dir = current_dir.parent
env_path = current_dir / ".env"  # Load from app directory first

# Fallback to parent .env if app .env doesn't exist
if not env_path.exists():
    env_path = root_dir / ".env"

load_dotenv(dotenv_path=env_path)


app = FastAPI(title="College Query System")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
os.environ["GOOGLE_API_KEY"]=os.getenv("GOOGLE_API_KEY")



db = Prisma()


# JWT Config
SECRET_KEY = os.getenv("SECRET_KEY", "11243543")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
    #
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],    
)

class UserCreate(BaseModel):
    email:str
    password:str
    name:str
    role:Literal["STUDENT", "ADMIN", "FACULTY"]="STUDENT"


class UserLogin(BaseModel):
    email:str
    password:str

class TimeTableEntry( BaseModel):
    courseName: str
    courseCode: str
    instructor: str
    dayOfWeek: str
    startTime: str
    endTime: str
    room: str
    type: str

class QeuryRequest(BaseModel):
    query:str

class QueryResponse(BaseModel):
    answer:str
    entries:List[dict]

def create_access_token(data:dict):
    to_encode=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp':expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

async def get_user_token(credentials:HTTPAuthorizationCredentials=Depends(security)):
    token=credentials.credentials
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=ALGORITHM)
        user_id:str=payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401,detail="Invalid token")
        user=await db.user.find_unique(where={"id":user_id})
        if user is None:
            raise HTTPException(tatus_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
         raise HTTPException(status_code=401, detail="Invalid token")
    


@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.post("/api/auth/register")
async def register(user:UserCreate):
    existing = await db.user.find_unique(where={'email':user.email})
    if existing:
        raise HTTPException(status_code=400,detail="Email already registered")
    
    hashed_password=pwd_context.hash(user.password)
    new_user=await db.user.create(data={'name':user.name,'email':user.email,'password':hashed_password,'role':user.role})
    

    token=create_access_token({'sub':new_user.id})
    return {"token":token ,  "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name, "role": new_user.role}}


@app.post("/api/auth/login")
async def login(credentials:UserLogin):
    new_user= await db.user.find_unique(where={"email":credentials.email})
    if not new_user or not pwd_context.verify(credentials.password,new_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token=create_access_token({"sub":new_user.id})
    return {"token":token ,  "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name, "role": new_user.role}}
    

@app.post("/api/timetable")
async def create_timetable_entry(entry:TimeTableEntry, current_user=Depends(get_user_token)):
    new_entry=await db.timetableentry.create(data={
         "userId": current_user.id,
            "courseName": entry.courseName,
            "courseCode": entry.courseCode,
            "instructor": entry.instructor,
            "dayOfWeek": entry.dayOfWeek,
            "startTime": entry.startTime,
            "endTime": entry.endTime,
            "room": entry.room,
            "type": entry.type
    })
    return new_entry

@app.get("/api/timetable")
async def get_timetable(current_user=Depends(get_user_token)):
        # Admins can see all timetable entries; others only see their own
        if getattr(current_user, "role", "").upper() == "ADMIN":
            entries = await db.timetableentry.find_many(order={"dayOfWeek": "asc"})
        else:
            entries = await db.timetableentry.find_many(where={"userId": current_user.id}, order={"dayOfWeek": "asc"})
        return entries


@app.delete("/api/timetable/{entry_id}")
async def delete_timetable_entry(entry_id:str,current_user=Depends(get_user_token)):
    entry=await db.timetableentry.find_unique(where={'id':entry_id})

    if not entry or entry.userId!=current_user.id:
        raise HTTPException(status_code=404, detail="Entry not found")

    await db.timetableentry.delete(where={'id':entry_id})
    return {"message": "Deleted successfully"}


@app.post("/api/query",response_model=QueryResponse)
async def handleQuery(request:QeuryRequest,current_user=Depends(get_user_token)):

    entries=await db.timetableentry.find_many(where={'userId':current_user.id})

    if not entries:
        return QueryResponse(
             answer="You don't have any classes in your timetable yet. Please add some classes first!",
            entries=[]
        )
        
    timetable_text = "\n".join([
    f"- {e.courseName} ({e.courseCode}): {e.dayOfWeek} {e.startTime}-{e.endTime}, {e.room}, taught by {e.instructor} ({e.type})"
    for e in entries
    ])

    llm=ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    )

    prompt=ChatPromptTemplate.from_messages([
        ("system", """You are a helpful college timetable assistant. 
        Answer questions about the student's schedule clearly and concisely.
        
        Student's Timetable:
        {timetable}
        
        Rules:
        - Always reference specific courses, times, and rooms when relevant
        - If asking about "today" or "tomorrow", current day is provided
        - Be friendly and helpful
        - If the question can't be answered from the timetable, politely say so"""),
        ("user", "{query}")
    ])

    chain=prompt|llm
    response=chain.invoke({'timetable':timetable_text,'query':request.query})

    query_lower=request.query.lower()

    relevent_entries=[{
         "id": e.id,
            "courseName": e.courseName,
            "courseCode": e.courseCode,
            "instructor": e.instructor,
            "dayOfWeek": e.dayOfWeek,
            "startTime": e.startTime,
            "endTime": e.endTime,
            "room": e.room,
            "type": e.type
    }
    for e in entries
    if e.courseName.lower() in query_lower or e.courseName.lower() in query_lower or e.dayOfWeek in query_lower]

    return QueryResponse(answer=response.content ,entries=relevent_entries if relevent_entries else [])


@app.get("/")
async def root():
    return {"message": "College Query System API"}
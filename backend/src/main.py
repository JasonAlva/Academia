from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes
from src.config.database import connect_to_database

app=FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

@app.on_event("startup")
async def startup_event():
    await connect_to_database()

@app.get("/")
async def root():
    return {"messaage":"welcome to api!"}
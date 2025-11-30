from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes
from src.config.database import connect_to_database
from contextlib import asynccontextmanager
from src.config.database import connect_to_database,disconnect_to_database

@asynccontextmanager
async def lifespan(app:FastAPI):
    await connect_to_database()
    yield
    await disconnect_to_database()

app=FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

@app.get("/")
async def root():
    return {"messaage":"welcome to api!"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes
from contextlib import asynccontextmanager
from src.config.database import connect_db,disconnect_db

@asynccontextmanager
async def lifespan(app:FastAPI):
    await connect_db()
    yield
    await disconnect_db()

app=FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

@app.get("/")
async def root():
    return {"messaage":"welcome to api!"}
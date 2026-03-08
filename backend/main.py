from fastapi import FastAPI
from app.database import engine, Base
from app import models 

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Movie Night Agent API")

@app.get("/health")
def health_check():
    return {"status": "Database connected and Agent is online."}
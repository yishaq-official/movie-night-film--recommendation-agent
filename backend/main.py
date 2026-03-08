from fastapi import FastAPI
from app.core.database import engine
from app.models import tables

# Create all tables in the database
tables.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Movie Night Agent API")

@app.get("/health")
def health_check():
    return {"status": "Database connected and Agent is online."}
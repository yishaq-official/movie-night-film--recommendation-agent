from fastapi import FastAPI
from app.core.database import engine
from app.models import tables

# Import all routers
from app.api import sessions, users, movies

tables.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Movie Night Agent API")

# Register the routers
app.include_router(sessions.router)
app.include_router(users.router)
app.include_router(movies.router) 

@app.get("/health")
def health_check():
    return {"status": "Database connected and Agent is online."}
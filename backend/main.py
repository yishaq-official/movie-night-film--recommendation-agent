from fastapi import FastAPI
from app.core.database import engine
from app.models import tables

# Import our new sessions router
from app.api import sessions

tables.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Movie Night Agent API")

# Register the router with the main app
app.include_router(sessions.router)

@app.get("/health")
def health_check():
    return {"status": "Database connected and Agent is online."}
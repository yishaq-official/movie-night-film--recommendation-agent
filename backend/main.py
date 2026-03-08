from fastapi import FastAPI

app = FastAPI(title="Movie Night Agent API")

@app.get("/health")
def health_check():
    return {"status": "Agent is online and ready for movies."}
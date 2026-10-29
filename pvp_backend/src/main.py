import uvicorn
from fastapi import FastAPI
from src.api.routes import router

app = FastAPI(title="PvP Backend")

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
import models
from routers import accounts, journal, voice, ocr, reports, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="سیستم حسابداری هوشمند",
    description="API برای سیستم حسابداری با قابلیت Voice و OCR",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/audio", exist_ok=True)
os.makedirs("uploads/receipts", exist_ok=True)

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(journal.router)
app.include_router(voice.router)
app.include_router(ocr.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "message": "سیستم حسابداری هوشمند",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

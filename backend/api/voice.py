"""
Voice processing endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Transcribe audio file using Whisper"""
    pass


@router.post("/extract-info")
async def extract_visitor_info(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Extract visitor name and time from voice using NER"""
    pass


@router.post("/process-approval-request")
async def process_voice_approval(file: UploadFile = File(...), resident_id: int, db: Session = Depends(get_db)):
    """Process voice-based approval request"""
    pass

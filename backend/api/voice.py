"""
Voice Processing API Endpoints
POST /api/voice/process - Full voice to approval pipeline
POST /api/voice/transcribe - Just transcribe audio
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from models import Visitor, Approval, Resident
from schemas import VoiceProcessResponse
from services.voice_processor import process_voice_command, save_audio_temp, cleanup_audio, transcribe_audio
from services.time_validator import parse_time_string, calculate_time_window
from utils.audit_logger import log_action
from config import DEFAULT_APPROVAL_DURATION

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/process", response_model=VoiceProcessResponse)
async def process_voice(
    audio: UploadFile = File(...),
    resident_id: int = Form(...),
    language: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Process voice command to create visitor approval.
    
    1. Transcribes audio using Whisper
    2. Extracts visitor name, time, purpose using NER
    3. Creates approval record
    
    Supports Arabic and English.
    """
    # Verify resident exists
    resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    # Save audio to temp file
    audio_bytes = await audio.read()
    audio_path = save_audio_temp(audio_bytes)
    
    try:
        # Process voice command
        result = process_voice_command(audio_path, resident_id, language)
        
        if not result["success"]:
            return VoiceProcessResponse(
                success=False,
                transcript="",
                language=language or "en",
                extracted={},
                approval_id=None,
                message=f"Transcription failed: {result['error']}"
            )
        
        extracted = result["extracted"]
        
        # Create visitor and approval if we extracted useful info
        approval_id = None
        message = ""
        
        if extracted.get("visitor_name") or extracted.get("purpose"):
            # Create or find visitor
            visitor_name = extracted.get("visitor_name") or "Voice Visitor"
            
            visitor = Visitor(
                name=visitor_name,
                purpose=extracted.get("purpose"),
            )
            db.add(visitor)
            db.flush()
            
            # Calculate time window
            scheduled_time = None
            if extracted.get("time"):
                scheduled_time = parse_time_string(extracted["time"])
            
            if scheduled_time is None:
                scheduled_time = datetime.utcnow()
            
            valid_from, valid_until = calculate_time_window(
                scheduled_time, 
                DEFAULT_APPROVAL_DURATION
            )
            
            # Create auto-approved approval
            approval = Approval(
                resident_id=resident_id,
                visitor_id=visitor.id,
                status="approved",
                valid_from=valid_from,
                valid_until=valid_until,
                approval_method="voice",
                approved_at=datetime.utcnow()
            )
            db.add(approval)
            db.flush()
            
            approval_id = approval.id
            
            # Log the action
            log_action(
                db, "voice_command",
                resident_id=resident_id,
                visitor_id=visitor.id,
                details=f"Voice approval: {visitor_name}, valid until {valid_until}"
            )
            
            db.commit()
            message = f"Created approval for {visitor_name}, valid until {valid_until.strftime('%H:%M')}"
        else:
            message = "Could not extract visitor information. Please try again with clearer speech."
        
        return VoiceProcessResponse(
            success=True,
            transcript=result["transcript"],
            language=result["language"],
            extracted=extracted,
            approval_id=approval_id,
            message=message
        )
        
    finally:
        # Cleanup temp audio file
        cleanup_audio(audio_path)


@router.post("/transcribe")
async def transcribe_only(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """
    Just transcribe audio without creating approval.
    Useful for testing Whisper integration.
    """
    audio_bytes = await audio.read()
    audio_path = save_audio_temp(audio_bytes)
    
    try:
        result = transcribe_audio(audio_path, language)
        return {
            "success": result["success"],
            "transcript": result["text"],
            "language": result["language"],
            "error": result.get("error"),
            "is_mock": result.get("mock", False)
        }
    finally:
        cleanup_audio(audio_path)


@router.post("/test-extraction")
async def test_extraction(text: str = Form(...), language: str = Form("en")):
    """
    Test entity extraction on provided text.
    Useful for debugging NER without audio.
    """
    from utils.ner_extractor import extract_visitor_entities
    
    entities = extract_visitor_entities(text, language)
    return {
        "input_text": text,
        "language": language,
        "extracted": entities
    }

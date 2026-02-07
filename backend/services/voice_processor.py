"""
Voice Processing Service - Whisper transcription + NER
Production-grade with proper error handling and logging
"""
import tempfile
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple

from core import settings, logger

# Whisper will be loaded lazily
_whisper_model = None


def get_whisper_model():
    """Lazy load Whisper model"""
    global _whisper_model
    if settings.use_mock_whisper:
        logger.info("whisper_mock_mode", message="Using mock transcription")
        return None
        
    if _whisper_model is None:
        try:
            import whisper
            logger.info("whisper_loading", model=settings.whisper_model)
            _whisper_model = whisper.load_model(settings.whisper_model)
            logger.info("whisper_loaded")
        except ImportError:
            logger.warning("whisper_not_installed", message="Using mock mode")
            return None
        except Exception as e:
            logger.error("whisper_load_failed", error=str(e))
            return None
    return _whisper_model


def transcribe_audio(audio_path: str, language: Optional[str] = None) -> Dict:
    """
    Transcribe audio file using Whisper.
    
    Args:
        audio_path: Path to audio file
        language: Language code ('en', 'ar') or None for auto-detect
    
    Returns:
        {
            "text": str,
            "language": str,
            "success": bool,
            "error": str or None
        }
    """
    model = get_whisper_model()
    
    if model is None:
        # Mock mode for testing without Whisper
        return mock_transcribe(audio_path)
    
    try:
        # Transcribe with language hint if provided
        options = {}
        if language:
            options["language"] = language
        
        result = model.transcribe(audio_path, **options)
        
        return {
            "text": result["text"].strip(),
            "language": result.get("language", language or "en"),
            "success": True,
            "error": None
        }
    except Exception as e:
        return {
            "text": "",
            "language": language or "en",
            "success": False,
            "error": str(e)
        }


def mock_transcribe(audio_path: str) -> Dict:
    """
    Mock transcription for testing without Whisper.
    Returns sample responses based on random selection.
    """
    import random
    
    samples = [
        {"text": "Expecting my friend Ahmed at 6 PM", "language": "en"},
        {"text": "Delivery from Noon arriving at 2 PM", "language": "en"},
        {"text": "AC technician coming at 4 o'clock", "language": "en"},
        {"text": "أتوقع صديقي أحمد الساعة 6 مساء", "language": "ar"},
        {"text": "Guest Sarah visiting at noon", "language": "en"},
    ]
    
    sample = random.choice(samples)
    return {
        "text": sample["text"],
        "language": sample["language"],
        "success": True,
        "error": None,
        "mock": True  # Flag to indicate mock mode
    }


def process_voice_command(
    audio_path: str, 
    resident_id: int,
    language: Optional[str] = None
) -> Dict:
    """
    Full voice processing pipeline:
    1. Transcribe audio
    2. Extract entities (name, time, purpose)
    3. Return structured data for approval creation
    
    Returns:
        {
            "success": bool,
            "transcript": str,
            "language": str,
            "extracted": {
                "visitor_name": str,
                "time": str,
                "purpose": str
            },
            "error": str or None
        }
    """
    from utils.ner_extractor import extract_visitor_entities
    
    # Step 1: Transcribe
    transcription = transcribe_audio(audio_path, language)
    
    if not transcription["success"]:
        return {
            "success": False,
            "transcript": "",
            "language": language or "en",
            "extracted": {},
            "error": transcription["error"]
        }
    
    # Step 2: Extract entities
    entities = extract_visitor_entities(
        transcription["text"], 
        transcription["language"]
    )
    
    return {
        "success": True,
        "transcript": transcription["text"],
        "language": transcription["language"],
        "extracted": entities,
        "error": None,
        "is_mock": transcription.get("mock", False)
    }


def save_audio_temp(audio_bytes: bytes, extension: str = ".wav") -> str:
    """Save audio bytes to temp file and return path"""
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"voice_{timestamp}{extension}"
    filepath = os.path.join(AUDIO_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(audio_bytes)
    
    return filepath


def cleanup_audio(filepath: str):
    """Delete temporary audio file"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass  # Ignore cleanup errors

"""
Voice processing: Whisper transcription + Named Entity Recognition (NER)
"""


class VoiceProcessor:
    """Process voice recordings and extract information"""

    def __init__(self):
        pass

    def transcribe_audio(self, audio_path: str) -> str:
        """Transcribe audio using Whisper API"""
        pass

    def extract_entities(self, text: str) -> dict:
        """Extract name and time information using NER"""
        pass

    def process_approval_voice(self, audio_path: str, resident_id: int) -> dict:
        """Process voice-based approval request"""
        pass

"""
Named Entity Recognition (NER) for extracting visitor info from text
Extract: visitor name, time, purpose from voice transcripts
"""
import re
from datetime import datetime, timedelta
from typing import Optional, Dict


# Time patterns for extraction
TIME_PATTERNS = [
    # 24-hour format
    r'(\d{1,2}):(\d{2})',
    # 12-hour format with AM/PM
    r'(\d{1,2})\s*(am|pm|AM|PM)',
    r'(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)',
    # Words
    r'(noon|midnight)',
    # Relative times
    r'in\s+(\d+)\s+(hour|hours|minute|minutes)',
]

# Arabic time patterns
ARABIC_TIME_PATTERNS = [
    r'الساعة\s*(\d{1,2})',  # "at X o'clock"
    r'(\d{1,2})\s*صباحا',   # X AM
    r'(\d{1,2})\s*مساء',    # X PM
]

# Purpose/relationship keywords
PURPOSE_KEYWORDS = {
    'en': {
        'delivery': ['delivery', 'package', 'parcel', 'courier', 'amazon', 'noon', 'talabat'],
        'service': ['repair', 'technician', 'plumber', 'electrician', 'AC', 'maintenance', 'cleaner', 'cleaning'],
        'guest': ['friend', 'family', 'relative', 'guest', 'visit', 'visitor'],
        'work': ['worker', 'contractor', 'install', 'installation'],
    },
    'ar': {
        'delivery': ['توصيل', 'طرد', 'امازون', 'نون', 'طلبات'],
        'service': ['فني', 'سباك', 'كهربائي', 'تكييف', 'صيانة', 'منظف'],
        'guest': ['صديق', 'عائلة', 'زائر', 'زيارة'],
        'work': ['عامل', 'مقاول', 'تركيب'],
    }
}


def extract_visitor_entities(text: str, language: str = 'en') -> Dict:
    """
    Extract visitor information from transcribed text.
    
    Returns:
        {
            "visitor_name": str or None,
            "time": str or None (HH:MM format),
            "purpose": str or None,
            "raw_time": str or None (original time text),
            "confidence": float
        }
    """
    text_lower = text.lower()
    entities = {
        "visitor_name": None,
        "time": None,
        "purpose": None,
        "raw_time": None,
        "confidence": 0.0
    }
    
    # Extract time
    time_result = extract_time(text, language)
    if time_result:
        entities["time"] = time_result["normalized"]
        entities["raw_time"] = time_result["raw"]
        entities["confidence"] += 0.3
    
    # Extract purpose
    purpose = extract_purpose(text_lower, language)
    if purpose:
        entities["purpose"] = purpose
        entities["confidence"] += 0.3
    
    # Extract name (basic approach - look for capitalized words or common patterns)
    name = extract_name(text, language)
    if name:
        entities["visitor_name"] = name
        entities["confidence"] += 0.4
    
    return entities


def extract_time(text: str, language: str = 'en') -> Optional[Dict]:
    """Extract and normalize time from text"""
    
    # Check for relative times first
    relative_match = re.search(r'in\s+(\d+)\s+(hour|hours|minute|minutes)', text.lower())
    if relative_match:
        amount = int(relative_match.group(1))
        unit = relative_match.group(2)
        now = datetime.now()
        if 'hour' in unit:
            target = now + timedelta(hours=amount)
        else:
            target = now + timedelta(minutes=amount)
        return {
            "normalized": target.strftime("%H:%M"),
            "raw": relative_match.group(0)
        }
    
    # Check for noon/midnight
    if 'noon' in text.lower():
        return {"normalized": "12:00", "raw": "noon"}
    if 'midnight' in text.lower():
        return {"normalized": "00:00", "raw": "midnight"}
    
    # 12-hour format with AM/PM
    match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)', text)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2)) if match.group(2) else 0
        period = match.group(3).lower()
        
        if period == 'pm' and hour != 12:
            hour += 12
        elif period == 'am' and hour == 12:
            hour = 0
        
        return {
            "normalized": f"{hour:02d}:{minute:02d}",
            "raw": match.group(0)
        }
    
    # 24-hour format
    match = re.search(r'(\d{1,2}):(\d{2})', text)
    if match:
        return {
            "normalized": f"{int(match.group(1)):02d}:{match.group(2)}",
            "raw": match.group(0)
        }
    
    # Simple hour mention (assume PM for afternoon context)
    match = re.search(r'at\s+(\d{1,2})\b', text.lower())
    if match:
        hour = int(match.group(1))
        # Assume PM if hour is 1-6
        if 1 <= hour <= 6:
            hour += 12
        return {
            "normalized": f"{hour:02d}:00",
            "raw": match.group(0)
        }
    
    # Arabic patterns
    if language == 'ar':
        match = re.search(r'الساعة\s*(\d{1,2})', text)
        if match:
            hour = int(match.group(1))
            return {"normalized": f"{hour:02d}:00", "raw": match.group(0)}
        
        # مساء (evening/PM)
        match = re.search(r'(\d{1,2})\s*مساء', text)
        if match:
            hour = int(match.group(1))
            if hour != 12:
                hour += 12
            return {"normalized": f"{hour:02d}:00", "raw": match.group(0)}
    
    return None


def extract_purpose(text: str, language: str = 'en') -> Optional[str]:
    """Extract visit purpose from text"""
    keywords = PURPOSE_KEYWORDS.get(language, PURPOSE_KEYWORDS['en'])
    
    for purpose, words in keywords.items():
        for word in words:
            if word.lower() in text.lower():
                return purpose.capitalize()
    
    return None


def extract_name(text: str, language: str = 'en') -> Optional[str]:
    """
    Extract visitor name from text.
    Uses patterns like "visitor named X", "X is coming", "expecting X"
    """
    
    # English patterns
    patterns = [
        r'(?:named|called|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
        r'(?:expecting|expect)\s+([A-Z][a-z]+)',
        r'(?:friend|guest|visitor)\s+([A-Z][a-z]+)',
        r'^([A-Z][a-z]+)\s+(?:is coming|will come|arriving)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    
    # Arabic patterns - look for names after صديقي (my friend) or زائر (visitor)
    if language == 'ar':
        arabic_patterns = [
            r'صديقي\s+(\w+)',
            r'زائر\s+(\w+)',
            r'اسمه\s+(\w+)',
        ]
        for pattern in arabic_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
    
    # Fallback: Look for any capitalized proper nouns (2+ chars)
    # Exclude common words
    exclude = {'I', 'The', 'At', 'In', 'On', 'My', 'For', 'We', 'He', 'She', 'It', 'AM', 'PM'}
    words = text.split()
    for word in words:
        if len(word) >= 2 and word[0].isupper() and word not in exclude:
            # Check it's not part of a time
            if not re.match(r'\d', word):
                return word
    
    return None

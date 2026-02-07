<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## 🏗️ Complete System Architecture \& Data Flow


***

## **1. HIGH-LEVEL ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────┬───────────────────┬───────────────────────┤
│  Resident App       │   Guard App       │  Admin Dashboard      │
│  (React/Next.js)    │   (React)         │  (Optional)           │
│  - Approval UI      │   - Status Check  │  - Analytics          │
│  - Voice Input      │   - Photo Capture │  - Audit Logs         │
│  - Schedule View    │   - Request Flow  │  - Building Mgmt      │
└─────────────────────┴───────────────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│                     (FastAPI Backend)                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │ Visitor      │  │ Approval     │  │ Calendar       │       │
│  │ Controller   │  │ Controller   │  │ Sync Service   │       │
│  └──────────────┘  └──────────────┘  └────────────────┘       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │ Voice/AI     │  │ Notification │  │ Auth           │       │
│  │ Processor    │  │ Service      │  │ Middleware     │       │
│  └──────────────┘  └──────────────┘  └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Approval Engine                                    │        │
│  │  - Time window validation                           │        │
│  │  - Auto-approval rules (calendar + recurring)       │        │
│  │  - Expiry management                                │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │  AI/ML Services                                     │        │
│  │  - Voice transcription (Whisper)                    │        │
│  │  - NER extraction (name, time, purpose)             │        │
│  │  - Language detection (AR/EN)                       │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │   SQLite     │  │  File Store  │  │  External APIs │       │
│  │   Database   │  │  (Photos)    │  │  - Calendar    │       │
│  │              │  │              │  │  - UAE Pass    │       │
│  └──────────────┘  └──────────────┘  └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```


***

## **2. DETAILED DATABASE SCHEMA**

```sql
-- Core Entities

CREATE TABLE buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    security_code TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE residents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    apartment_number TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    preferred_language TEXT CHECK(preferred_language IN ('en', 'ar')) DEFAULT 'en',
    calendar_sync_enabled BOOLEAN DEFAULT 0,
    calendar_url TEXT,
    uae_pass_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    UNIQUE(building_id, apartment_number)
);

CREATE TABLE guards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    shift_start TIME,
    shift_end TIME,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- Visitor Management

CREATE TABLE visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    purpose TEXT NOT NULL,
    visitor_type TEXT CHECK(visitor_type IN ('delivery', 'guest', 'service', 'other')) DEFAULT 'other',
    photo_url TEXT,
    id_document_type TEXT,
    id_document_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visit_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id INTEGER NOT NULL,
    resident_id INTEGER NOT NULL,
    guard_id INTEGER,
    
    -- Request details
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_time TIMESTAMP,
    expected_duration_minutes INTEGER DEFAULT 30,
    
    -- Status tracking
    status TEXT CHECK(status IN ('pending', 'approved', 'denied', 'expired', 'completed', 'cancelled')) DEFAULT 'pending',
    
    -- Approval details
    approval_method TEXT CHECK(approval_method IN ('manual', 'calendar_auto', 'recurring_auto', 'voice')) DEFAULT 'manual',
    approved_at TIMESTAMP,
    approved_by_resident_id INTEGER,
    denial_reason TEXT,
    
    -- Access window
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    access_code TEXT UNIQUE, -- QR code data or numeric code
    
    -- Check-in/out
    checked_in_at TIMESTAMP,
    checked_out_at TIMESTAMP,
    actual_duration_minutes INTEGER,
    
    FOREIGN KEY (visitor_id) REFERENCES visitors(id),
    FOREIGN KEY (resident_id) REFERENCES residents(id),
    FOREIGN KEY (guard_id) REFERENCES guards(id),
    FOREIGN KEY (approved_by_resident_id) REFERENCES residents(id)
);

CREATE INDEX idx_visit_status ON visit_requests(status);
CREATE INDEX idx_visit_resident ON visit_requests(resident_id);
CREATE INDEX idx_visit_scheduled ON visit_requests(scheduled_time);

-- Recurring Visitors

CREATE TABLE recurring_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resident_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    
    -- Schedule pattern
    recurrence_type TEXT CHECK(recurrence_type IN ('daily', 'weekly', 'monthly', 'custom')) NOT NULL,
    days_of_week TEXT, -- JSON array: ["monday", "thursday"]
    time_of_day TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Validity period
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    is_active BOOLEAN DEFAULT 1,
    auto_approve BOOLEAN DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_generated_at TIMESTAMP,
    
    FOREIGN KEY (resident_id) REFERENCES residents(id),
    FOREIGN KEY (visitor_id) REFERENCES visitors(id),
    UNIQUE(resident_id, visitor_id, recurrence_type)
);

-- Calendar Integration

CREATE TABLE calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resident_id INTEGER NOT NULL,
    
    -- Calendar source
    calendar_provider TEXT CHECK(calendar_provider IN ('google', 'outlook', 'apple')) NOT NULL,
    external_event_id TEXT NOT NULL,
    
    -- Event details
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location TEXT,
    
    -- Visitor detection
    contains_visitor_info BOOLEAN DEFAULT 0,
    extracted_visitor_name TEXT,
    extracted_purpose TEXT,
    
    -- Auto-approval
    visit_request_id INTEGER, -- If auto-created
    processed_at TIMESTAMP,
    
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resident_id) REFERENCES residents(id),
    FOREIGN KEY (visit_request_id) REFERENCES visit_requests(id),
    UNIQUE(resident_id, external_event_id)
);

-- Voice Commands Log

CREATE TABLE voice_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resident_id INTEGER NOT NULL,
    
    -- Audio data
    audio_file_path TEXT,
    audio_duration_seconds REAL,
    detected_language TEXT CHECK(detected_language IN ('en', 'ar', 'unknown')),
    
    -- Transcription
    raw_transcript TEXT,
    confidence_score REAL,
    
    -- Extracted entities
    extracted_visitor_name TEXT,
    extracted_time TEXT,
    extracted_purpose TEXT,
    extraction_success BOOLEAN DEFAULT 0,
    
    -- Result
    visit_request_id INTEGER,
    processing_status TEXT CHECK(processing_status IN ('success', 'failed', 'partial')) DEFAULT 'failed',
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resident_id) REFERENCES residents(id),
    FOREIGN KEY (visit_request_id) REFERENCES visit_requests(id)
);

-- Audit Trail

CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Who
    actor_type TEXT CHECK(actor_type IN ('resident', 'guard', 'system', 'admin')) NOT NULL,
    actor_id INTEGER NOT NULL,
    
    -- What
    action TEXT NOT NULL, -- 'approve', 'deny', 'check_in', 'check_out', 'cancel', etc.
    entity_type TEXT NOT NULL, -- 'visit_request', 'recurring_visitor', etc.
    entity_id INTEGER NOT NULL,
    
    -- Details
    details TEXT, -- JSON with additional context
    ip_address TEXT,
    user_agent TEXT,
    
    -- When
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_type, actor_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);

-- Notifications

CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_type TEXT CHECK(recipient_type IN ('resident', 'guard')) NOT NULL,
    recipient_id INTEGER NOT NULL,
    
    notification_type TEXT CHECK(notification_type IN ('approval_request', 'approval_granted', 'visitor_arrived', 'visitor_departed', 'expiring_soon', 'expired')) NOT NULL,
    
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    
    visit_request_id INTEGER,
    
    is_read BOOLEAN DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    FOREIGN KEY (visit_request_id) REFERENCES visit_requests(id)
);

CREATE INDEX idx_notification_recipient ON notifications(recipient_type, recipient_id, is_read);
```


***

## **3. DATA FLOW DIAGRAMS**

### **Flow 1: Calendar Auto-Approval**

```
┌─────────────┐
│  Resident   │
│  Calendar   │
│  (External) │
└──────┬──────┘
       │
       │ 1. Event created: "Noon Delivery at 2 PM"
       │
       ▼
┌─────────────────────────────────────────┐
│  Calendar Sync Service (Background Job) │
│  - Polls every 15 minutes               │
│  - Fetches new events via API           │
└──────┬──────────────────────────────────┘
       │
       │ 2. New event detected
       │
       ▼
┌─────────────────────────────────────────┐
│  NLP/Pattern Matcher                    │
│  - Parse title: "Noon Delivery"         │
│  - Extract time: "2 PM"                 │
│  - Classify type: "delivery"            │
└──────┬──────────────────────────────────┘
       │
       │ 3. Visitor info extracted
       │
       ▼
┌─────────────────────────────────────────┐
│  Approval Engine                        │
│  - Create visitor record (if new)       │
│  - Create visit_request                 │
│  - Set status = 'approved'              │
│  - approval_method = 'calendar_auto'    │
│  - valid_from = 13:45 (15 min early)    │
│  - valid_until = 14:30 (30 min buffer)  │
└──────┬──────────────────────────────────┘
       │
       │ 4. Auto-approved
       │
       ▼
┌─────────────────────────────────────────┐
│  Notification Service                   │
│  - SMS to resident: "Auto-approved"     │
│  - Push to guard app: "Expected at 2PM" │
└─────────────────────────────────────────┘
```


***

### **Flow 2: Unscheduled Visitor with Photo Verification**

```
┌─────────────┐
│   Visitor   │
│  (Arrives)  │
└──────┬──────┘
       │
       │ 1. Rings bell / Goes to gate
       │
       ▼
┌─────────────────────────────────────────┐
│  Guard (via Guard App)                  │
│  - Asks: "Who are you visiting?"        │
│  - Visitor: "Apartment 501, AC repair"  │
└──────┬──────────────────────────────────┘
       │
       │ 2. Guard captures info
       │
       ▼
┌─────────────────────────────────────────┐
│  Guard App - New Request Form           │
│  ┌───────────────────────────────────┐  │
│  │ Apartment: 501                    │  │
│  │ Visitor Name: Ahmed Hassan         │  │
│  │ Purpose: AC Repair                 │  │
│  │ [📸 Take Photo] ───────┐          │  │
│  └────────────────────────│──────────┘  │
└────────────────────────────┼─────────────┘
                             │
                             │ 3. Photo captured
                             │
                             ▼
                  ┌──────────────────────┐
                  │  File Storage        │
                  │  - Upload to /photos │
                  │  - Return URL        │
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┘
       │
       │ 4. POST /api/visitors/request-approval
       │    {
       │      resident_id: 123,
       │      visitor_name: "Ahmed Hassan",
       │      purpose: "AC Repair",
       │      photo_url: "/photos/visitor_123.jpg"
       │    }
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend API                            │
│  1. Create visitor record               │
│  2. Create visit_request (status=pending)│
│  3. Store in DB                         │
└──────┬──────────────────────────────────┘
       │
       │ 5. Visit request created (ID: 789)
       │
       ▼
┌─────────────────────────────────────────┐
│  Notification Service                   │
│  - Find resident by apartment: 501      │
│  - Send push notification               │
│  - Include photo URL, visitor name      │
└──────┬──────────────────────────────────┘
       │
       │ 6. Push notification sent
       │
       ▼
┌─────────────────────────────────────────┐
│  Resident App                           │
│  ┌───────────────────────────────────┐  │
│  │  🔔 Visitor at Gate               │  │
│  │  Ahmed Hassan - AC Repair         │  │
│  │  [Photo shown]                    │  │
│  │  [✅ Approve] [❌ Deny]           │  │
│  └───────────────────────────────────┘  │
└──────┬──────────────────────────────────┘
       │
       │ 7. Resident taps "Approve"
       │
       ▼
┌─────────────────────────────────────────┐
│  POST /api/visitors/approve             │
│  {                                      │
│    visit_request_id: 789,               │
│    valid_until: "16:30"  // +90 mins    │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       │ 8. Approval processed
       │
       ▼
┌─────────────────────────────────────────┐
│  Approval Engine                        │
│  - Update visit_request:                │
│    status = 'approved'                  │
│    approved_at = NOW()                  │
│    valid_from = NOW()                   │
│    valid_until = NOW() + 90 mins        │
│  - Generate access_code (QR data)       │
│  - Log in audit_log                     │
└──────┬──────────────────────────────────┘
       │
       │ 9. Database updated
       │
       ▼
┌─────────────────────────────────────────┐
│  Notification Service                   │
│  - Notify guard: "Approved! Valid until 4:30 PM"│
│  - Notify resident: "Access granted"    │
└──────┬──────────────────────────────────┘
       │
       │ 10. Guard app updates in real-time
       │
       ▼
┌─────────────────────────────────────────┐
│  Guard App - Status Display             │
│  ┌───────────────────────────────────┐  │
│  │  ✅ APPROVED                      │  │
│  │  Ahmed Hassan - AC Repair         │  │
│  │  Valid until: 4:30 PM             │  │
│  │  [Allow Entry]                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
       │
       │ 11. Guard taps "Allow Entry"
       │
       ▼
┌─────────────────────────────────────────┐
│  POST /api/visitors/check-in            │
│  - Update checked_in_at = NOW()         │
│  - Log in audit_log                     │
└─────────────────────────────────────────┘
```


***

### **Flow 3: Voice Input (Arabic)**

```
┌─────────────┐
│  Resident   │
│  (at home)  │
└──────┬──────┘
       │
       │ 1. Opens Resident App
       │
       ▼
┌─────────────────────────────────────────┐
│  Resident App - Voice Input Screen      │
│  ┌───────────────────────────────────┐  │
│  │  🎤 Hold to speak                 │  │
│  │  (Arabic or English)              │  │
│  └───────────────────────────────────┘  │
└──────┬──────────────────────────────────┘
       │
       │ 2. Resident speaks (in Arabic):
       │    "أتوقع صديقي أحمد الساعة ٦ مساءً"
       │    (Expecting my friend Ahmed at 6 PM)
       │
       ▼
┌─────────────────────────────────────────┐
│  Client-side Audio Capture              │
│  - MediaRecorder API                    │
│  - Record as .webm or .wav              │
│  - Stop on button release               │
└──────┬──────────────────────────────────┘
       │
       │ 3. Audio blob captured (3.2 seconds)
       │
       ▼
┌─────────────────────────────────────────┐
│  POST /api/voice/process                │
│  - FormData with audio file             │
│  - resident_id: 123                     │
└──────┬──────────────────────────────────┘
       │
       │ 4. Audio received by backend
       │
       ▼
┌─────────────────────────────────────────┐
│  Voice Processing Service               │
│  ┌───────────────────────────────────┐  │
│  │ Step 1: Language Detection        │  │
│  │ - Whisper model detects: Arabic   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Step 2: Transcription             │  │
│  │ - Whisper transcribe(audio, "ar") │  │
│  │ - Output: "أتوقع صديقي أحمد..."   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Step 3: Translation (if needed)   │  │
│  │ - Translate AR→EN for processing  │  │
│  │ - "Expecting friend Ahmed 6 PM"   │  │
│  └───────────────────────────────────┘  │
└──────┬──────────────────────────────────┘
       │
       │ 5. Transcript ready
       │
       ▼
┌─────────────────────────────────────────┐
│  NER (Named Entity Recognition)         │
│  - Use regex + simple NLP               │
│  - Extract:                             │
│    * Visitor name: "Ahmed"              │
│    * Relation: "friend"                 │
│    * Time: "6 PM" → 18:00              │
│    * Purpose: "visit" (implied)         │
└──────┬──────────────────────────────────┘
       │
       │ 6. Entities extracted
       │
       ▼
┌─────────────────────────────────────────┐
│  Approval Engine                        │
│  - Create visitor: name="Ahmed"         │
│  - Create visit_request:                │
│    * scheduled_time = 18:00 today       │
│    * status = 'approved'                │
│    * approval_method = 'voice'          │
│    * valid_from = 17:45                 │
│    * valid_until = 19:00                │
└──────┬──────────────────────────────────┘
       │
       │ 7. Auto-approved via voice
       │
       ▼
┌─────────────────────────────────────────┐
│  Response to Resident App               │
│  {                                      │
│    "success": true,                     │
│    "transcript": "أتوقع صديقي أحمد...", │
│    "extracted": {                       │
│      "visitor": "Ahmed",                │
│      "time": "6:00 PM",                 │
│      "purpose": "Friend visit"          │
│    },                                   │
│    "visit_request_id": 890              │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       │ 8. Confirmation shown
       │
       ▼
┌─────────────────────────────────────────┐
│  Resident App - Confirmation Screen     │
│  ┌───────────────────────────────────┐  │
│  │  ✅ Voice command processed       │  │
│  │  Visitor: Ahmed (Friend)          │  │
│  │  Expected: Today at 6:00 PM       │  │
│  │  [Edit] [Confirm]                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```


***

### **Flow 4: Recurring Visitor Auto-Approval**

```
┌─────────────┐
│  Resident   │
│  (One-time  │
│   Setup)    │
└──────┬──────┘
       │
       │ 1. Adds recurring visitor:
       │    "Maria (Cleaner) - Every Tue/Thu 9 AM"
       │
       ▼
┌─────────────────────────────────────────┐
│  POST /api/recurring-visitors           │
│  {                                      │
│    resident_id: 123,                    │
│    name: "Maria",                       │
│    purpose: "Cleaning",                 │
│    recurrence_type: "weekly",           │
│    days_of_week: ["tuesday", "thursday"],│
│    time_of_day: "09:00",                │
│    duration_minutes: 180                │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       │ 2. Stored in recurring_visitors table
       │
       ▼
┌─────────────────────────────────────────┐
│  Database                               │
│  recurring_visitors (id=10)             │
└─────────────────────────────────────────┘

       ... Time passes (next Tuesday morning) ...

┌─────────────────────────────────────────┐
│  Background Job (Cron)                  │
│  - Runs every hour: 00:00, 01:00, etc. │
│  - At 7:00 AM Tuesday:                  │
└──────┬──────────────────────────────────┘
       │
       │ 3. Check for recurring visitors due today
       │
       ▼
┌─────────────────────────────────────────┐
│  SELECT * FROM recurring_visitors       │
│  WHERE is_active = 1                    │
│    AND days_of_week LIKE '%tuesday%'    │
│    AND time_of_day BETWEEN NOW()        │
│        AND NOW() + INTERVAL 3 HOURS     │
└──────┬──────────────────────────────────┘
       │
       │ 4. Found: Maria (id=10) at 9:00 AM
       │
       ▼
┌─────────────────────────────────────────┐
│  Approval Engine                        │
│  - Check if already generated today:    │
│    * Query visit_requests for Maria     │
│      where scheduled_time = today 9 AM  │
│  - If not exists:                       │
│    * Create visit_request               │
│      status = 'approved'                │
│      approval_method = 'recurring_auto' │
│      valid_from = 08:45                 │
│      valid_until = 12:00                │
└──────┬──────────────────────────────────┘
       │
       │ 5. Auto-generated approval
       │
       ▼
┌─────────────────────────────────────────┐
│  Notification Service                   │
│  - SMS to resident (optional):          │
│    "Maria (Cleaner) approved for 9 AM"  │
│  - Update guard app: Expected visitors  │
└──────┬──────────────────────────────────┘
       │
       │ 6. Maria arrives at 9:15 AM
       │
       ▼
┌─────────────────────────────────────────┐
│  Guard checks status                    │
│  GET /api/visitors/check-status?name=Maria│
└──────┬──────────────────────────────────┘
       │
       │ 7. Response:
       │    ✅ Approved (Recurring - Cleaning)
       │    Valid until 12:00 PM
       │
       ▼
┌─────────────────────────────────────────┐
│  Guard allows entry                     │
│  POST /api/visitors/check-in            │
└─────────────────────────────────────────┘
```


***

## **4. API SPECIFICATIONS**

### **Authentication**

All requests require header:

```
Authorization: Bearer <token>
X-User-Type: resident | guard | admin
X-User-ID: <user_id>
```


***

### **Visitor Management APIs**

#### **POST /api/visitors/request-approval**

Guard creates new visitor request.

**Request:**

```json
{
  "resident_id": 123,
  "visitor": {
    "name": "Ahmed Hassan",
    "phone": "+971501234567",
    "purpose": "AC Repair",
    "visitor_type": "service",
    "photo": "<base64_image_or_url>",
    "id_document_type": "emirates_id",
    "id_document_number": "784-1990-1234567-1"
  },
  "scheduled_time": "2026-02-07T15:00:00Z",
  "expected_duration_minutes": 90
}
```

**Response:**

```json
{
  "success": true,
  "visit_request_id": 789,
  "status": "pending",
  "message": "Approval request sent to resident",
  "estimated_approval_time": "Within 5 minutes"
}
```


***

#### **POST /api/visitors/approve**

Resident approves visitor.

**Request:**

```json
{
  "visit_request_id": 789,
  "valid_until": "2026-02-07T16:30:00Z",
  "notes": "Please escort to apartment"
}
```

**Response:**

```json
{
  "success": true,
  "visit_request": {
    "id": 789,
    "status": "approved",
    "visitor_name": "Ahmed Hassan",
    "valid_from": "2026-02-07T15:00:00Z",
    "valid_until": "2026-02-07T16:30:00Z",
    "access_code": "VIS-789-2026",
    "qr_code_url": "/qr/789.png"
  }
}
```


***

#### **GET /api/visitors/check-status**

Guard checks if visitor is authorized.

**Query Params:**

- `visitor_id` OR `name` OR `access_code`

**Response:**

```json
{
  "status": "approved",
  "visitor": {
    "id": 456,
    "name": "Ahmed Hassan",
    "photo_url": "/photos/visitor_456.jpg",
    "purpose": "AC Repair"
  },
  "visit_request": {
    "id": 789,
    "apartment": "501",
    "resident_name": "Mohammed Al Zaabi",
    "valid_from": "2026-02-07T15:00:00Z",
    "valid_until": "2026-02-07T16:30:00Z",
    "time_remaining_minutes": 45,
    "is_expired": false
  },
  "action": "allow_entry"
}
```

**Status codes:**

- `approved` → Green light
- `pending` → Yellow, resident hasn't responded
- `denied` → Red, blocked
- `expired` → Red, time window passed
- `not_found` → Unknown visitor

***

#### **POST /api/visitors/check-in**

Guard logs visitor entry.

**Request:**

```json
{
  "visit_request_id": 789,
  "guard_id": 5
}
```

**Response:**

```json
{
  "success": true,
  "checked_in_at": "2026-02-07T15:10:00Z",
  "message": "Visitor checked in successfully"
}
```


***

#### **POST /api/visitors/check-out**

Guard logs visitor exit.

**Request:**

```json
{
  "visit_request_id": 789
}
```

**Response:**

```json
{
  "success": true,
  "checked_out_at": "2026-02-07T16:20:00Z",
  "actual_duration_minutes": 70,
  "overstay": false
}
```


***

### **Resident APIs**

#### **GET /api/residents/{id}/schedule-today**

Get today's expected visitors.

**Response:**

```json
{
  "date": "2026-02-07",
  "visitors": [
    {
      "id": 789,
      "visitor_name": "Ahmed Hassan",
      "purpose": "AC Repair",
      "scheduled_time": "15:00",
      "status": "approved",
      "approval_method": "manual",
      "valid_until": "16:30",
      "photo_url": "/photos/visitor_456.jpg"
    },
    {
      "id": 790,
      "visitor_name": "Noon Delivery",
      "purpose": "Package delivery",
      "scheduled_time": "14:00",
      "status": "approved",
      "approval_method": "calendar_auto",
      "valid_until": "14:30"
    }
  ],
  "stats": {
    "total": 2,
    "approved": 2,
    "pending": 0,
    "completed": 0
  }
}
```


***

#### **GET /api/residents/{id}/pending-approvals**

Get visitors awaiting approval.

**Response:**

```json
{
  "pending_requests": [
    {
      "id": 791,
      "visitor": {
        "name": "Unknown Person",
        "purpose": "Claims to be plumber",
        "photo_url": "/photos/visitor_457.jpg"
      },
      "requested_at": "2026-02-07T15:45:00Z",
      "guard_name": "Security Guard 2",
      "expires_in_minutes": 10
    }
  ]
}
```


***

### **Voice Processing APIs**

#### **POST /api/voice/process**

Process voice command to create visitor.

**Request:**

```
Content-Type: multipart/form-data

audio_file: <audio_blob>
resident_id: 123
```

**Response:**

```json
{
  "success": true,
  "processing": {
    "detected_language": "ar",
    "confidence": 0.94,
    "transcript_arabic": "أتوقع صديقي أحمد الساعة ٦ مساءً",
    "transcript_english": "Expecting my friend Ahmed at 6 PM"
  },
  "extracted_entities": {
    "visitor_name": "Ahmed",
    "relationship": "friend",
    "time": "18:00",
    "purpose": "Personal visit"
  },
  "visit_request": {
    "id": 792,
    "status": "approved",
    "scheduled_time": "2026-02-07T18:00:00Z",
    "valid_until": "2026-02-07T19:00:00Z"
  }
}
```


***

### **Recurring Visitors APIs**

#### **POST /api/recurring-visitors**

Add recurring visitor.

**Request:**

```json
{
  "resident_id": 123,
  "visitor": {
    "name": "Maria Lopez",
    "phone": "+971501234568",
    "purpose": "Cleaning",
    "photo": "<base64_or_url>"
  },
  "schedule": {
    "recurrence_type": "weekly",
    "days_of_week": ["tuesday", "thursday"],
    "time_of_day": "09:00",
    "duration_minutes": 180
  },
  "effective_from": "2026-02-08",
  "effective_until": "2026-12-31",
  "auto_approve": true
}
```

**Response:**

```json
{
  "success": true,
  "recurring_visitor_id": 10,
  "next_visit_date": "2026-02-11T09:00:00Z",
  "message": "Recurring visitor added. Will auto-approve on scheduled days."
}
```


***

## **5. BACKGROUND SERVICES ARCHITECTURE**

```python
# services/background_jobs.py

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

# Job 1: Generate recurring visitor approvals
@scheduler.scheduled_job('cron', hour='*/1')  # Every hour
def generate_recurring_approvals():
    """
    Check for recurring visitors due in next 3 hours.
    Auto-create approved visit_requests.
    """
    upcoming_window = datetime.now() + timedelta(hours=3)
    
    recurring = db.query("""
        SELECT * FROM recurring_visitors
        WHERE is_active = 1
          AND effective_from <= DATE('now')
          AND (effective_until IS NULL OR effective_until >= DATE('now'))
    """)
    
    for visitor in recurring:
        if should_generate_today(visitor):
            create_auto_approval(visitor)
            log_audit("system", "auto_approve_recurring", visitor.id)

# Job 2: Expire old approvals
@scheduler.scheduled_job('cron', minute='*/5')  # Every 5 minutes
def expire_old_approvals():
    """
    Update approved visits to 'expired' if past valid_until.
    """
    db.execute("""
        UPDATE visit_requests
        SET status = 'expired'
        WHERE status = 'approved'
          AND valid_until < CURRENT_TIMESTAMP
    """)
    
    # Notify guards about expired visitors still on premises
    expired_checked_in = db.query("""
        SELECT * FROM visit_requests
        WHERE status = 'expired'
          AND checked_in_at IS NOT NULL
          AND checked_out_at IS NULL
    """)
    
    for visit in expired_checked_in:
        notify_guard_overstay(visit)

# Job 3: Calendar sync
@scheduler.scheduled_job('cron', minute='*/15')  # Every 15 minutes
def sync_calendars():
    """
    Fetch new events from Google/Outlook calendars.
    Auto-approve if keywords detected.
    """
    residents_with_sync = db.query("""
        SELECT * FROM residents
        WHERE calendar_sync_enabled = 1
    """)
    
    for resident in residents_with_sync:
        events = fetch_calendar_events(resident.calendar_url)
        
        for event in events:
            if is_visitor_event(event):
                process_calendar_event(resident.id, event)

# Job 4: Send expiry warnings
@scheduler.scheduled_job('cron', minute='*/10')  # Every 10 minutes
def send_expiry_warnings():
    """
    Warn residents/guards about approvals expiring in 15 min.
    """
    expiring_soon = db.query("""
        SELECT * FROM visit_requests
        WHERE status = 'approved'
          AND valid_until BETWEEN CURRENT_TIMESTAMP 
              AND CURRENT_TIMESTAMP + INTERVAL 15 MINUTE
          AND checked_in_at IS NULL
    """)
    
    for visit in expiring_soon:
        notify_resident_expiring(visit)
        notify_guard_expiring(visit)

scheduler.start()
```


***

## **6. SECURITY \& COMPLIANCE**

### **Data Security Measures**

1. **Photo Storage**
    - Photos stored locally in `/data/photos/` directory
    - Filename: `visitor_{id}_{timestamp}.jpg`
    - Auto-delete after 30 days (GDPR compliance)
    - Access controlled via signed URLs (15-min expiry)
2. **Access Control**
    - JWT tokens with 24-hour expiry
    - Role-based: `resident`, `guard`, `admin`
    - Rate limiting: 100 requests/minute per user
3. **Audit Trail**
    - Every action logged in `audit_log`
    - Immutable records (no DELETE, only INSERT)
    - Retention: 1 year
4. **UAE Pass Integration** (Future)
    - OAuth 2.0 flow for resident authentication
    - Verified Emirates ID linkage
    - Eliminates fake accounts

***

## **7. SCALABILITY CONSIDERATIONS**

### **Phase 1: Demo (3 hours)**

- Single SQLite file
- Local file storage
- Polling for notifications
- Max 1 building, 50 residents


### **Phase 2: Production (Post-Hackathon)**

- PostgreSQL database
- AWS S3 for photos
- WebSocket for real-time updates
- Redis for caching
- Multi-building support


### **Database Optimization**

```sql
-- Add indexes for performance
CREATE INDEX idx_visit_resident_date ON visit_requests(resident_id, scheduled_time);
CREATE INDEX idx_visit_status_time ON visit_requests(status, valid_until);
CREATE INDEX idx_recurring_active ON recurring_visitors(is_active, recurrence_type);
```


***

## **8. ERROR HANDLING \& EDGE CASES**

### **Edge Case Scenarios**

1. **Visitor arrives early (before valid_from)**
    - Guard sees: ⏳ "Early arrival - Expected at 2:00 PM"
    - Option: "Allow early entry?" → Requires resident re-approval
2. **Resident approves but visitor never arrives**
    - Auto-cancel after valid_until + 1 hour
    - Log as "no-show" in audit trail
3. **Network failure during approval**
    - Client retries with exponential backoff
    - Guard sees cached status (last sync timestamp shown)
4. **Duplicate voice commands**
    - Deduplicate by comparing transcript similarity within 60 seconds
    - Ask resident: "Did you mean the same visitor as 30 seconds ago?"
5. **Conflicting calendar events**
    - If 2 events at same time, create both approvals
    - Guard sees: "2 visitors expected at 2 PM"

***

This architecture is production-ready conceptually but simplified for your 3-hour demo. Focus on flows 2 \& 3 (photo approval + voice) for maximum impact. Want me to generate starter code for any specific component?


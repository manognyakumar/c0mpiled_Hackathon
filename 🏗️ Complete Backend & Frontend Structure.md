<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## 🏗️ Complete Backend \& Frontend Structure


***

## **BACKEND ARCHITECTURE**

### **Project Structure**

```
backend/
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Dependencies
├── config.py                    # Configuration (DB path, secrets, etc.)
├── database.py                  # SQLite connection & session management
├── models.py                    # SQLAlchemy ORM models
├── schemas.py                   # Pydantic request/response schemas
├── auth.py                      # Authentication middleware
│
├── api/                         # API route modules
│   ├── __init__.py
│   ├── visitors.py             # Visitor request/approval endpoints
│   ├── residents.py            # Resident dashboard endpoints
│   ├── guards.py               # Guard check-in/status endpoints
│   ├── voice.py                # Voice processing endpoints
│   ├── recurring.py            # Recurring visitor management
│   └── calendar.py             # Calendar sync endpoints
│
├── services/                    # Business logic layer
│   ├── __init__.py
│   ├── approval_engine.py      # Core approval logic
│   ├── voice_processor.py      # Whisper transcription + NER
│   ├── notification_service.py # Push/SMS notifications
│   ├── calendar_sync.py        # Google/Outlook integration
│   ├── time_validator.py       # Time window enforcement
│   └── photo_manager.py        # Photo upload/storage
│
├── utils/                       # Helper functions
│   ├── __init__.py
│   ├── ner_extractor.py        # Extract name/time from text
│   ├── qr_generator.py         # Generate QR codes
│   └── audit_logger.py         # Audit trail logging
│
├── background/                  # Background jobs
│   ├── __init__.py
│   ├── scheduler.py            # APScheduler setup
│   ├── recurring_generator.py  # Auto-create recurring approvals
│   └── expiry_checker.py       # Mark expired approvals
│
└── data/                        # Data storage
    ├── database.db             # SQLite file
    ├── photos/                 # Visitor photos
    └── audio/                  # Voice recordings (temp)
```


***

### **Backend Endpoints Specification**

#### **1. Visitor Management (`/api/visitors`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/request-approval` | POST | Guard | Create new visitor request | `visitor_info`, `resident_id`, `photo` | `visit_request_id`, `status` |
| `/approve` | POST | Resident | Approve pending visitor | `visit_request_id`, `valid_until` | Updated `visit_request` object |
| `/deny` | POST | Resident | Deny visitor | `visit_request_id`, `reason` | Confirmation message |
| `/check-status` | GET | Guard | Check if visitor authorized | `?name=` or `?access_code=` | `status`, `valid_until`, visitor info |
| `/check-in` | POST | Guard | Log visitor entry | `visit_request_id`, `guard_id` | `checked_in_at` timestamp |
| `/check-out` | POST | Guard | Log visitor exit | `visit_request_id` | `checked_out_at`, `duration` |
| `/cancel` | POST | Resident | Cancel approved visitor | `visit_request_id` | Confirmation |
| `/history` | GET | Resident | Past visitors for apartment | `?resident_id=`, `?date_from=` | Array of past visits |


***

#### **2. Resident Dashboard (`/api/residents`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/{id}/schedule-today` | GET | Resident | Today's expected visitors | - | Array of visits for today |
| `/{id}/schedule-week` | GET | Resident | This week's schedule | - | Array grouped by date |
| `/{id}/pending-approvals` | GET | Resident | Visitors awaiting approval | - | Array of pending requests |
| `/{id}/notifications` | GET | Resident | Recent notifications | `?unread_only=true` | Array of notifications |
| `/{id}/settings` | GET/PUT | Resident | Preferences (language, etc.) | `preferred_language`, `auto_approve_deliveries` | Updated settings |
| `/{id}/stats` | GET | Resident | Usage statistics | - | `total_visitors`, `avg_per_week`, etc. |


***

#### **3. Guard Operations (`/api/guards`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/active-approvals` | GET | Guard | All currently valid visitors | `?building_id=` | Array of approved visits (not expired) |
| `/search-visitor` | GET | Guard | Search by name/phone | `?query=` | Matching visitors with status |
| `/expected-today` | GET | Guard | All visitors expected today | `?building_id=` | Grouped by time slot |
| `/recent-activity` | GET | Guard | Recent check-ins/outs | `?hours=6` | Activity log |
| `/upload-photo` | POST | Guard | Upload visitor photo | Multipart file | `photo_url` |


***

#### **4. Voice Processing (`/api/voice`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/process` | POST | Resident | Convert voice to visitor | Audio file (multipart) | Transcript, extracted entities, created visit |
| `/test-transcribe` | POST | Any | Test transcription only | Audio file | Transcript in AR/EN |


***

#### **5. Recurring Visitors (`/api/recurring-visitors`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/` | POST | Resident | Add recurring visitor | `visitor_info`, `schedule`, `resident_id` | `recurring_visitor_id` |
| `/` | GET | Resident | List all recurring | `?resident_id=` | Array of recurring visitors |
| `/{id}` | PUT | Resident | Update schedule/status | Updated fields | Confirmation |
| `/{id}` | DELETE | Resident | Remove recurring visitor | - | Confirmation |
| `/{id}/pause` | POST | Resident | Temporarily pause | `pause_until` date | Confirmation |
| `/{id}/history` | GET | Resident | Past auto-approvals | - | Array of generated visits |


***

#### **6. Calendar Integration (`/api/calendar`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/connect` | POST | Resident | Link Google/Outlook calendar | `provider`, `auth_token` | Connection status |
| `/sync` | POST | Resident | Manually trigger sync | - | `events_processed`, `approvals_created` |
| `/disconnect` | DELETE | Resident | Unlink calendar | - | Confirmation |
| `/events` | GET | Resident | View synced events | `?date=` | Array of calendar events |


***

#### **7. Admin \& Audit (`/api/admin`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/audit-log` | GET | Admin | Export audit trail | `?start_date=`, `?end_date=` | CSV/JSON of all actions |
| `/building-stats` | GET | Admin | Building-level metrics | `?building_id=` | Dashboard data |
| `/emergency-lockdown` | POST | Admin | Revoke all approvals | `building_id`, `reason` | Confirmation |


***

#### **8. Authentication (`/api/auth`)**

| Endpoint | Method | Actor | Purpose | Request Body | Response |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `/login` | POST | All | Login with credentials | `phone`, `password` OR `uae_pass_token` | JWT token |
| `/logout` | POST | All | Invalidate token | - | Confirmation |
| `/refresh` | POST | All | Refresh JWT | `refresh_token` | New access token |
| `/verify` | GET | All | Check token validity | - | User info |


***

### **Backend Service Functions**

#### **services/approval_engine.py**

```python
class ApprovalEngine:
    
    def create_manual_approval(self, visitor_data, resident_id):
        """
        Guard-initiated request pending resident approval.
        """
        # 1. Create/find visitor record
        # 2. Create visit_request with status='pending'
        # 3. Send notification to resident
        # 4. Log in audit_log
        pass
    
    def approve_visitor(self, visit_request_id, resident_id, valid_until):
        """
        Resident approves pending request.
        """
        # 1. Update visit_request: status='approved', valid_from=now
        # 2. Generate access_code
        # 3. Notify guard
        # 4. Log audit
        pass
    
    def auto_approve_from_calendar(self, resident_id, event_data):
        """
        Auto-approve based on calendar event.
        """
        # 1. Extract visitor info from event title/description
        # 2. Create visit_request with status='approved'
        # 3. Set approval_method='calendar_auto'
        # 4. No notification (just add to schedule)
        pass
    
    def auto_approve_recurring(self, recurring_visitor_id):
        """
        Generate today's approval for recurring visitor.
        """
        # 1. Get recurring_visitor details
        # 2. Check if already generated today
        # 3. Create visit_request with status='approved'
        # 4. Set approval_method='recurring_auto'
        pass
    
    def check_visitor_status(self, identifier):
        """
        Guard checks if visitor is authorized.
        Returns: status, time_remaining, visitor_info
        """
        # 1. Find visit_request by name/access_code
        # 2. Check status and time window
        # 3. Return enriched status object
        pass
    
    def is_approval_valid(self, visit_request_id):
        """
        Validate time window and status.
        """
        # Check: status='approved' AND now BETWEEN valid_from AND valid_until
        pass
```


***

#### **services/voice_processor.py**

```python
class VoiceProcessor:
    
    def __init__(self):
        self.whisper_model = whisper.load_model("base")
    
    def process_voice_command(self, audio_file_path, resident_id):
        """
        Full pipeline: transcribe → extract → create approval.
        """
        # 1. Detect language
        language = self.detect_language(audio_file_path)
        
        # 2. Transcribe
        transcript = self.transcribe(audio_file_path, language)
        
        # 3. Extract entities
        entities = self.extract_visitor_info(transcript, language)
        
        # 4. Create approval
        if entities['visitor_name']:
            visit = self.create_voice_approval(resident_id, entities)
            return {
                "success": True,
                "transcript": transcript,
                "entities": entities,
                "visit_request_id": visit.id
            }
        else:
            return {"success": False, "error": "Could not extract visitor info"}
    
    def transcribe(self, audio_path, language):
        """
        Use Whisper to convert audio to text.
        """
        result = self.whisper_model.transcribe(audio_path, language=language)
        return result["text"]
    
    def extract_visitor_info(self, text, language):
        """
        NER: Extract name, time, purpose.
        """
        # Use regex patterns for Arabic/English
        # Return: {visitor_name, time, purpose, relation}
        pass
    
    def detect_language(self, audio_path):
        """
        Auto-detect AR vs EN.
        """
        result = self.whisper_model.transcribe(audio_path, task="detect")
        return result["language"]
```


***

#### **services/time_validator.py**

```python
class TimeValidator:
    
    def calculate_validity_window(self, scheduled_time, buffer_minutes=15):
        """
        Calculate valid_from (15 min early) and valid_until.
        """
        valid_from = scheduled_time - timedelta(minutes=buffer_minutes)
        valid_until = scheduled_time + timedelta(minutes=90)  # Default 90 min window
        return valid_from, valid_until
    
    def is_within_window(self, visit_request):
        """
        Check if current time is within approval window.
        """
        now = datetime.now()
        return visit_request.valid_from <= now <= visit_request.valid_until
    
    def get_time_remaining(self, visit_request):
        """
        Minutes until expiry.
        """
        now = datetime.now()
        if now > visit_request.valid_until:
            return 0
        return int((visit_request.valid_until - now).total_seconds() / 60)
```


***

#### **services/notification_service.py**

```python
class NotificationService:
    
    def notify_resident_new_request(self, resident_id, visit_request):
        """
        Push notification: "Visitor at gate".
        """
        # For demo: Store in notifications table
        # Production: Use FCM/APNS
        pass
    
    def notify_guard_approval_granted(self, guard_id, visit_request):
        """
        Update guard app: "Visitor approved".
        """
        pass
    
    def notify_expiring_soon(self, visit_request):
        """
        Warn 15 min before expiry.
        """
        pass
    
    def send_sms(self, phone, message):
        """
        Use Twilio free tier for SMS.
        """
        pass
```


***

### **Critical Backend Functions**

#### **utils/ner_extractor.py**

```python
import re
from datetime import datetime, timedelta

def extract_visitor_entities(text, language='en'):
    """
    Extract visitor name, time, purpose from natural language.
    
    Examples:
    - "Expecting Ahmed at 6 PM" → {name: "Ahmed", time: "18:00"}
    - "أتوقع صديقي أحمد الساعة ٦ مساءً" → {name: "Ahmed", time: "18:00"}
    """
    entities = {
        "visitor_name": None,
        "time": None,
        "purpose": "visit",
        "relation": None
    }
    
    # Time extraction (works for both AR/EN)
    time_patterns = [
        r'(\d{1,2})\s*(am|pm|AM|PM)',  # "6 PM"
        r'(\d{1,2}):(\d{2})',           # "18:00"
        r'الساعة\s*(\d+)',              # Arabic: "الساعة ٦"
    ]
    
    for pattern in time_patterns:
        match = re.search(pattern, text)
        if match:
            entities["time"] = normalize_time(match.group())
            break
    
    # Name extraction (simple approach)
    if language == 'ar':
        # Arabic names often after "صديقي" or proper nouns
        name_match = re.search(r'صديقي\s+(\w+)', text)
        if name_match:
            entities["visitor_name"] = name_match.group(1)
            entities["relation"] = "friend"
    else:
        # English: Capitalize words not in common words list
        common_words = ['expecting', 'friend', 'at', 'visit', 'my', 'the']
        words = text.split()
        for word in words:
            if word.lower() not in common_words and word[0].isupper():
                entities["visitor_name"] = word
                break
    
    # Purpose detection
    purpose_keywords = {
        'delivery': ['delivery', 'package', 'courier', 'noon', 'amazon'],
        'repair': ['repair', 'fix', 'maintenance', 'plumber', 'electrician'],
        'cleaning': ['clean', 'maid', 'cleaner'],
        'guest': ['friend', 'family', 'guest', 'visit']
    }
    
    text_lower = text.lower()
    for purpose, keywords in purpose_keywords.items():
        if any(kw in text_lower for kw in keywords):
            entities["purpose"] = purpose
            break
    
    return entities

def normalize_time(time_str):
    """
    Convert various time formats to HH:MM.
    """
    # Implementation for 12h → 24h conversion
    pass
```


***

## **FRONTEND ARCHITECTURE**

### **Project Structure**

```
frontend/
├── package.json
├── next.config.js              # Lingo.dev integration
├── public/
│   └── assets/
│
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing/login
│   │   │
│   │   ├── resident/           # Resident app routes
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/      # Today's schedule
│   │   │   ├── approvals/      # Pending requests
│   │   │   ├── recurring/      # Manage recurring
│   │   │   ├── voice/          # Voice input
│   │   │   └── settings/       # Preferences
│   │   │
│   │   └── guard/              # Guard app routes
│   │       ├── layout.tsx
│   │       ├── check/          # Status checker
│   │       ├── request/        # Create new request
│   │       └── activity/       # Recent activity log
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Base components (buttons, cards)
│   │   ├── visitor/            # Visitor-specific components
│   │   │   ├── VisitorCard.tsx
│   │   │   ├── ApprovalRequest.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── TimelineView.tsx
│   │   ├── voice/
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── TranscriptDisplay.tsx
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── LanguageToggle.tsx
│   │       └── NotificationBell.tsx
│   │
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client (fetch wrapper)
│   │   ├── auth.ts             # Auth helpers
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useVisitors.ts
│   │   │   ├── useApprovals.ts
│   │   │   └── useVoiceInput.ts
│   │   └── utils.ts            # Helper functions
│   │
│   ├── styles/
│   │   ├── globals.css         # Perplexity design tokens
│   │   └── variables.css       # CSS custom properties
│   │
│   └── types/
│       ├── visitor.ts          # TypeScript interfaces
│       ├── approval.ts
│       └── api.ts
```


***

### **Frontend Screens \& Functionality**

#### **RESIDENT APP**

##### **1. Dashboard (`/resident/dashboard`)**

**Purpose:** Today's visitor schedule at a glance

**Components:**

- `<TodaySchedule />` - Timeline of expected visitors
- `<QuickStats />` - "3 visitors today, 1 pending approval"
- `<VoiceInputButton />` - Floating action button

**State Management:**

```typescript
const [visitors, setVisitors] = useState<Visit[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Poll every 30 seconds for updates
  const interval = setInterval(() => {
    fetchTodaySchedule();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

**API Calls:**

- `GET /api/residents/{id}/schedule-today`
- `GET /api/residents/{id}/pending-approvals` (badge count)

**UI Elements:**

- Timeline with time slots (8 AM → 10 PM)
- Each visitor card shows:
    - ✅ Status indicator (approved/pending/completed)
    - 👤 Name + purpose
    - ⏰ Time window
    - 📸 Photo (if available)
    - Method badge (📅 Calendar, 🎤 Voice, 🔄 Recurring)

***

##### **2. Approval Requests (`/resident/approvals`)**

**Purpose:** Review and approve/deny pending visitors

**Components:**

- `<ApprovalCard />` - Full-screen card per visitor
- `<PhotoViewer />` - Zoomable photo
- `<ApprovalControls />` - Approve/Deny buttons with time picker

**State:**

```typescript
const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);

const handleApprove = async (requestId: number, validUntil: string) => {
  await api.post('/api/visitors/approve', {
    visit_request_id: requestId,
    valid_until: validUntil
  });
  
  // Remove from pending list
  setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  
  // Show success toast
  toast.success('Visitor approved!');
};
```

**API Calls:**

- `GET /api/residents/{id}/pending-approvals`
- `POST /api/visitors/approve`
- `POST /api/visitors/deny`

**UI Elements:**

- Swipeable cards (Tinder-style)
- Large photo display
- Guard name + timestamp
- "Approve for" time selector (30 min / 1 hr / 2 hrs / Custom)
- Quick actions: "Block this visitor permanently"

***

##### **3. Voice Input (`/resident/voice`)**

**Purpose:** Add visitor via voice command

**Components:**

- `<VoiceRecorder />` - Microphone button with waveform
- `<TranscriptDisplay />` - Show recognized text
- `<EntityConfirmation />` - Extracted visitor info for confirmation

**Flow:**

```typescript
const [recording, setRecording] = useState(false);
const [transcript, setTranscript] = useState('');
const [extractedData, setExtractedData] = useState(null);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    await sendToBackend(audioBlob);
  };
  
  mediaRecorder.start();
  setRecording(true);
};

const sendToBackend = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio_file', audioBlob);
  formData.append('resident_id', userId);
  
  const response = await api.post('/api/voice/process', formData);
  
  setTranscript(response.data.processing.transcript_english);
  setExtractedData(response.data.extracted_entities);
};
```

**API Calls:**

- `POST /api/voice/process` (multipart/form-data)

**UI Elements:**

- Circular record button (hold to speak)
- Waveform animation during recording
- Language indicator (🇸🇦 AR / 🇬🇧 EN)
- Transcript display in both languages
- Confirmation screen: "I understood: Visitor Ahmed at 6 PM. Correct?"

***

##### **4. Recurring Visitors (`/resident/recurring`)**

**Purpose:** Manage cleaners, nannies, regular service providers

**Components:**

- `<RecurringList />` - Cards for each recurring visitor
- `<AddRecurringModal />` - Form to add new
- `<ScheduleEditor />` - Visual schedule picker

**State:**

```typescript
const [recurringVisitors, setRecurringVisitors] = useState<RecurringVisitor[]>([]);

const addRecurring = async (visitorData: RecurringVisitorInput) => {
  const response = await api.post('/api/recurring-visitors', visitorData);
  setRecurringVisitors(prev => [...prev, response.data]);
};

const toggleActive = async (visitorId: number, isActive: boolean) => {
  await api.put(`/api/recurring-visitors/${visitorId}`, { is_active: isActive });
};
```

**API Calls:**

- `GET /api/recurring-visitors?resident_id={id}`
- `POST /api/recurring-visitors`
- `PUT /api/recurring-visitors/{id}`
- `POST /api/recurring-visitors/{id}/pause`

**UI Elements:**

- Card per visitor with photo, name, schedule summary
- Toggle switch: Active/Paused
- "Next visit: Tuesday 9 AM" badge
- "View history" → Shows past auto-approvals

***

##### **5. Settings (`/resident/settings`)**

**Purpose:** Preferences and integrations

**Sections:**

- **Language**: AR/EN toggle (persisted, used by Lingo.dev)
- **Calendar Sync**: Connect Google/Outlook
- **Auto-Approvals**: "Automatically approve deliveries from Noon/Amazon"
- **Notifications**: Push/SMS preferences
- **Security**: Change password, view audit log

**API Calls:**

- `GET /api/residents/{id}/settings`
- `PUT /api/residents/{id}/settings`
- `POST /api/calendar/connect`

***

#### **GUARD APP**

##### **1. Status Checker (`/guard/check`)**

**Purpose:** Quick lookup if visitor is authorized

**Components:**

- `<SearchBar />` - Input name/access code
- `<StatusDisplay />` - Large status indicator
- `<VisitorDetails />` - Photo, apartment, time remaining

**State:**

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [visitorStatus, setVisitorStatus] = useState<VisitorStatus | null>(null);
const [loading, setLoading] = useState(false);

const checkVisitor = async () => {
  setLoading(true);
  const response = await api.get('/api/visitors/check-status', {
    params: { name: searchQuery }
  });
  setVisitorStatus(response.data);
  setLoading(false);
};
```

**API Calls:**

- `GET /api/visitors/check-status?name={query}`
- `POST /api/visitors/check-in` (when allowing entry)

**UI Elements:**

- Large search input (keyboard-friendly)
- Status indicator:
    - ✅ **GREEN**: "APPROVED - Allow Entry" + expiry time
    - ⏳ **YELLOW**: "PENDING - Waiting for resident"
    - ❌ **RED**: "DENIED / EXPIRED - Do Not Allow"
    - ⚠️ **GRAY**: "UNKNOWN - Not in system"
- Action buttons: [Allow Entry] [Request Approval] [Block]

***

##### **2. Request Approval (`/guard/request`)**

**Purpose:** Create new visitor request on behalf of visitor

**Components:**

- `<VisitorForm />` - Name, purpose, apartment input
- `<PhotoCapture />` - Camera interface
- `<ApartmentLookup />` - Search resident by apartment

**Flow:**

```typescript
const [formData, setFormData] = useState({
  apartment: '',
  visitorName: '',
  purpose: '',
  photo: null
});

const capturePhoto = async () => {
  // Use device camera or file upload
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const video = document.createElement('video');
  video.srcObject = stream;
  video.play();
  
  // Capture frame to canvas after 3 seconds
  setTimeout(() => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      setFormData(prev => ({ ...prev, photo: blob }));
      stream.getTracks().forEach(track => track.stop());
    }, 'image/jpeg');
  }, 3000);
};

const submitRequest = async () => {
  const formDataObj = new FormData();
  formDataObj.append('resident_id', residentId);
  formDataObj.append('visitor_name', formData.visitorName);
  formDataObj.append('purpose', formData.purpose);
  formDataObj.append('photo', formData.photo);
  
  const response = await api.post('/api/visitors/request-approval', formDataObj);
  
  // Show waiting screen
  setWaitingForApproval(true);
  startPolling(response.data.visit_request_id);
};

const startPolling = (requestId: number) => {
  const interval = setInterval(async () => {
    const status = await api.get(`/api/visitors/check-status?visit_id=${requestId}`);
    
    if (status.data.status === 'approved') {
      clearInterval(interval);
      showApprovedScreen();
    } else if (status.data.status === 'denied') {
      clearInterval(interval);
      showDeniedScreen();
    }
  }, 3000); // Poll every 3 seconds
};
```

**API Calls:**

- `POST /api/visitors/request-approval`
- `GET /api/visitors/check-status` (polling)

**UI Elements:**

- Apartment number input with autocomplete
- Visitor name input
- Purpose dropdown (Delivery / Service / Guest / Other)
- Photo capture button with preview
- "Submit Request" → Waiting screen with spinner
- Real-time update when resident approves/denies

***

##### **3. Active Visitors (`/guard/activity`)**

**Purpose:** See who's currently on premises

**Components:**

- `<ActiveVisitorsList />` - Currently checked-in visitors
- `<ExpectedVisitorsList />` - Upcoming approved visitors
- `<RecentActivity />` - Last 6 hours of check-ins/outs

**State:**

```typescript
const [activeVisitors, setActiveVisitors] = useState<Visit[]>([]);
const [expectedVisitors, setExpectedVisitors] = useState<Visit[]>([]);

useEffect(() => {
  const fetchData = async () => {
    const [active, expected] = await Promise.all([
      api.get('/api/guards/active-approvals'),
      api.get('/api/guards/expected-today')
    ]);
    
    setActiveVisitors(active.data.filter(v => v.checked_in_at && !v.checked_out_at));
    setExpectedVisitors(expected.data.filter(v => !v.checked_in_at));
  };
  
  fetchData();
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, []);
```

**API Calls:**

- `GET /api/guards/active-approvals`
- `GET /api/guards/expected-today`
- `POST /api/visitors/check-out` (when visitor leaves)

**UI Elements:**

- Two tabs: "On Premises" / "Expected"
- Cards with:
    - Visitor name + photo
    - Apartment number
    - Entered at + duration
    - [Check Out] button
- Expiry warnings: "Expires in 10 min" (red badge)

***

### **Frontend State Management**

#### **Custom Hooks**

**`hooks/useVisitors.ts`**

```typescript
export function useVisitors(residentId: number) {
  const [visitors, setVisitors] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchVisitors = async () => {
    try {
      const response = await api.get(`/api/residents/${residentId}/schedule-today`);
      setVisitors(response.data.visitors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 30000);
    return () => clearInterval(interval);
  }, [residentId]);
  
  return { visitors, loading, error, refetch: fetchVisitors };
}
```

**`hooks/useApprovals.ts`**

```typescript
export function useApprovals(residentId: number) {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  
  const approve = async (requestId: number, validUntil: string) => {
    await api.post('/api/visitors/approve', { visit_request_id: requestId, valid_until: validUntil });
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };
  
  const deny = async (requestId: number, reason: string) => {
    await api.post('/api/visitors/deny', { visit_request_id: requestId, reason });
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };
  
  return { pendingRequests, approve, deny };
}
```

**`hooks/useVoiceInput.ts`**

```typescript
export function useVoiceInput() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const startRecording = async () => { /* ... */ };
  const stopRecording = () => { /* ... */ };
  const processAudio = async (audioBlob: Blob) => { /* ... */ };
  
  return { recording, transcript, startRecording, stopRecording };
}
```


***

### **Frontend TypeScript Interfaces**

**`types/visitor.ts`**

```typescript
export interface Visitor {
  id: number;
  name: string;
  phone?: string;
  purpose: string;
  visitor_type: 'delivery' | 'guest' | 'service' | 'other';
  photo_url?: string;
}

export interface Visit {
  id: number;
  visitor: Visitor;
  resident: {
    id: number;
    apartment: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'completed';
  scheduled_time: string;
  valid_from: string;
  valid_until: string;
  checked_in_at?: string;
  checked_out_at?: string;
  approval_method: 'manual' | 'calendar_auto' | 'recurring_auto' | 'voice';
}

export interface PendingRequest extends Visit {
  requested_at: string;
  guard_name: string;
  expires_in_minutes: number;
}

export interface RecurringVisitor {
  id: number;
  visitor: Visitor;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
  days_of_week: string[];
  time_of_day: string;
  is_active: boolean;
  next_visit_date: string;
}
```


***

### **Key Frontend Features**

#### **Real-Time Updates**

**Option 1: Polling (3-hour demo)**

```typescript
// Simple polling every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refetchData();
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

**Option 2: WebSockets (production)**

```typescript
// Future enhancement
const socket = io('ws://backend:8000');
socket.on('approval_granted', (data) => {
  updateVisitorStatus(data.visit_request_id, 'approved');
});
```


***

#### **Offline Support (Optional)**

```typescript
// Cache last successful response
const cachedData = localStorage.getItem('visitors_cache');
if (!navigator.onLine && cachedData) {
  setVisitors(JSON.parse(cachedData));
}
```


***

#### **Error Handling**

```typescript
// Global error boundary
export function ApiErrorHandler({ error }: { error: Error }) {
  if (error.message.includes('401')) {
    return <div>Session expired. <button onClick={relogin}>Login again</button></div>;
  }
  
  if (error.message.includes('Network')) {
    return <div>No internet connection. Retrying...</div>;
  }
  
  return <div>Something went wrong. Please refresh.</div>;
}
```


***

## **Integration Points Summary**

| Frontend Component | Backend Endpoint | Update Frequency |
| :-- | :-- | :-- |
| Resident Dashboard | `/residents/{id}/schedule-today` | Poll every 30s |
| Pending Approvals | `/residents/{id}/pending-approvals` | Poll every 10s |
| Guard Status Check | `/visitors/check-status` | On-demand |
| Guard Request Form | `/visitors/request-approval` → Poll status | Poll every 3s after submit |
| Voice Input | `/voice/process` | On-demand |
| Recurring Visitors | `/recurring-visitors` | On page load |
| Active Visitors (Guard) | `/guards/active-approvals` | Poll every 30s |


***

This structure gives you:

- **Clear separation** between resident/guard concerns
- **Reusable components** (VisitorCard, StatusBadge)
- **Optimistic updates** (approve → immediately remove from UI)
- **Real-time feel** (polling + instant UI feedback)
- **Type safety** (TypeScript interfaces)

Want me to generate starter code for any specific component or endpoint?


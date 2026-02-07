<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## 👥 3-Person Team Allocation (3-Hour Sprint)

Based on your AI/ML + backend + full-stack background, here's the optimal division:

***

## **Person 1: Backend + AI/Voice Lead**

**Core Responsibility:** API, database, intelligent logic

### Hour 1: Foundation (0:00 - 1:00)

- [ ] Set up FastAPI project structure
- [ ] Create SQLite database with schema:

```sql
CREATE TABLE residents (id, apt_number, name, phone, preferred_language);
CREATE TABLE visitors (id, name, purpose, photo_url, timestamp);
CREATE TABLE approvals (id, resident_id, visitor_id, status, 
                        valid_from, valid_until, approval_method, created_at);
CREATE TABLE recurring_visitors (id, resident_id, name, schedule, 
                                  time_window, photo_url);
CREATE TABLE audit_log (id, timestamp, resident_id, visitor_id, 
                        action, guard_id);
```

- [ ] Implement core API endpoints:

```python
POST /api/visitors/request-approval
POST /api/visitors/approve
POST /api/visitors/deny
GET  /api/visitors/check-status/{visitor_id}
GET  /api/residents/{id}/schedule-today
```

- [ ] Add basic authentication (simple token for demo)


### Hour 2: AI/Voice Integration (1:00 - 2:00)

- [ ] **Voice input processing:**

```python
# Using Whisper locally (free)
import whisper
model = whisper.load_model("base")

@app.post("/api/voice/process")
async def process_voice(audio_file):
    result = model.transcribe(audio_file, language="ar")  # or "en"
    # Extract: visitor name, time, purpose
    visitor_data = extract_visitor_info(result["text"])
    return create_approval(visitor_data)
```

- [ ] **Calendar integration stub** (can mock for demo):

```python
@app.post("/api/calendar/sync")
def sync_calendar(resident_id, calendar_url):
    # For demo: just parse a sample JSON
    events = [
        {"title": "Noon Delivery", "time": "14:00"},
        {"title": "AC Technician", "time": "16:00"}
    ]
    for event in events:
        auto_create_approval(resident_id, event)
```

- [ ] **Time-window enforcement logic:**

```python
def is_approval_valid(approval_id):
    approval = db.get_approval(approval_id)
    now = datetime.now().time()
    return approval.valid_from <= now <= approval.valid_until
```


### Hour 3: Polish + Integration (2:00 - 3:00)

- [ ] Implement recurring visitor auto-approval cron logic
- [ ] Add audit logging to all endpoints
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Help Person 2 \& 3 with API integration issues
- [ ] Prepare backend demo flow

**Skills needed:** Python, FastAPI, SQLite, Whisper/audio processing

***

## **Person 2: Resident App (Frontend) + Lingo.dev**

**Core Responsibility:** User-facing interface, multilingual support

### Hour 1: Setup + Core UI (0:00 - 1:00)

- [ ] Set up React app (or Next.js if team prefers)

```bash
npx create-next-app resident-app
cd resident-app
npm install lingo.dev axios date-fns
```

- [ ] Create basic layout with 3 screens:

1. **Today's Schedule** (landing page)
2. **Approval Requests** (notification-style)
3. **Recurring Visitors** (management)
- [ ] Build "Today's Schedule" component:

```jsx
function TodaySchedule() {
  const [visitors, setVisitors] = useState([]);
  
  useEffect(() => {
    fetch('/api/residents/123/schedule-today')
      .then(res => res.json())
      .then(data => setVisitors(data.visitors));
  }, []);
  
  return (
    <div className="schedule">
      {visitors.map(v => (
        <VisitorCard 
          name={v.name} 
          time={v.time_window} 
          status={v.status} 
        />
      ))}
    </div>
  );
}
```


### Hour 2: Approval Flow + Voice (1:00 - 2:00)

- [ ] **Approval Request Screen:**

```jsx
function ApprovalRequest({ visitor }) {
  const approve = () => {
    fetch('/api/visitors/approve', {
      method: 'POST',
      body: JSON.stringify({
        visitor_id: visitor.id,
        valid_until: calculateExpiry()  // +90 mins
      })
    });
  };
  
  return (
    <div className="approval-card">
      <img src={visitor.photo_url} />
      <h3>{visitor.name} - {visitor.purpose}</h3>
      <button onClick={approve}>✅ Approve</button>
      <button onClick={deny}>❌ Deny</button>
    </div>
  );
}
```

- [ ] **Voice input component:**

```jsx
function VoiceInput() {
  const [recording, setRecording] = useState(false);
  
  const recordAndSend = async () => {
    // Use browser MediaRecorder API
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const recorder = new MediaRecorder(stream);
    // ... record blob, send to /api/voice/process
  };
  
  return (
    <button onMouseDown={startRecording} onMouseUp={stopRecording}>
      🎤 Hold to speak (Arabic/English)
    </button>
  );
}
```

- [ ] Add simple push notification handling (or just polling for demo)


### Hour 3: Lingo.dev + Styling (2:00 - 3:00)

- [ ] **Set up Lingo.dev:**

```javascript
// next.config.js
import lingoCompiler from "lingo.dev/compiler";

export default lingoCompiler.next({
  sourceLocale: "en",
  targetLocales: ["ar"],
  models: { "*:*": "groq:mistral-saba-24b" }
})(nextConfig);

// In components, use normal strings - auto-translated
<h1>Today's Visitors</h1>  // becomes "زوار اليوم" in Arabic
```

- [ ] Add language toggle button (top-right corner)
- [ ] Apply **Perplexity design system** tokens:

```css
:root {
  --color-primary: #38bdf8;        /* Teal */
  --color-bg-base: #0f172a;        /* Dark slate */
  --color-text: #f1f5f9;           /* Light text */
}

.card {
  background: var(--color-bg-base);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}
```

- [ ] Add responsive design (mobile-first)
- [ ] Create 3 demo scenarios with pre-loaded data

**Skills needed:** React/Next.js, CSS, REST APIs, basic audio recording

***

## **Person 3: Guard App + Photo Upload + Dashboard**

**Core Responsibility:** Security interface, photo handling, admin view

### Hour 1: Guard App Core (0:00 - 1:00)

- [ ] Set up separate simple React app (or same repo, different route)
- [ ] Build main guard screen: "Check Visitor"

```jsx
function GuardCheck() {
  const [searchQuery, setSearchQuery] = useState('');
  const [visitorStatus, setVisitorStatus] = useState(null);
  
  const checkVisitor = async () => {
    const res = await fetch(`/api/visitors/check-status/${searchQuery}`);
    const data = await res.json();
    setVisitorStatus(data);
  };
  
  return (
    <div className="guard-app">
      <input 
        placeholder="Enter visitor name or ID" 
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={checkVisitor}>🔍 Check Status</button>
      
      {visitorStatus && (
        <StatusDisplay 
          status={visitorStatus.status}  // approved/pending/expired
          validUntil={visitorStatus.valid_until}
          photo={visitorStatus.photo_url}
        />
      )}
    </div>
  );
}
```

- [ ] Create status indicators with clear visual feedback:
    - ✅ Green: Approved (show expiry time)
    - ⏳ Yellow: Pending resident approval
    - ❌ Red: Denied or expired
    - ⚠️ Gray: Unknown visitor


### Hour 2: Photo Upload + Request Flow (1:00 - 2:00)

- [ ] **Photo capture component:**

```jsx
function PhotoCapture() {
  const [photo, setPhoto] = useState(null);
  
  const capturePhoto = async () => {
    // Use browser camera API or file upload
    const stream = await navigator.mediaDevices.getUserMedia({video:true});
    const video = document.querySelector('video');
    video.srcObject = stream;
    
    // Capture frame to canvas, convert to blob
    const canvas = document.createElement('canvas');
    canvas.getContext('2d').drawImage(video, 0, 0);
    const blob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/jpeg')
    );
    
    uploadPhoto(blob);
  };
  
  return (
    <>
      <video autoPlay></video>
      <button onClick={capturePhoto}>📸 Capture</button>
    </>
  );
}
```

- [ ] **Request approval flow:**

```jsx
function RequestApproval() {
  const submitRequest = async (visitorData) => {
    const formData = new FormData();
    formData.append('photo', photoBlob);
    formData.append('name', visitorData.name);
    formData.append('purpose', visitorData.purpose);
    formData.append('apartment', visitorData.apt);
    
    await fetch('/api/visitors/request-approval', {
      method: 'POST',
      body: formData
    });
    
    // Show "Waiting for resident approval..." state
  };
}
```

- [ ] Add simple polling to check if resident approved (every 5 seconds)


### Hour 3: Recurring Visitors + Final Integration (2:00 - 3:00)

- [ ] **Recurring visitor management screen** (for residents):

```jsx
function RecurringVisitors() {
  const [visitors, setVisitors] = useState([]);
  
  const addRecurring = (visitorData) => {
    fetch('/api/recurring-visitors', {
      method: 'POST',
      body: JSON.stringify({
        name: "Maria (Cleaner)",
        schedule: "every_tuesday_thursday",
        time_window: "09:00-12:00",
        photo: photoUrl
      })
    });
  };
  
  return (
    <div>
      {visitors.map(v => (
        <RecurringCard 
          name={v.name}
          schedule={v.schedule}
          nextVisit={calculateNext(v.schedule)}
        />
      ))}
      <button onClick={openAddModal}>+ Add Recurring Visitor</button>
    </div>
  );
}
```

- [ ] Build simple **Admin Dashboard** (stretch goal if time permits):
    - Today's total visitors: 12
    - Pending approvals: 2
    - Auto-approved (recurring): 5
- [ ] Help Person 2 with styling consistency
- [ ] Test photo upload end-to-end with Person 1's backend
- [ ] Prepare guard app demo flow

**Skills needed:** React, camera/media APIs, form handling, real-time updates

***

## 🔄 Critical Integration Points

### Every 30 Minutes: Sync Meeting (5 min each)

- **0:30** - "API contracts agreed? Schema finalized?"
- **1:00** - "Can Person 2/3 hit Person 1's endpoints?"
- **1:30** - "Photo upload working? Voice input tested?"
- **2:00** - "Lingo.dev translating? Guard app showing real data?"
- **2:30** - "Demo scenarios loaded? All 3 apps talking?"


### Shared Responsibilities

- **All 3:** Use GitHub (or zip folder sharing via WhatsApp if GitHub issues)
- **All 3:** Use same design tokens (Person 2 creates `styles.css`, others import)
- **Person 1 + 2:** Voice input testing together
- **Person 1 + 3:** Photo upload testing together

***

## 📱 Testing Strategy (Last 15 Minutes - All 3)

### Scenario 1: Scheduled Visitor

1. Person 1: Manually insert calendar event in DB
2. Person 2: Show it appearing in "Today's Schedule"
3. Person 3: Guard checks status → sees ✅ approved

### Scenario 2: Unscheduled with Photo

1. Person 3: Guard captures photo, submits request
2. Person 2: Approval notification appears
3. Person 2: Taps approve
4. Person 3: Guard app updates to ✅ in real-time

### Scenario 3: Voice Input (Arabic)

1. Person 2: Records Arabic phrase (or plays pre-recorded)
2. Person 1: Shows transcription + extracted data in terminal
3. Person 2: New visitor appears in schedule
4. Person 3: Guard can now check this visitor

***

## 🎯 Division Summary

| Person | Focus | Output |
| :-- | :-- | :-- |
| **Person 1** | Backend + Intelligence | 6 API endpoints + DB + Voice/Calendar logic |
| **Person 2** | Resident Experience | 3 screens + Lingo.dev + Voice UI |
| **Person 3** | Guard Experience | Check/Photo/Request screens + Recurring mgmt |

**Communication:** Create WhatsApp group, share API endpoint list at 0:30 mark, test integrations at 1:30 and 2:30.

***

## ⚠️ Backup Plan (If Running Behind)

**Cut these features if needed:**

- ❌ Calendar integration (just manual entry)
- ❌ Voice input (just text form)
- ❌ Recurring visitors (focus on one-time approvals)

**Keep these no matter what:**

- ✅ Photo upload + approval flow
- ✅ Time-window enforcement
- ✅ Guard status check
- ✅ Today's schedule view

***

Want me to generate:

1. **Starter code templates** for each person?
2. **API contract document** (JSON request/response examples)?
3. **Shared `constants.js`** file with design tokens?
4. **Demo script** with exact button clicks for each person?

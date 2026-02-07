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
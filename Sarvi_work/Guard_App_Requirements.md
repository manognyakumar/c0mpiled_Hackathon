# Guard App Requirements

## Overview
The Guard App is a security interface designed to manage visitor access, handle photo uploads, and provide a dashboard for recurring visitor management. This document outlines the requirements and tasks for the Guard App development.

---

## Core Responsibilities
1. **Guard App Core**
   - Build the main guard screen for checking visitor status.
   - Display visitor status with clear visual indicators.
2. **Photo Upload**
   - Implement a photo capture component using the browser's camera API.
   - Enable photo uploads for visitor approval requests.
3. **Recurring Visitor Management**
   - Create a screen for managing recurring visitors.
   - Allow residents to add and view recurring visitors.
4. **Admin Dashboard** (Stretch Goal)
   - Display visitor statistics, such as total visitors and pending approvals.

---

## Functional Requirements

### 1. Guard App Core
- **Visitor Status Check**
  - Input field for visitor name or ID.
  - Button to check visitor status via `/api/visitors/check-status/:id`.
  - Display visitor status with the following indicators:
    - ✅ Green: Approved (show expiry time).
    - ⏳ Yellow: Pending resident approval.
    - ❌ Red: Denied or expired.
    - ⚠️ Gray: Unknown visitor.

### 2. Photo Upload
- **Photo Capture Component**
  - Use the browser's camera API to capture photos.
  - Convert captured frames to blobs and upload them.
- **Visitor Request Approval Flow**
  - Submit visitor data (name, purpose, apartment, photo) to `/api/visitors/request-approval`.
  - Poll the server every 5 seconds to check for resident approval.

### 3. Recurring Visitor Management
- **Recurring Visitor Screen**
  - Allow residents to add recurring visitors with schedules.
  - Display recurring visitors and their next visit times.

### 4. Admin Dashboard (Stretch Goal)
- **Visitor Statistics**
  - Total visitors for the day.
  - Pending approvals.
  - Auto-approved recurring visitors.

---

## Integration Points
- Collaborate with **Person 1** for backend API testing (photo upload, visitor status).
- Collaborate with **Person 2** for styling consistency and approval notifications.

---

## Testing Strategy
- **Scenario 1: Scheduled Visitor**
  1. Manually insert calendar event in the database.
  2. Verify it appears in "Today's Schedule."
  3. Guard checks status → sees ✅ approved.
- **Scenario 2: Unscheduled Visitor with Photo**
  1. Guard captures photo and submits request.
  2. Resident receives approval notification.
  3. Resident approves request.
  4. Guard app updates to ✅ in real-time.
- **Scenario 3: Voice Input (Arabic)**
  1. Resident records Arabic phrase.
  2. Backend processes transcription and extracts data.
  3. Visitor appears in schedule.
  4. Guard checks visitor status.

---

## Backup Plan
- **Cut these features if running behind:**
  - Calendar integration.
  - Voice input.
  - Recurring visitor management.
- **Keep these features no matter what:**
  - Photo upload and approval flow.
  - Time-window enforcement.
  - Guard status check.
  - Today's schedule view.

---

## Communication Plan
- Sync meetings every 30 minutes to ensure API contracts, schema, and integrations are working.
- Use GitHub or zip folder sharing for collaboration.
- Share API endpoint list at the 0:30 mark and test integrations at 1:30 and 2:30.

---

## Deliverables
- Functional Guard App with:
  - Visitor status check.
  - Photo upload and approval flow.
  - Recurring visitor management.
- Admin dashboard (if time permits).
- Demo flow prepared for presentation.
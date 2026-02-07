# Backend Integration Guide for Person 3

This document outlines the steps required to fully integrate the backend for the Guard App (Person 3). It includes database setup, photo upload service, recurring visitor management, notifications, authentication, and testing.

---

## 1. Database Integration

### Database Setup
- Use **SQLite** (or another database like PostgreSQL/MySQL for production).
- Define models using **SQLAlchemy** or an ORM of your choice.
- Create tables for:
  - **Guards**: Stores guard credentials and details.
  - **Visitors**: Stores visitor information (name, phone, photo, etc.).
  - **Approvals**: Tracks visitor approvals (status, timestamps, etc.).
  - **Recurring Visitors**: Manages recurring visitor schedules.
  - **Audit Logs**: Logs actions performed by guards (optional).

### Steps to Interlink with the Database:
1. **Define Models**:
   - Ensure all models are defined in `models.py` (e.g., `Guard`, `Visitor`, `Approval`, `RecurringVisitor`).

2. **Database Initialization**:
   - Add a function to initialize the database and create tables if they don’t exist:
     ```python
     # filepath: backend/db.py
     from sqlalchemy import create_engine
     from sqlalchemy.orm import sessionmaker
     from models import Base

     DATABASE_URL = "sqlite:///./database.db"

     engine = create_engine(DATABASE_URL)
     SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

     def init_db():
         Base.metadata.create_all(bind=engine)
     ```

3. **Use Dependency Injection**:
   - Add a dependency to get a database session in your API endpoints:
     ```python
     from fastapi import Depends
     from sqlalchemy.orm import Session
     from db import SessionLocal

     def get_db():
         db = SessionLocal()
         try:
             yield db
         finally:
             db.close()
     ```

4. **CRUD Operations**:
   - Use SQLAlchemy queries to perform Create, Read, Update, and Delete (CRUD) operations in your endpoints.

---

## 2. Photo Upload Service

### Steps:
1. **File Storage**:
   - Store photos in a local directory (e.g., `uploads/`) or use cloud storage (e.g., AWS S3, Azure Blob Storage).
   - Example for local storage:
     ```python
     import os
     from fastapi import UploadFile

     UPLOAD_DIR = "uploads/"

     def save_photo(visitor_id: int, file: UploadFile):
         os.makedirs(UPLOAD_DIR, exist_ok=True)
         file_path = os.path.join(UPLOAD_DIR, f"{visitor_id}.jpg")
         with open(file_path, "wb") as f:
             f.write(file.file.read())
         return file_path
     ```

2. **Database Link**:
   - Store the file path or URL in the `Visitor` table:
     ```python
     visitor.photo_url = file_path
     db.add(visitor)
     db.commit()
     ```

3. **Endpoints**:
   - Implement `/api/photos/upload`, `/api/photos/{visitor_id}` (GET), and `/api/photos/{visitor_id}` (DELETE).

---

## 3. Recurring Visitor Management

### Steps:
1. **Recurring Visitor Table**:
   - Add fields like `visitor_id`, `schedule` (e.g., daily, weekly), and `time_window`.

2. **Approval Generation**:
   - Create a function to generate approvals for recurring visitors:
     ```python
     def generate_recurring_approvals(db: Session):
         recurring_visitors = db.query(RecurringVisitor).all()
         for rv in recurring_visitors:
             # Check if an approval is needed for today
             if should_generate_approval(rv):
                 approval = Approval(visitor_id=rv.visitor_id, status="pending")
                 db.add(approval)
         db.commit()
     ```

3. **Endpoint**:
   - Add `/api/recurring-visitors/generate-today` to trigger this function.

---

## 4. Notifications

### Steps:
1. **Notification Service**:
   - Create a service to send notifications:
     ```python
     def send_notification(guard_id: int, message: str):
         # Example: Print notification (replace with email/SMS logic)
         print(f"Notification to Guard {guard_id}: {message}")
     ```

2. **Trigger Notifications**:
   - Call the notification service when:
     - A visitor is approved or denied.
     - A recurring visitor is scheduled.

3. **Endpoint**:
   - Add `/api/notifications` to send notifications manually.

---

## 5. Authentication

### Steps:
1. **Guard Authentication**:
   - Add a `username` and `password` field to the `Guard` table.
   - Use **OAuth2** or **JWT** for authentication.

2. **Login Endpoint**:
   - Create an endpoint to authenticate guards and return a token:
     ```python
     @app.post("/api/login")
     def login(username: str, password: str, db: Session = Depends(get_db)):
         guard = db.query(Guard).filter(Guard.username == username).first()
         if guard and guard.verify_password(password):
             return {"token": create_jwt_token(guard.id)}
         raise HTTPException(status_code=401, detail="Invalid credentials")
     ```

3. **Protect Endpoints**:
   - Add a dependency to verify tokens:
     ```python
     from fastapi.security import OAuth2PasswordBearer

     oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

     def get_current_guard(token: str = Depends(oauth2_scheme)):
         # Decode token and return guard info
         ...
     ```

---

## 6. Testing

### Steps:
1. **Set Up Test Database**:
   - Use an in-memory SQLite database for testing.

2. **Write Tests**:
   - Use **pytest** to write tests for each endpoint:
     ```python
     def test_create_visitor(client):
         response = client.post("/api/visitors/request-approval", json={...})
         assert response.status_code == 200
     ```

3. **Run Tests**:
   - Run tests using:
     ```bash
     pytest
     ```

---

## Checklist
Here’s a checklist of what you need to do:

1. **Database**:
   - [ ] Define models and initialize the database.
   - [ ] Add CRUD operations for guards, visitors, approvals, and recurring visitors.

2. **Photo Upload**:
   - [ ] Implement file storage and link photos to the database.
   - [ ] Add endpoints for uploading, retrieving, and deleting photos.

3. **Recurring Visitors**:
   - [ ] Add logic to generate approvals for recurring visitors.
   - [ ] Add endpoints for managing recurring visitors.

4. **Notifications**:
   - [ ] Implement a notification service.
   - [ ] Trigger notifications for approvals and recurring visitors.

5. **Authentication**:
   - [ ] Add guard authentication using OAuth2 or JWT.
   - [ ] Protect all endpoints.

6. **Testing**:
   - [ ] Write unit tests for all endpoints and services.

---

Let me know if you need help with any specific part!
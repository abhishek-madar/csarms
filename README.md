# CSARMS - College Student Academic Record Management System

A unified academic management platform featuring Role-Based Access Control (RBAC), real-time notifications, and automated attendance tracking.

## Unified Deployment (Single Port)

The project is now configured for monolithic deployment. You can run both the Frontend and Backend on a single port (5001).

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (in `backend/.env`)

### How to Run

1. **Build the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Start the Backend**:
   ```bash
   cd ../backend
   npm install
   node server.js
   ```

3. **Access the App**:
   Open [http://localhost:5001](http://localhost:5001) in your browser.

## Features
- **Admin**: Manage HODs and view system stats.
- **HOD**: Manage faculty and departments.
- **Faculty**: Create courses, add students, update marks, and track attendance.
- **Student**: View academic records, attendance summary, and faculty profiles (restricted to own teachers).

## Security Note
Students are restricted to viewing only the profiles of faculty members who are assigned to their enrolled courses. This is enforced at both the API and UI levels.

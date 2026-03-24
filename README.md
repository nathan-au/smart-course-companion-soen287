# Smart Course Companion

**Smart Course Companion** is a full-stack web application for university students and administrators to manage courses, track grades, and monitor academic progress throughout the semester.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Database Schema](#database-schema)
6. [Backend API Reference](#backend-api-reference)
7. [Frontend Pages & Components](#frontend-pages--components)
8. [User Roles](#user-roles)
9. [Features](#features)
10. [Seed Data](#seed-data)

---

## Project Overview

Smart Course Companion provides two distinct experiences:

- **Students** can browse and enroll in courses, log their assessment marks, track course averages, and view upcoming pending assessments.
- **Admins** can manage the course catalog (add, edit, enable/disable, delete), manage assessments per course, and view enrollment and completion statistics.

---

## Tech Stack

### Backend
| Package | Purpose |
|---|---|
| `express` v5 | HTTP server and routing |
| `better-sqlite3` | Synchronous SQLite database driver |
| `bcrypt` | Password hashing |
| `cors` | Cross-origin resource sharing |
| `nodemon` | Development auto-reload |

### Frontend
| Package | Purpose |
|---|---|
| `react` v19 | UI framework |
| `react-router-dom` v7 | Client-side routing |
| `react-calendar` | Calendar widget |
| `tailwindcss` v4 + `daisyui` v5 | Utility-first CSS + component library |
| `vite` | Build tool and dev server |

---

## Project Structure

```
project-root/
├── backend/
│   ├── server.js         # Express server, DB setup, all API routes
│   ├── seed.js           # Database seed script (users, courses, assessments)
│   ├── package.json
│   └── database.db       # SQLite database (auto-created on first run)
│
└── frontend/
    ├── src/
    │   ├── main.jsx              # App entry point, router setup
    │   ├── App.jsx               # Landing page
    │   ├── index.css             # Global styles (Tailwind + DaisyUI)
    │   ├── components/
    │   │   ├── Navbar.jsx                    # Top navigation bar with profile modal
    │   │   └── admin/
    │   │       ├── AddCourse.jsx             # Add course form
    │   │       ├── CourseList.jsx            # Course list with edit/stats modals
    │   │       └── DashboardStatistics.jsx   # Student/course count stats
    │   └── pages/
    │       ├── auth/
    │       │   ├── SignIn.jsx
    │       │   └── SignUp.jsx
    │       ├── admin/
    │       │   └── AdminDashboard.jsx
    │       └── student/
    │           └── StudentDashboard.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Seed the Database (Optional)

Populates the database with sample users, 38 courses, and 3 assessments per course.

```bash
node seed.js
```

**Default accounts created by the seed:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@mail.com | 123 |
| Student | student@mail.com | 123 |

### 3. Start the Backend Server

```bash
npm run dev
# Server runs on http://localhost:3001
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 5. Start the Frontend Dev Server

```bash
npm run dev
# App runs on http://localhost:5173 (default Vite port)
```

---

## Database Schema

The SQLite database (`database.db`) is automatically created when the backend server starts.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT | Full name |
| `email` | TEXT | Unique |
| `password` | TEXT | bcrypt hashed |
| `role` | TEXT | `"Admin"` or `"Student"` |

### `courses`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT | e.g. `"Web Programming"` |
| `code` | TEXT | Unique, e.g. `"SOEN 287"` |
| `instructor` | TEXT | |
| `term` | TEXT | e.g. `"Winter 2026"` |
| `enabled` | INTEGER | `1` = visible to students, `0` = hidden |

### `assessments`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `course_id` | INTEGER FK | References `courses(id)` — cascades on delete |
| `name` | TEXT | e.g. `"Midterm Exam"` |
| `category` | TEXT | `Assignment`, `Exam`, `Lab`, `Quiz`, or `Project` |
| `description` | TEXT | Optional |
| `weight` | REAL | Percentage weight (e.g. `35`) |
| `due_date` | TEXT | Optional ISO date string |

### `enrollments`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `user_id` | INTEGER FK | References `users(id)` |
| `course_id` | INTEGER FK | References `courses(id)` |
| — | UNIQUE | `(user_id, course_id)` |

### `marks`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `assessment_id` | INTEGER FK | References `assessments(id)` |
| `user_id` | INTEGER FK | References `users(id)` |
| `earned` | REAL | Score earned (e.g. `82`) |
| `total` | REAL | Score out of (e.g. `100`) |
| `status` | TEXT | `"Pending"` (default) or `"Complete"` |
| — | UNIQUE | `(user_id, assessment_id)` |

---

## Backend API Reference

All endpoints are served at `http://localhost:3001`. Request/response bodies are JSON.

### Auth

#### `POST /signup`
Register a new student account.

**Body:** `{ name, email, password }`  
**Response:** `{ id, name, email, role }`  
**Errors:** `400` if fields missing, email invalid, or email already taken.

---

#### `POST /signin`
Authenticate a user.

**Body:** `{ email, password }`  
**Response:** `{ id, name, email, role }`  
**Errors:** `400` if fields missing or email invalid. `401` if credentials are wrong.

---

#### `POST /edit-user`
Update the current user's profile.

**Body:** `{ id, name, email, password? }`  
Omit or leave `password` blank to keep the existing password.  
**Response:** `{ success: true }`

---

### Users

#### `GET /users`
Returns all users.

#### `GET /students`
Returns all users with `role = "Student"`.

---

### Courses

#### `GET /courses`
Returns all courses (admin use).

#### `GET /enabled-courses`
Returns only courses where `enabled = 1` (student-facing).

#### `POST /add-course`
**Body:** `{ name, code, instructor, term }`  
**Errors:** `400` if any field is missing or `code` already exists.

#### `POST /edit-course`
**Body:** `{ id, name, code, instructor, term }`

#### `POST /delete-course`
**Body:** `{ id }`  
Cascades: deletes all assessments and associated marks.

#### `POST /toggle-course`
Toggles the `enabled` flag between `0` and `1`.  
**Body:** `{ id }`

---

### Assessments

#### `GET /assessments`
Returns all assessments.

#### `POST /course-assessments`
Returns all assessments for a given course.  
**Body:** `{ course_id }`

#### `POST /add-assessment`
**Body:** `{ course_id, name, category, description?, weight, due_date? }`  
**Errors:** `400` if required fields are missing or `weight` is invalid (must be > 0 and ≤ 100).

#### `POST /delete-assessment`
**Body:** `{ id }`  
Cascades: deletes all marks for this assessment.

---

### Enrollments

#### `GET /enrollments`
Returns all enrollment records.

#### `POST /user-enrollments`
Returns all courses a student is enrolled in.  
**Body:** `{ user_id }`

#### `POST /enroll`
Enroll a student in a course.  
**Body:** `{ user_id, course_id }`

#### `POST /unenroll`
Remove a student from a course. Also deletes all their marks for that course's assessments.  
**Body:** `{ user_id, course_id }`

---

### Marks & Progress

#### `GET /marks`
Returns all mark records.

#### `POST /student-assessments`
Returns all assessments for a course, joined with the student's mark data.  
**Body:** `{ user_id, course_id }`  
**Response:** Array of assessment objects, each extended with `earned`, `total`, `status`.

#### `POST /save-mark`
Upsert (insert or update) a mark record.  
**Body:** `{ user_id, assessment_id, earned?, total?, status? }`  
**Errors:** `400` if `earned > total`, `total <= 0`, mismatched earned/total, or invalid status.

#### `POST /student-upcoming-assessments`
Returns all pending (non-complete) assessments across all of a student's enrolled courses, ordered by due date.  
**Body:** `{ user_id }`

#### `POST /all-course-averages`
Returns a weighted average (based on assessment `weight`) for each enrolled course. Only `Complete` marks are included in the calculation.  
**Body:** `{ user_id }`  
**Response:** `{ [course_id]: "85.50" | null, ... }`

---

### Statistics (Admin)

#### `GET /admin-course-statistics`
Returns all courses with enrollment count and per-assessment completion counts.

#### `POST /course-statistics`
Same as above but for a single course.  
**Body:** `{ course_id }`

---

## Frontend Pages & Components

### Routes

| Path | Component | Access |
|---|---|---|
| `/` | `App` | Public — landing page |
| `/auth/signup` | `SignUp` | Public |
| `/auth/signin` | `SignIn` | Public |
| `/admin/dashboard` | `AdminDashboard` | Admin only |
| `/student/dashboard` | `StudentDashboard` | Student only |

Role-based access is enforced client-side on mount: users are redirected to the correct dashboard or back to `/` based on the `role` stored in `localStorage`.

---

### Components

#### `Navbar`
Top navigation bar present on all dashboard pages. Displays the app name and user role. Contains a dropdown with:
- **Profile** — opens a modal to edit name, email, and password.
- **Sign Out** — clears `localStorage` and navigates to `/`.

**Props:** `user`, `setUser`

---

#### `admin/DashboardStatistics`
Displays total student and course counts in a stats card.

**Props:** `courses`

---

#### `admin/AddCourse`
Form to add a new course (name, code, instructor, term).

**Props:** `courses`, `setCourses`

---

#### `admin/CourseList`
Paginated list of all courses. Each course row includes:
- **Enable / Disable** toggle buttons.
- **View** — opens a stats modal showing enrollment count and per-assessment completion progress bars.
- **Edit** — opens a modal to edit course details, manage existing assessments (delete), and add new assessments.
- **Delete** — deletes the course with confirmation.

**Props:** `courses`, `setCourses`

---

### Pages

#### `SignUp` / `SignIn`
Simple auth forms. On success, user data is stored in `localStorage` and the user is redirected to the appropriate dashboard.

---

#### `AdminDashboard`
Three-tab layout:
1. **Course List** — renders `CourseList`
2. **Add Course** — renders `AddCourse`

Also renders `DashboardStatistics` at the top.

---

#### `StudentDashboard`
Three-tab layout:

1. **Course List** — Cards for each enrolled course showing the weighted average and a progress bar. Clicking a card opens the enrollment modal.

2. **Enrollment** — Lists available (enabled, not yet enrolled) courses with an enroll button.

3. **Upcoming Assessments** — Lists all pending assessments sorted by due date with a quick "mark complete" button.

**Enrollment Modal** — Displays all assessments for the selected course. Students can set each assessment's status (`Pending` / `Complete`) and enter `earned` / `total` scores. A "Save All" button persists changes to the backend.

---

## User Roles

### Student
- Sign up / sign in
- Edit own profile (name, email, password)
- Browse enabled courses and enroll / unenroll
- View and update assessment marks per course
- Track weighted course averages
- View upcoming (pending) assessments across all enrolled courses

### Admin
- Sign in (admin accounts are created manually or via seed)
- View total student and course counts
- Add, edit, delete courses
- Enable or disable courses (controls student visibility)
- Add and delete assessments per course
- View per-course enrollment count and assessment completion statistics

---

## Seed Data

Running `node seed.js` from the `backend/` directory populates the database with:

- **2 users:** one Admin (`admin@mail.com`) and one Student (`student@mail.com`), both with password `123`.
- **38 courses** spanning Computer Science, Mathematics, Physics, and Engineering departments — all set to `Winter 2026`.
- **3 assessments per course:** `Assignment 1` (20%), `Midterm Exam` (35%), and `Final Exam` (45%).

All insert statements use `INSERT OR IGNORE` to avoid duplicate errors on repeated runs.

---

## Notes

- **Authentication** is session-less. The user object (id, name, email, role) is stored in `localStorage` after sign-in and read on every page load. There are no JWTs or server-side sessions.
- **Weighted average calculation** uses only assessments marked `Complete` with valid `earned` and `total` values. The formula is: `(Σ (earned/total) × weight) / Σ weight × 100`.
- **Unenrolling** a student also deletes all their marks for that course's assessments.
- **Deleting a course** cascades to delete all its assessments and any marks associated with those assessments.

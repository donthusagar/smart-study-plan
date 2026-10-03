# Smart Study Planner 🎓
### An Intelligent Full-Stack Academic Productivity & Scheduling Platform

Smart Study Planner is an enterprise-grade productivity web application built for engineering and college students. It solves student burnout and poor semester preparation by combining algorithmic study scheduling, syllabus topic tracking, real-time exam countdown clocks, Pomodoro focus tracking, Recharts data analytics, and Gemini AI-powered academic advisory.

---

## 1. Project Introduction

College curricula often overwhelm students with multiple concurrent laboratory subjects, continuous evaluations, assignments, and semester-end exams. **Smart Study Planner** acts as a personal academic co-pilot:

- Balances difficult and easy subjects.
- Allocates more revision and practice to weak areas.
- Generates conflict-free daily and weekly study blocks.
- Tracks assignment completion with status boards.
- Keeps stress in check using science-backed Pomodoro intervals.

---

## 2. Key Features

- **Personalized Study Plans**: Algorithmic scheduling considering exam date, subject difficulty, subject priority, student weak subjects, available study hours, and preferred study time windows (Morning, Afternoon, Evening, Night).
- **Subject & Topic Management**: Course syllabus breakdown into modular topics. Automatic recalculation of subject completion percentage as topics are checked off.
- **Assignment & Task Manager**: Prioritize tasks across Todo, In Progress, and Completed states with estimated completion times and subject tags.
- **Live Exam Countdown**: Real-time ticker counting down days, hours, minutes, and seconds until upcoming tests, paired with syllabus readiness gauges.
- **Interactive Calendar**: Weekly schedule navigator with single-click session completion and block scheduling.
- **Pomodoro Focus Timer**: Customizable 25-minute focus intervals and 5/15-minute breaks with audio chimes and backend session persistence.
- **Progress & Analytics**: Recharts data visualizations including weekly study hours by activity type, subject focus share donut charts, and 14-day daily focus velocity trends.
- **AI Academic Assistant**: Floating and full-page conversational AI advisor powered by Google's `gemini-3.8-flash` model, contextualized with the student's real enrolled courses, pending topics, and nearest deadlines.
- **Notification System**: Navbar reminder drawer alerting students of upcoming study sessions, pending homework, and milestone countdowns.
- **Dark & Light Mode**: Persistent theme toggle respecting student preferences.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, React Router v7, Tailwind CSS v4, Motion |
| **Icons & Visuals** | Lucide React |
| **Charts** | Recharts (Responsive Bar, Line, Pie & Donut Charts) |
| **HTTP Client** | Axios with JWT interceptors |
| **Backend** | Node.js, Express.js (REST API Architecture) |
| **Database** | MongoDB + Mongoose Schemas (with embedded datastore fallback) |
| **Authentication** | JSON Web Tokens (JWT) + Bcrypt password hashing |
| **AI Integration** | `@google/genai` TypeScript SDK (`gemini-3.8-flash`) |

---

## 4. Project Architecture

```text
smart-study-planner/
│
├── client/ (or unified full-stack src/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Modals, Floating AI Assistant
│   │   │   └── layout/         # Navbar with Notifications, Sidebar
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # Landing, Dashboard, StudyPlan, Subjects, Tasks, etc.
│   │   ├── services/           # Axios API Client
│   │   ├── types/              # TypeScript Models and Enums
│   │   ├── App.tsx             # Protected & Public routing
│   │   ├── main.tsx            # App root
│   │   └── index.css           # Tailwind v4 styles
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── config/                 # MongoDB / Datastore connection
│   ├── controllers/            # Auth, Subject, Session, Task, Exam, AI controllers
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # Mongoose schemas (User, Subject, Topic, Task, Exam)
│   ├── routes/                 # Express REST route endpoints
│   ├── services/               # studyPlanGenerator.ts (scheduling algorithm)
│   ├── utils/                  # seedData.ts (Demo student: Sagar)
│   └── server.ts               # Express application entry point
│
├── .env.example
├── README.md
└── package.json
```

---

## 5. Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Optional: Local or cloud MongoDB instance (MongoDB Atlas)

### Unified Development Server (Fastest Setup)
In this repository, the frontend and backend are unified to run on port 3000 with hot reload:

```bash
# 1. Install dependencies
npm install

# 2. Start the unified full-stack server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

### Standard Dual-Folder Setup (For College Evaluation)

If running as separate `client` and `server` folders:

#### Backend Server:
```bash
cd server
npm install
npm run dev
```

#### Frontend Client:
```bash
cd client
npm install
npm run dev
```

---

## 6. Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
# Server Port
PORT=3000

# MongoDB URI (Leave empty to use automatic embedded storage)
MONGO_URI=mongodb://localhost:27017/smart-study-planner

# JWT Secret for authentication
JWT_SECRET=smart-study-planner-jwt-secret-key-btech-2026

# Google Gemini API Key for AI Study Assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 7. Demo Account Credentials (For Viva & Evaluation)

A fully populated student account is pre-seeded for project demonstrations:

- **Email**: `sagar@college.edu`
- **Password**: `password123`
- **Or**: Click **"Quick Demo Login (Sagar)"** on the Login page for one-click access!

Pre-seeded courses:
- **Mathematics** (Calculus, Linear Equations, Matrices)
- **Physics** (Mechanics, Thermodynamics, Electromagnetism)
- **Computer Science** (JavaScript, Trees & Graphs, OS Concurrency)
- **English** (Technical Report Writing, Communication Skills)

---

## 8. REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Login and receive JWT token
- `GET  /api/auth/me` — Get current student profile
- `PUT  /api/auth/profile` — Update study goals and avatar

### Subjects & Topics
- `GET    /api/subjects` — List all courses with auto-calculated progress
- `POST   /api/subjects` — Create a new subject
- `GET    /api/subjects/:id` — Get subject details with topic list
- `PUT    /api/subjects/:id` — Update course details
- `DELETE /api/subjects/:id` — Delete course and associated topics
- `GET    /api/topics` — List topics (optionally query `?subjectId=...`)
- `POST   /api/topics` — Add topic to syllabus
- `PUT    /api/topics/:id` — Toggle completion or update topic
- `DELETE /api/topics/:id` — Remove topic

### Study Planner & Sessions
- `GET    /api/study-sessions` — Retrieve study sessions (supports `?today=true` or `?date=YYYY-MM-DD`)
- `POST   /api/study-sessions` — Create manual study block
- `POST   /api/study-sessions/generate` — Run algorithmic study plan generator
- `PUT    /api/study-sessions/:id` — Mark session completed or reschedule
- `DELETE /api/study-sessions/:id` — Delete study block

### Tasks & Assignments
- `GET    /api/tasks` — List tasks with filters (`?status=...&priority=...`)
- `POST   /api/tasks` — Create new assignment
- `PUT    /api/tasks/:id` — Update status (Todo, In Progress, Completed)
- `DELETE /api/tasks/:id` — Remove task

### Examination Countdown
- `GET    /api/exams` — List upcoming exams with countdown breakdown
- `POST   /api/exams` — Add exam with target date and notes
- `PUT    /api/exams/:id` — Update exam preparation percentage
- `DELETE /api/exams/:id` — Delete exam

### Analytics & AI
- `GET    /api/dashboard` — Aggregated metrics for home dashboard
- `GET    /api/progress` — Recharts analytics payload
- `POST   /api/pomodoro` — Log completed Pomodoro session
- `POST   /api/ai/chat` — Contextual AI academic assistant chat

---

## 9. Future Enhancements

1. **Integration with University LMS**: Direct sync with Google Classroom, Canvas, and Moodle for auto-importing assignments.
2. **Multi-User Study Groups**: Collaborative Pomodoro rooms with real-time peer focus presence.
3. **Automated Flashcard Generation**: Using Gemini AI to turn completed topic notes into active recall flashcards.

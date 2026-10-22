# 📅 Timetable Generator Platform

A full-stack, automated Timetable Generation platform designed for educational institutions to manage their academic schedules seamlessly. It features a modern **React 19** Admin & User dashboard and an **Express + MongoDB** backend that intelligently groups Classes, Sections, Faculties, Rooms, and Subjects to assemble collision-free schedules.

---

## 🚀 Key Features

- **🤖 Automated Constraint Engine:** Constraint-based solver that automatically slots Faculty and Subjects into Rooms without overlaps, enforcing same-day lecture limits and lab blocks.
- **⏱️ 8-Slot Daily Schedule & Auto-Fill:** Manages 8 daily operational periods, mandatory lunch breaks, and auto-fills idle windows with Mentoring, Library, and Self-Study sessions.
- **🏫 Smart Room Allocation:** Dynamic Home vs. Guest classroom routing to handle parallel elective courses for division sub-groups without room conflicts.
- **📊 Analytics Dashboard:** Interactive visual breakdown of room occupancy rates, faculty workloads, and daily slot distributions.
- **📅 iCal Sync & Multi-Format Export:** Export personalized schedules in `.ics` calendar format (Google/Apple Calendar), Excel (`.xlsx`), or PNG image files.
- **🔐 Multi-Role JWT Security:** Role-Based Access Control (Admin, Faculty, Student) secured with JWT access/refresh tokens and `bcryptjs` password hashing.
- **🛠️ Master Data Management:** Complete CRUD interface for university data (Programs, Courses, Semesters, Specializations, Subjects, Rooms, Faculty, and Students).

---

## 🛠️ Tech Stack

### Frontend (`Client/`)
- **React 19** with **Vite**
- **Tailwind CSS v4** for modern responsive styling
- **Redux Toolkit** & **React Router v7** for application state and routing
- **React Hot Toast** for notifications
- **html-to-image** & **xlsx** for schedule exporting

### Backend (`Backend/`)
- **Node.js** with **Express.js (v5)**
- **MongoDB** featuring structured **Mongoose (v9)** schemas with relational references (`ref`)
- **JWT & Bcryptjs** for authentication and password encryption
- **Helmet, Cors & Cookie-Parser** for production security

---

## 📁 Repository Structure

```
TimeTable/
├── Backend/               # Express API & Constraint Engine (Port 4000)
│   ├── src/               # Controllers, Models, Routes, & Generator logic
│   ├── seed.js            # Master data seed script
│   └── testGenerator.js   # Standalone solver test script
├── Client/                # React 19 + Vite Frontend (Port 5173)
│   ├── src/               # UI Components, Redux store, Dashboards
│   └── index.html
└── README.md              # Project documentation
```

---

## 💻 Installation & Setup

Before starting, ensure you have **Node.js** (v18+) and **MongoDB** installed and running on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/PrachiKumari04/timetable-generator.git
cd timetable-generator
```

### 2. Setup the Backend
Navigate to the `Backend/` directory and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/timetable
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
SALT_ROUNDS=10
```

Start the backend development server:
```bash
npm run dev
```
The server will run on `http://localhost:4000`.

### 3. Setup the Frontend
Open a **new** terminal, navigate to the `Client/` directory, and install dependencies:
```bash
cd Client
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will be live at `http://localhost:5173`.

---

## 🔐 Seed Accounts & Logins

After running the database seed scripts (`node seed.js` in `Backend/`), you can log in with:

| Role | User ID / Username | Password | Dashboard Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full Master Data & Timetable Generator |
| **Faculty** | `FACF001` | `faculty123` | Personal Teaching Schedule & iCal Export |
| **Student** | `STUADT25COMM0873` | `student123` | Class Division Timetable & Calendar Sync |

---

## 📄 License
Licensed under the [ISC License](LICENSE).

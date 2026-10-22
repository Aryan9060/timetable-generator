import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";

const app = express();

//! Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, //? Disable for API server
}));

//* Compression middleware - compress responses
app.use(compression({
  level: 6, //? Balance between compression ratio and speed
  threshold: 1024, //? Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

//* CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  }),
);

//* Body parsing middleware with increased limits for bulk operations
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

//* Import routes
import userRouter from "./routes/user.routers.js";
import studentRouter from "./routes/student.routers.js";
import facultyRouter from "./routes/faculty.routers.js";
import divisionRouter from "./routes/division.routers.js";
import courseRouter from "./routes/course.routers.js";
import programmeRouter from "./routes/program.routers.js";
import roomRouter from "./routes/room.router.js";
import semesterRouter from "./routes/semester.routers.js";
import specializationRouter from "./routes/specialization.routers.js";
import qualificationTypeRouter from "./routes/qualification_type.routers.js";
import subjectAllocationRouter from "./routes/subjectAllocation.routers.js";
import timetableRouter from "./routes/timetable.routers.js";
import timeSlotRouter from "./routes/timeSlot.routers.js";
import timeTableEntryRouter from "./routes/timeTableEntry.routers.js";

//* Route declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/faculties", facultyRouter);
app.use("/api/v1/divisions", divisionRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/programmes", programmeRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/semesters", semesterRouter);
app.use("/api/v1/specializations", specializationRouter);
app.use("/api/v1/qualification-types", qualificationTypeRouter);
app.use("/api/v1/subject-allocations", subjectAllocationRouter);
app.use("/api/v1/timetables", timetableRouter);
app.use("/api/v1/time-slots", timeSlotRouter);
app.use("/api/v1/timetable-entries", timeTableEntryRouter);

//* Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

//* API Root
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timetable Management API v1",
    version: "1.0.0",
    documentation: "/api/v1/docs",
  });
});

//! 404 Handler - Must be after all routes
app.use(notFoundHandler);

//! Global Error Handler - Must be last
app.use(errorHandler);

export { app };

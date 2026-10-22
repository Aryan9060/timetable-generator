import mongoose from "mongoose";
import { User } from "./src/models/user.models.js";
import { Student } from "./src/models/student.models.js";
import { Faculty } from "./src/models/faculty.models.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    const mongoUri = `${process.env.MONGODB_URI || "mongodb://localhost:27017/"}timetable`;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for Demo Users Seeding!");

    const salt = await bcrypt.genSalt(10);

    // 1. Ensure a Student profile exists
    await Student.updateOne(
      { student_id: "ST001" },
      {
        $set: {
          student_id: "ST001",
          name: "Demo Student",
          email: "student@mituniversity.edu.in",
          program_id: "P001",
          semester_id: "S001",
          division_id: "D001"
        }
      },
      { upsert: true }
    );

    // 2. Ensure a Faculty profile exists
    await Faculty.updateOne(
      { faculty_id: "F002" },
      {
        $set: {
          faculty_id: "F002",
          name: "Prof. Hanifkhan Pathan",
          email: "hanifkha.pathan@mituniversity.edu.in",
          department: "MCA"
        }
      },
      { upsert: true }
    );

    // 3. Demo Users List
    const demoPasswordHash = await bcrypt.hash("admin123", salt);
    const facultyPasswordHash = await bcrypt.hash("faculty123", salt);
    const studentPasswordHash = await bcrypt.hash("student123", salt);

    const usersToCreate = [
      {
        user_id: "ADM001",
        password: demoPasswordHash,
        role: "admin",
        isActive: true
      },
      {
        user_id: "admin",
        password: demoPasswordHash,
        role: "admin",
        isActive: true
      },
      {
        user_id: "FACF002",
        password: facultyPasswordHash,
        role: "faculty",
        faculty_id: "F002",
        isActive: true
      },
      {
        user_id: "F002",
        password: facultyPasswordHash,
        role: "faculty",
        faculty_id: "F002",
        isActive: true
      },
      {
        user_id: "STUST001",
        password: studentPasswordHash,
        role: "student",
        student_id: "ST001",
        isActive: true
      },
      {
        user_id: "student",
        password: studentPasswordHash,
        role: "student",
        student_id: "ST001",
        isActive: true
      }
    ];

    const db = mongoose.connection.db;
    for (const u of usersToCreate) {
      await db.collection("users").updateOne(
        { user_id: u.user_id },
        { $set: u },
        { upsert: true }
      );
      console.log(`User seeded/updated: UserID='${u.user_id}', Role='${u.role}'`);
    }

    console.log("Demo Users Seeding Completed Successfully!");

  } catch (err) {
    console.error("Error seeding demo users:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

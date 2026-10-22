import mongoose from "mongoose";
import { Semester } from "./src/models/semester.models.js";

import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
    await mongoose.connect(uri + "timetable");
    console.log("Connected to MongoDB!");

    // Delete all SEM series we added
    const delRes = await Semester.deleteMany({
      semester_id: { $regex: /^SEM/i }
    });
    console.log(`Deleted ${delRes.deletedCount} semesters matching prefix 'SEM'`);

    // Ensure S001 to S006 are present
    const sems = [
      { semester_id: "S001", semester_name: "SEMESTER I", isEven: false },
      { semester_id: "S002", semester_name: "SEMESTER II", isEven: true },
      { semester_id: "S003", semester_name: "SEMESTER III", isEven: false },
      { semester_id: "S004", semester_name: "SEMESTER IV", isEven: true },
      { semester_id: "S005", semester_name: "SEMESTER V", isEven: false },
      { semester_id: "S006", semester_name: "SEMESTER VI", isEven: true },
    ];

    for (const sem of sems) {
      await Semester.updateOne(
        { semester_id: sem.semester_id },
        { $set: sem },
        { upsert: true }
      );
      console.log(`Upserted ${sem.semester_id}`);
    }

    console.log("Database cleaned and seeded successfully!");
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

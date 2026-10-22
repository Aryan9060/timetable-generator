import mongoose from "mongoose";
import { Semester } from "./src/models/semester.models.js";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/timetable");
    console.log("Connected to MongoDB!");

    const sems = [
      { semester_id: "SEM1", semester_name: "SEMESTER 1", isEven: false },
      { semester_id: "SEM2", semester_name: "SEMESTER 2", isEven: true },
      { semester_id: "SEM3", semester_name: "SEMESTER 3", isEven: false },
      { semester_id: "SEM4", semester_name: "SEMESTER 4", isEven: true },
      { semester_id: "SEM5", semester_name: "SEMESTER 5", isEven: false },
      { semester_id: "SEM6", semester_name: "SEMESTER 6", isEven: true },
    ];

    for (const sem of sems) {
      await Semester.updateOne(
        { semester_id: sem.semester_id },
        { $set: sem },
        { upsert: true }
      );
      console.log(`Upserted ${sem.semester_id}`);
    }

    console.log("Semesters seeded successfully!");
  } catch (err) {
    console.error("Error seeding semesters:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

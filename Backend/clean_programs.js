import mongoose from "mongoose";
import { Program } from "./src/models/program.models.js";

import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
    await mongoose.connect(uri + "timetable");
    console.log("Connected to MongoDB!");

    // Keep P001, P002, P003, P004 and delete others
    const res = await Program.deleteMany({
      program_id: { $nin: ["P001", "P002", "P003", "P004"] }
    });
    console.log(`Deleted ${res.deletedCount} programs`);

    const programs = await Program.find({});
    console.log("Remaining programs in database:");
    programs.forEach(p => {
      console.log(`- ID: ${p.program_id}, Name: ${p.program_name}`);
    });

  } catch (err) {
    console.error("Error during program cleanup:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

import mongoose from "mongoose";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/timetable");
    const db = mongoose.connection.db;
    
    const allocations = await db.collection("subjectallocations").find({}).toArray();
    console.log("Allocations count:", allocations.length);
    console.log("Unique Allocations keys:");
    const uniqueKeys = new Set();
    allocations.forEach(a => {
      uniqueKeys.add(`Program: ${a.program_id}, Sem: ${a.semester_id}, Year: ${a.academicYear}`);
    });
    console.log(Array.from(uniqueKeys));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

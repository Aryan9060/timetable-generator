import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
    await mongoose.connect(uri + "timetable");
    const db = mongoose.connection.db;
    
    const allocations = await db.collection("subjectallocations").find({}).toArray();
    console.log("Allocations count:", allocations.length);
    const divs = [...new Set(allocations.map(a => a.division_id))];
    divs.forEach(d => {
      const divAllocs = allocations.filter(a => a.division_id === d);
      console.log(`- Division ${d} has ${divAllocs.length} subject allocations`);
      const programs = [...new Set(divAllocs.map(a => a.program_id))];
      console.log(`  Mapped programs:`, programs);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

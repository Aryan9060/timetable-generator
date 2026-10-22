import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
    await mongoose.connect(uri + "timetable");
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log("Current Database Status:");
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments({});
      console.log(` - Collection '${coll.name}': ${count} documents`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

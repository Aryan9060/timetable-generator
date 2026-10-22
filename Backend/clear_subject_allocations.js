import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clearSubjectAllocations = async () => {
  const uris = [
    process.env.MONGODB_URI || "mongodb+srv://aryan:aryan123@timetable.u4ag3ve.mongodb.net/timetable",
    "mongodb://localhost:27017/timetable"
  ];

  for (const rawUri of uris) {
    try {
      let uri = rawUri;
      if (!uri.endsWith("/timetable") && !uri.endsWith("/timetable/")) {
        if (uri.endsWith("/")) uri += "timetable";
        else uri += "/timetable";
      }

      console.log(`Connecting to: ${uri}...`);
      await mongoose.connect(uri);
      const db = mongoose.connection.db;

      const resultAllocs = await db.collection("subjectallocations").deleteMany({});
      console.log(`- Subject Allocations deleted: ${resultAllocs.deletedCount}`);

      const resultTimetables = await db.collection("timetables").deleteMany({});
      console.log(`- Timetables deleted: ${resultTimetables.deletedCount}`);

      const resultEntries = await db.collection("timetableentries").deleteMany({});
      console.log(`- Timetable Entries deleted: ${resultEntries.deletedCount}`);

      console.log(`✅ Subject allocations & timetables cleared for ${uri}\n`);

      await mongoose.disconnect();
    } catch (err) {
      console.error(`Error clearing ${rawUri}:`, err.message);
      try { await mongoose.disconnect(); } catch (_) {}
    }
  }
};

clearSubjectAllocations();

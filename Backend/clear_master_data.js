import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clearMasterData = async () => {
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

      console.log("Clearing master data collections...");

      const resultPrograms = await db.collection("programs").deleteMany({});
      console.log(`- Programs deleted: ${resultPrograms.deletedCount}`);

      const resultSpecs = await db.collection("specializations").deleteMany({});
      console.log(`- Specializations deleted: ${resultSpecs.deletedCount}`);

      const resultDivs = await db.collection("divisions").deleteMany({});
      console.log(`- Divisions deleted: ${resultDivs.deletedCount}`);

      const resultCourses = await db.collection("courses").deleteMany({});
      console.log(`- Courses deleted: ${resultCourses.deletedCount}`);

      const resultAllocations = await db.collection("subjectallocations").deleteMany({});
      console.log(`- Subject Allocations deleted: ${resultAllocations.deletedCount}`);

      const resultCurriculums = await db.collection("curriculums").deleteMany({});
      console.log(`- Curriculums deleted: ${resultCurriculums.deletedCount}`);

      const resultRooms = await db.collection("rooms").deleteMany({});
      console.log(`- Rooms deleted: ${resultRooms.deletedCount}`);

      const resultFaculties = await db.collection("faculties").deleteMany({});
      console.log(`- Faculties deleted: ${resultFaculties.deletedCount}`);

      const resultStudents = await db.collection("students").deleteMany({});
      console.log(`- Students deleted: ${resultStudents.deletedCount}`);

      const resultTimetables = await db.collection("timetables").deleteMany({});
      console.log(`- Timetables deleted: ${resultTimetables.deletedCount}`);

      const resultTTEntries = await db.collection("timetableentries").deleteMany({});
      console.log(`- Timetable Entries deleted: ${resultTTEntries.deletedCount}`);

      // Delete non-admin users (preserve admin account so user stays logged in)
      const resultUsers = await db.collection("users").deleteMany({ role: { $ne: "admin" } });
      console.log(`- Non-admin users deleted: ${resultUsers.deletedCount}`);

      console.log(`✅ Master data successfully cleared for ${uri}\n`);

      await mongoose.disconnect();
    } catch (err) {
      console.error(`Error clearing ${rawUri}:`, err.message);
      try { await mongoose.disconnect(); } catch (_) {}
    }
  }
};

clearMasterData();

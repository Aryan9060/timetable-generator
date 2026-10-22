import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clearQualificationTypes = async () => {
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

      const result = await db.collection("qualificationtypes").deleteMany({});
      console.log(`- Qualification Types deleted: ${result.deletedCount}`);

      console.log(`✅ Qualification types cleared for ${uri}\n`);

      await mongoose.disconnect();
    } catch (err) {
      console.error(`Error clearing qualification types from ${rawUri}:`, err.message);
      try { await mongoose.disconnect(); } catch (_) {}
    }
  }
};

clearQualificationTypes();

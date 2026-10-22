import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const run = async () => {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(`${process.env.MONGODB_URI}TimeTable`);
    console.log("Connected!");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Find users
    const users = await db.collection("users").find({}).toArray();
    console.log("Users found in database:");
    users.forEach(u => {
      console.log(`- UserID: ${u.user_id}, Role: ${u.role}, StudentID: ${u.student_id}, FacultyID: ${u.faculty_id}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

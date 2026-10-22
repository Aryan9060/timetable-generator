import mongoose from "mongoose";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/timetable");
    const db = mongoose.connection.db;
    
    const users = await db.collection("users").find({}).toArray();
    console.log("All users in database:");
    users.forEach(u => {
      console.log(`- UserID/Login: ${u.user_id}, StudentID: ${u.student_id}, FacultyID: ${u.faculty_id}, Role: ${u.role}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

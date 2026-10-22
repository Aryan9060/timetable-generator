import mongoose from "mongoose";

const run = async () => {
  try {
    const localUri = "mongodb://localhost:27017/";
    console.log("Connecting to local MongoDB:", localUri);
    await mongoose.connect(`${localUri}TimeTable`);
    console.log("Connected!");
    const db = mongoose.connection.db;
    
    // Check if users collection exists and print users
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    if (collections.some(c => c.name === "users")) {
      const users = await db.collection("users").find({}).toArray();
      console.log("Users found in database:");
      users.forEach(u => {
        console.log(`- UserID: ${u.user_id}, Role: ${u.role}, StudentID: ${u.student_id}, FacultyID: ${u.faculty_id}`);
      });
    } else {
      console.log("No users collection found in local database.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

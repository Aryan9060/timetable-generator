import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./src/models/user.models.js";

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = `${process.env.MONGODB_URI || "mongodb://localhost:27017/"}timetable`;
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);

    // Update or insert admin user
    const res = await User.updateOne(
      { user_id: "admin" },
      {
        $set: {
          password: hashedPassword,
          role: "admin",
          isActive: true,
        }
      },
      { upsert: true }
    );

    console.log("Successfully seeded/reset admin user!");
    console.log("Username: admin");
    console.log("Password: admin123");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
  }
};

seed();

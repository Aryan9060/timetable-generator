import mongoose from "mongoose";
import { DB_NAME } from "../constenets.js";

//* Database connection function
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    if (uri.endsWith("/")) {
      uri += DB_NAME;
    } else if (!uri.endsWith(`/${DB_NAME}`)) {
      uri += `/${DB_NAME}`;
    }
    const connectionInstance = await mongoose.connect(uri);
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}, DB NAME: ${connectionInstance.connection.name}`,
    );
  } catch (error) {
    //! Critical error - exit process if DB connection fails
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;

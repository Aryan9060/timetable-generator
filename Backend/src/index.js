import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./server.js";

dotenv.config({ path: "./.env" });
const port = process.env.PORT || 4000;

//* Connect to database and start server
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Database connection failed !!", error);
    });
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

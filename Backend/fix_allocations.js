import mongoose from "mongoose";
import { SubjectAllocation } from "./src/models/subjectAllocation.models.js";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/timetable");
    console.log("Connected to MongoDB!");

    // Let's look up all allocations for P001, P002, P003, P004
    const allocations = await SubjectAllocation.find({
      program_id: { $in: ["P001", "P002", "P003", "P004"] },
      semester_id: "S002"
    });

    console.log(`Found ${allocations.length} allocations to adjust.`);

    for (const alloc of allocations) {
      const courseId = alloc.course_id.toUpperCase();
      
      // Update program_id to P001 (MCA) for all of them so they belong to the same program group
      alloc.program_id = "P001";

      // Assign specialization_id based on the course
      if (courseId === "C024") {
        // Introduction to Cloud Computing Services
        alloc.specialization_id = "SP001"; // Cloud Computing specialization
        console.log(`Mapped ${courseId} to Cloud Computing (SP001)`);
      } else if (courseId === "C027") {
        // Data Analytic and Visualization
        alloc.specialization_id = "SP002"; // Data Science specialization
        console.log(`Mapped ${courseId} to Data Science (SP002)`);
      } else if (courseId === "C007") {
        // Ethical Hacking
        alloc.specialization_id = "SP003"; // Cybersecurity specialization
        console.log(`Mapped ${courseId} to Cybersecurity (SP003)`);
      } else {
        // Core courses for all MCA students (Java, WT, OS, ADBMS, AFM, labs)
        alloc.specialization_id = null;
        console.log(`Mapped ${courseId} as Core (no specialization)`);
      }

      await alloc.save();
    }

    console.log("Subject allocations updated successfully!");
  } catch (err) {
    console.error("Error updating allocations:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

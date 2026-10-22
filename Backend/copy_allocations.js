import mongoose from "mongoose";
import { SubjectAllocation } from "./src/models/subjectAllocation.models.js";

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/timetable");
    console.log("Connected to MongoDB!");

    // Delete all current allocations for S002 to start fresh and clean
    const deleteRes = await SubjectAllocation.deleteMany({
      semester_id: "S002",
      program_id: "P001"
    });
    console.log(`Deleted ${deleteRes.deletedCount} existing Semester II allocations.`);

    // Core course allocations templates (based on Division A original mappings + adding DAA C008)
    const coreTemplates = [
      { course_id: "C017", faculty_id: "F007", l: "3", t: "0", p: "0", isLab: false }, // Core Java
      { course_id: "C018", faculty_id: "F007", l: "0", t: "0", p: "1", isLab: true },  // Java/WT Lab
      { course_id: "C033", faculty_id: "F011", l: "2", t: "0", p: "1", isLab: false }, // AFM (theory + lab)
      { course_id: "C003", faculty_id: "F002", l: "3", t: "0", p: "0", isLab: false }, // ADBMS theory
      { course_id: "C006", faculty_id: "F003", l: "3", t: "0", p: "0", isLab: false }, // Operating System
      { course_id: "C011", faculty_id: "F005", l: "3", t: "0", p: "0", isLab: false }, // WT theory
      { course_id: "C004", faculty_id: "F002", l: "0", t: "0", p: "1", isLab: true },  // ADBMS Lab
      { course_id: "C012", faculty_id: "F005", l: "0", t: "0", p: "1", isLab: true },  // WT/Java Lab
      { course_id: "C008", faculty_id: "F004", l: "3", t: "0", p: "0", isLab: false }   // DAA (DESIGN & ANALYSIS OF ALGORITHMS)
    ];

    const divisions = [
      { id: "D001", name: "Division A", specCourse: "C024", specId: "SP001", specFaculty: "F009" }, // Cloud
      { id: "D002", name: "Division B", specCourse: "C027", specId: "SP002", specFaculty: "F010" }, // Data Science
      { id: "D003", name: "Division C", specCourse: "C027", specId: "SP002", specFaculty: "F010" }, // Data Science
      { id: "D004", name: "Division D", specCourse: "C007", specId: "SP003", specFaculty: "F003" }  // Ethical Hacking
    ];

    let count = 1;
    const newAllocations = [];

    divisions.forEach(div => {
      // 1. Add core courses
      coreTemplates.forEach(core => {
        newAllocations.push({
          subjectAllocation_id: `SA_GEN_${count++}`,
          semester_id: "S002",
          program_id: "P001",
          division_id: div.id,
          course_id: core.course_id,
          faculty_id: core.faculty_id,
          l: core.l,
          t: core.t,
          p: core.p,
          isLab: core.isLab,
          specialization_id: null, // Core has no specialization
          academicYear: "2025-2026"
        });
      });

      // 2. Add specialization course
      newAllocations.push({
        subjectAllocation_id: `SA_GEN_${count++}`,
        semester_id: "S002",
        program_id: "P001",
        division_id: div.id,
        course_id: div.specCourse,
        faculty_id: div.specFaculty,
        l: "3",
        t: "0",
        p: "0",
        isLab: false,
        specialization_id: div.specId,
        academicYear: "2025-2026"
      });
    });

    console.log(`Inserting ${newAllocations.length} new allocations (including DAA) for S002...`);
    await SubjectAllocation.insertMany(newAllocations);
    console.log("Subject allocations seeded successfully for all divisions!");
  } catch (err) {
    console.error("Error copying allocations:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

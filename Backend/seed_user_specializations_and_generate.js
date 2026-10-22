import mongoose from "mongoose";
import dotenv from "dotenv";
import { Program } from "./src/models/program.models.js";
import { Specialization } from "./src/models/specialization.models.js";
import { Division } from "./src/models/division.models.js";
import { Course } from "./src/models/course.models.js";
import { Faculty } from "./src/models/faculty.models.js";
import { Room } from "./src/models/room.models.js";
import { SubjectAllocation } from "./src/models/subjectAllocation.models.js";
import { Curriculum } from "./src/models/curriculum.models.js";
import { TimeSlot } from "./src/models/timeSlot.models.js";
import { Timetable } from "./src/models/timetable.models.js";
import { TimeTableEntry } from "./src/models/timeTableEntry.models.js";
import { generateSchedule } from "./src/utils/timetableGenerator.js";

dotenv.config();

const programDefs = [
  { id: "P002", name: "M.Tech – Construction Management", sem1: true, sem3: false },
  { id: "P003", name: "MBA – Agri & Food Business Management", sem1: true, sem3: true },
  { id: "P004", name: "MBA – Banking & Insurance", sem1: true, sem3: false },
  { id: "P005", name: "MBA – Business Analytics", sem1: true, sem3: true },
  { id: "P006", name: "MBA – Digital Marketing", sem1: true, sem3: true },
  { id: "P007", name: "MBA – Event Management", sem1: true, sem3: false },
  { id: "P008", name: "MBA – Finance Technology", sem1: true, sem3: true },
  { id: "P009", name: "MBA – Hospital & Healthcare Management", sem1: true, sem3: true },
  { id: "P010", name: "MBA – Human Resource Management", sem1: true, sem3: true },
  { id: "P011", name: "MBA – International Business", sem1: true, sem3: true },
  { id: "P012", name: "MBA – Logistics & Supply Chain Management", sem1: true, sem3: true },
  { id: "P013", name: "MBA – Marketing Management", sem1: true, sem3: true },
  { id: "P014", name: "MBA – Media Management", sem1: true, sem3: false },
  { id: "P015", name: "MBA – Port & Shipping Management", sem1: true, sem3: false },
  { id: "P016", name: "MBA – Project & Construction Management", sem1: true, sem3: true },
  { id: "P017", name: "MCA – Cloud Computing", sem1: true, sem3: true },
  { id: "P018", name: "MCA – Data Science", sem1: true, sem3: true },
  { id: "P019", name: "MCA – Data Science & Cyber Security", sem1: false, sem3: true },
];

const run = async () => {
  try {
    const mongoUri = `${process.env.MONGODB_URI || "mongodb://localhost:27017/"}timetable`;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for complete setup and generation!");

    // 1. Seed Programs and Specializations
    console.log("\n1. Seeding Programs & Specializations...");
    for (const p of programDefs) {
      await Program.updateOne(
        { program_id: p.id },
        {
          $set: {
            program_id: p.id,
            program_name: p.name,
            program_duration: "2 Years",
            isActive: true,
          },
        },
        { upsert: true }
      );

      await Specialization.updateOne(
        { specialization_id: `SP_${p.id}` },
        {
          $set: {
            specialization_id: `SP_${p.id}`,
            specialization_name: p.name.split("–")[1]?.trim() || p.name,
            isActive: true,
          },
        },
        { upsert: true }
      );
    }

    // 2. Ensure Lab Rooms exist in Database
    console.log("\n2. Ensuring Lab Rooms exist...");
    const labRooms = [
      { room_no: "LAB-701", floor_no: "7", block: "NORTH", isLab: true },
      { room_no: "LAB-702", floor_no: "7", block: "NORTH", isLab: true },
      { room_no: "LAB-801", floor_no: "8", block: "SOUTH", isLab: true },
      { room_no: "LAB-802", floor_no: "8", block: "SOUTH", isLab: true },
    ];
    for (const lr of labRooms) {
      await Room.updateOne(
        { room_no: lr.room_no, block: lr.block },
        { $set: lr },
        { upsert: true }
      );
    }

    // Fetch classrooms to assign preferred rooms for divisions
    const availableClassrooms = await Room.find({ isLab: false });

    // 3. Seed Divisions & Faculties
    console.log("\n3. Seeding Divisions and Faculties...");
    const facultyList = [];
    for (let i = 1; i <= 60; i++) {
      const fId = `F_${String(i).padStart(3, "0")}`;
      const fName = `Prof. Faculty_${i}`;
      facultyList.push({ faculty_id: fId, name: fName, email: `faculty${i}@mit.edu` });
      await Faculty.updateOne(
        { faculty_id: fId },
        { $set: { faculty_id: fId, name: fName, email: `faculty${i}@mit.edu`, isActive: true } },
        { upsert: true }
      );
    }

    const divisionMap = {};
    for (let idx = 0; idx < programDefs.length; idx++) {
      const p = programDefs[idx];
      const divId = `D_${p.id}`;
      const room = availableClassrooms[idx % availableClassrooms.length];

      const divData = {
        division_id: divId,
        division_name: `DIV-${p.id}`,
        specialization_id: `SP_${p.id}`,
        preferredRoom_no: room.room_no,
        preferredRoom_block: room.block,
      };

      await Division.updateOne(
        { division_id: divId },
        { $set: divData },
        { upsert: true }
      );
      divisionMap[p.id] = divId;
    }

    // 4. Seed Courses and Subject Allocations
    console.log("\n4. Seeding Courses & Subject Allocations for S001 and S003...");
    await SubjectAllocation.deleteMany({ semester_id: { $in: ["S001", "S003"] } });
    await Curriculum.deleteMany({ semester_id: { $in: ["S001", "S003"] } });

    let courseIdCounter = 100;
    let facultyIdx = 0;
    const academicYear = "2025-2026";

    for (const semId of ["S001", "S003"]) {
      const isSem1 = semId === "S001";
      const activeProgs = programDefs.filter((p) => (isSem1 ? p.sem1 : p.sem3));
      const curriculumSubjects = [];

      for (const prog of activeProgs) {
        const divId = divisionMap[prog.id];

        // 3 Lectures + 1 Lab for each program in this semester
        const progCourses = [
          {
            id: `CRS-${semId}-${prog.id}-1`,
            name: `${prog.name} Core Subject I`,
            l: "3", t: "0", p: "0", isLab: false,
          },
          {
            id: `CRS-${semId}-${prog.id}-2`,
            name: `${prog.name} Advanced Subject II`,
            l: "3", t: "0", p: "0", isLab: false,
          },
          {
            id: `CRS-${semId}-${prog.id}-3`,
            name: `${prog.name} Specialization Elective`,
            l: "3", t: "0", p: "0", isLab: false,
          },
          {
            id: `CRS-${semId}-${prog.id}-LAB`,
            name: `${prog.name} Practical Lab`,
            l: "0", t: "0", p: "2", isLab: true,
          },
        ];

        for (const c of progCourses) {
          await Course.updateOne(
            { course_id: c.id },
            {
              $set: {
                course_id: c.id,
                course_name: c.name,
                credit: "3",
                isActive: true,
              },
            },
            { upsert: true }
          );

          const assignedFaculty = facultyList[facultyIdx % facultyList.length];
          facultyIdx++;

          const allocId = `ALLOC-${semId}-${prog.id}-${c.id}`;
          await SubjectAllocation.create({
            subjectAllocation_id: allocId,
            semester_id: semId,
            program_id: prog.id,
            division_id: divId,
            course_id: c.id,
            faculty_id: assignedFaculty.faculty_id,
            l: c.l,
            t: c.t,
            p: c.p,
            isLab: c.isLab,
            academicYear: academicYear,
          });

          curriculumSubjects.push({
            course_id: c.id,
            isSpecialization: c.id.includes("3") || c.id.includes("LAB"),
            specialization_id: `SP_${prog.id}`,
          });
        }
      }

      await Curriculum.create({
        program_id: "ALL",
        semester_id: semId,
        academicYear: academicYear,
        subjects: curriculumSubjects,
      });

      console.log(`Allocations created for ${semId}: ${activeProgs.length} active programs (${activeProgs.length * 4} subjects allocated).`);
    }

    // 5. Generate Timetables for S001 and S003
    console.log("\n5. Generating Timetables for S001 (Semester I) and S003 (Semester III)...");

    const allRooms = await Room.find();
    const timeSlots = await TimeSlot.find();
    const allDivisions = await Division.find();

    for (const semId of ["S001", "S003"]) {
      console.log(`\n--- Generating for ${semId} ---`);
      const allocations = await SubjectAllocation.find({ semester_id: semId, academicYear });
      const curriculum = await Curriculum.findOne({ semester_id: semId });

      console.log(`Found ${allocations.length} allocations for ${semId}`);

      const generatedEntries = generateSchedule(allocations, allRooms, timeSlots, allDivisions, curriculum);

      if (!generatedEntries) {
        console.error(`❌ Timetable generation failed for ${semId}! Constraints unsatisfied.`);
        continue;
      }

      console.log(`✅ Successfully generated ${generatedEntries.length} timetable entries for ${semId}!`);

      // Clear existing entries for this semester
      const existingTimetables = await Timetable.find({ semester_id: semId, academicYear });
      const classGroups = [...new Set(allocations.map((a) => a.division_id))];
      
      await TimeTableEntry.deleteMany({ class_group: { $in: classGroups } });
      await Timetable.deleteMany({ semester_id: semId, academicYear });

      // Save entries
      const savedEntries = await TimeTableEntry.insertMany(generatedEntries);

      // Save master document
      const timetableId = `TT-${semId}-${academicYear}-${Date.now()}`.toUpperCase();
      const timetable = await Timetable.create({
        timetable_id: timetableId,
        semester_id: semId,
        academicYear,
        generatedBy: "ADMIN",
        status: "published",
        entries: savedEntries,
      });

      console.log(`🎉 Saved Timetable Master Document: ${timetableId} for ${semId}`);
    }

    console.log("\n=======================================================");
    console.log("SUCCESS! All 18 Programs and Specializations configured.");
    console.log("Timetables for Sem I and Sem III successfully generated and saved.");
    console.log("=======================================================");

  } catch (err) {
    console.error("Error executing setup & generation:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();

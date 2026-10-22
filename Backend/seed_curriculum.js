import mongoose from "mongoose";
import { Course } from "./src/models/course.models.js";
import { Division } from "./src/models/division.models.js";
import { Faculty } from "./src/models/faculty.models.js";
import { Curriculum } from "./src/models/curriculum.models.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        const mongoUri = `${process.env.MONGODB_URI || "mongodb://localhost:27017/"}timetable`;
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB!");

        // 1. Insert Missing Courses
        const missingCourses = [
            { course_id: "C_ADBMS", course_name: "ADVANCED DATABASE MANAGEMENT SYSTEMS", credit: "4", isActive: true },
            { course_id: "C_DAA", course_name: "DESIGN & ANALYSIS OF ALGORITHMS", credit: "4", isActive: true },
            { course_id: "C_LOGICAL", course_name: "LOGICAL APTITUDE", credit: "2", isActive: true },
            { course_id: "C_LINUX", course_name: "LINUX INTERNALS", credit: "2", isActive: true },
            { course_id: "C_ADBMS_LAB", course_name: "ADBMS LAB", credit: "2", isActive: true },
            { course_id: "C_LINUX_LAB", course_name: "LINUX LAB", credit: "2", isActive: true },
            { course_id: "C_WT_LAB", course_name: "WEB TECHNOLOGY LAB", credit: "2", isActive: true },
            { course_id: "C_JAVA_LAB", course_name: "CORE JAVA PROGRAMMING LAB", credit: "2", isActive: true },
            { course_id: "C_AFM_LAB", course_name: "AFM LAB", credit: "2", isActive: true },
            { course_id: "C_OS", course_name: "OPERATING SYSTEM", credit: "4", isActive: true }, // C006 exists but we can use specific ID or just find it. We will try to find existing ones.
        ];

        for (const c of missingCourses) {
            await Course.updateOne({ course_id: c.course_id }, { $set: c }, { upsert: true });
        }
        console.log("Courses inserted/updated.");

        // 2. Configure Class Teachers & Specializations for Divisions
        // class a has vinod sir (F003) -> Cloud Computing (C024 / SP001)
        // class b has satyam rahul sir (F004) -> Data Science (C165 / SP002)
        // class c has pradnya maam (F007) -> Data Science (C165 / SP002)
        // class d has harshit sir (F008) -> Ethical Hacking (C007 / SP003)

        const divs = [
            { div: "D001", teacher: "F003", spec: "SP001", room: "705", block: "NORTH" }, // Div A
            { div: "D002", teacher: "F004", spec: "SP002", room: "707", block: "NORTH" }, // Div B
            { div: "D003", teacher: "F007", spec: "SP002", room: "709", block: "NORTH" }, // Div C
            { div: "D004", teacher: "F008", spec: "SP003", room: "715", block: "NORTH" }, // Div D
        ];

        for (const d of divs) {
            await Division.updateOne(
                { division_id: d.div },
                { 
                    $set: { 
                        classTeacher_id: d.teacher, 
                        specialization_id: d.spec,
                        preferredRoom_no: d.room,
                        preferredRoom_block: d.block
                    } 
                }
            );
        }
        console.log("Divisions updated with class teachers and specializations.");

        // 3. Populate Curriculum for MCA (Program P001, Semester S002)
        const mcaCurriculum = {
            program_id: "P001",
            semester_id: "S002",
            subjects: [
                { course_id: "C_ADBMS", isSpecialization: false },
                { course_id: "C_DAA", isSpecialization: false },
                { course_id: "C006", isSpecialization: false }, // OS
                { course_id: "C_LOGICAL", isSpecialization: false },
                { course_id: "C017", isSpecialization: false }, // Core Java
                { course_id: "C011", isSpecialization: false }, // WT
                { course_id: "C033", isSpecialization: false }, // AFM
                
                // Specializations
                { course_id: "C024", isSpecialization: true, specialization_id: "SP001" }, // Cloud
                { course_id: "C165", isSpecialization: true, specialization_id: "SP002" }, // Data Science
                { course_id: "C007", isSpecialization: true, specialization_id: "SP003" }, // Ethical Hacking
            ],
            combined_labs: [
                {
                    lab_name: "WT_JAVA_LAB",
                    course_ids: ["C_WT_LAB", "C_JAVA_LAB"]
                },
                {
                    lab_name: "LINUX_ADBMS_LAB",
                    course_ids: ["C_LINUX_LAB", "C_ADBMS_LAB"]
                },
                {
                    lab_name: "AFM_LAB",
                    course_ids: ["C_AFM_LAB"]
                }
            ]
        };

        await Curriculum.deleteMany({ program_id: "P001", semester_id: "S002" });
        await Curriculum.create(mcaCurriculum);
        console.log("Curriculum created.");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

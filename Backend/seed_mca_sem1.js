import mongoose from "mongoose";
import { Course } from "./src/models/course.models.js";
import { Faculty } from "./src/models/faculty.models.js";
import { Curriculum } from "./src/models/curriculum.models.js";
import { SubjectAllocation } from "./src/models/subjectAllocation.models.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/timetable";
        if (!mongoUri.endsWith("/timetable")) mongoUri += "/timetable";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB for MCA Sem 1 seeding!");

        // 1. Seed Courses for MCA Sem 1 (S001)
        const mcaSem1Courses = [
            { course_id: "26MCAC101", course_name: "Organization Design and Emotional Intelligence", credit: "3", isActive: true },
            { course_id: "26MCAC102", course_name: "Data Structure using Python", credit: "3", isActive: true },
            { course_id: "26MCAC103", course_name: "Business Statistics using Python", credit: "3", isActive: true },
            { course_id: "26MCAC104", course_name: "Quantum Aware- Computer Organization & Design", credit: "3", isActive: true },
            { course_id: "26MCAC105", course_name: "Computer Networks and Management", credit: "3", isActive: true },
            { course_id: "26MCAC106", course_name: "Business Communication in Digital Age", credit: "4", isActive: true },
            { course_id: "26MCACL101", course_name: "Lab - I : Business Statistics using Python", credit: "2", isActive: true },
            { course_id: "26MCACL102", course_name: "Lab - II : Data Structure using Python", credit: "2", isActive: true },
            { course_id: "25MCCC101", course_name: "Cloud Computing Integrated with AI", credit: "3", isActive: true },
            { course_id: "26MCDS101", course_name: "Introduction to Data Science & Artificial Intelligence", credit: "3", isActive: true },
            { course_id: "26MCCB101", course_name: "Introduction to Cyber Security & Network Defense", credit: "3", isActive: true }
        ];

        for (const c of mcaSem1Courses) {
            await Course.updateOne({ course_id: c.course_id }, { $set: c }, { upsert: true });
        }
        console.log("MCA Sem 1 Courses seeded!");

        // 2. Map Faculty IDs
        const db = mongoose.connection.db;
        const allFaculties = await db.collection("faculties").find({}).toArray();

        const findFacultyId = (searchTerms, fallbackId) => {
            const termList = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
            for (const f of allFaculties) {
                const name = (f.name || f.faculty_name || "").toLowerCase();
                if (termList.some(t => name.includes(t.toLowerCase()))) {
                    return f.faculty_id;
                }
            }
            return fallbackId;
        };

        const facultyLookup = {
            "ashwini_joshi": findFacultyId(["ashwini"], "F016"),
            "pratibha_upadhye": findFacultyId(["upadhye", "pratibha upadh"], "F024"),
            "pallavi_gaikwad": findFacultyId(["pallavi"], "F018"),
            "pradnya": findFacultyId(["pradnya"], "F007"),
            "harshit": findFacultyId(["harshit"], "F008"),
            "vinod": findFacultyId(["vinod"], "F003"),
            "anjali_sharma": findFacultyId(["anjali"], "F064"),
            "pratibha_tiwari": findFacultyId(["pratibha tiwari"], "F009"),
            "satyakam": findFacultyId(["satyakam"], "F004")
        };

        // 3. Clear existing S001 allocations & curriculum
        await SubjectAllocation.deleteMany({ semester_id: "S001" });
        await Curriculum.deleteMany({ semester_id: "S001" });

        // 4. Seed Curriculum for S001
        const sem1Curriculum = {
            program_id: "P001",
            semester_id: "S001",
            academicYear: "2025-2026",
            subjects: [
                { course_id: "26MCAC101", isSpecialization: false },
                { course_id: "26MCAC102", isSpecialization: false },
                { course_id: "26MCAC103", isSpecialization: false },
                { course_id: "26MCAC104", isSpecialization: false },
                { course_id: "26MCAC105", isSpecialization: false },
                { course_id: "26MCAC106", isSpecialization: false },
                { course_id: "25MCCC101", isSpecialization: true, specialization_id: "SP001" },
                { course_id: "26MCDS101", isSpecialization: true, specialization_id: "SP002" },
                { course_id: "26MCCB101", isSpecialization: true, specialization_id: "SP003" }
            ]
        };
        await Curriculum.create(sem1Curriculum);
        console.log("Curriculum created for S001!");

        // 5. Seed Subject Allocations for S001
        let allocCounter = 1;
        const newAllocations = [];

        // --- DIVISION A (Cloud Computing - D001) ---
        const divA = [
            { course_id: "26MCAC101", faculty_id: facultyLookup.ashwini_joshi, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC102", faculty_id: facultyLookup.pallavi_gaikwad, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC103", faculty_id: facultyLookup.pradnya, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC104", faculty_id: facultyLookup.harshit, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC105", faculty_id: facultyLookup.vinod, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC106", faculty_id: facultyLookup.anjali_sharma, l: "3", t: "0", p: "1", isLab: false },
            { course_id: "26MCACL101", faculty_id: facultyLookup.pradnya, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCACL102", faculty_id: facultyLookup.pallavi_gaikwad, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCCC101", faculty_id: facultyLookup.pratibha_tiwari, l: "3", t: "0", p: "0", isLab: false }
        ];

        divA.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S001_${allocCounter++}`,
                semester_id: "S001",
                program_id: "P001",
                division_id: "D001",
                course_id: item.course_id,
                faculty_id: item.faculty_id,
                l: item.l, t: item.t, p: item.p,
                isLab: item.isLab,
                academicYear: "2026-2027"
            });
        });

        // --- DIVISION B (Data Science - D002) ---
        const divB = [
            { course_id: "26MCAC101", faculty_id: facultyLookup.pratibha_upadhye, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC102", faculty_id: facultyLookup.pallavi_gaikwad, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC103", faculty_id: facultyLookup.pradnya, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC104", faculty_id: facultyLookup.harshit, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC105", faculty_id: facultyLookup.vinod, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC106", faculty_id: facultyLookup.anjali_sharma, l: "3", t: "0", p: "1", isLab: false },
            { course_id: "26MCACL101", faculty_id: facultyLookup.vinod, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCACL102", faculty_id: facultyLookup.pallavi_gaikwad, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCDS101", faculty_id: facultyLookup.satyakam, l: "3", t: "0", p: "0", isLab: false }
        ];

        divB.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S001_${allocCounter++}`,
                semester_id: "S001",
                program_id: "P001",
                division_id: "D002",
                course_id: item.course_id,
                faculty_id: item.faculty_id,
                l: item.l, t: item.t, p: item.p,
                isLab: item.isLab,
                academicYear: "2026-2027"
            });
        });

        // --- DIVISION C (Data Science - D003) ---
        const divC = [
            { course_id: "26MCAC101", faculty_id: facultyLookup.pratibha_upadhye, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC102", faculty_id: facultyLookup.pallavi_gaikwad, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC103", faculty_id: facultyLookup.pradnya, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC104", faculty_id: facultyLookup.harshit, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC105", faculty_id: facultyLookup.vinod, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC106", faculty_id: facultyLookup.anjali_sharma, l: "3", t: "0", p: "1", isLab: false },
            { course_id: "26MCACL101", faculty_id: facultyLookup.vinod, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCACL102", faculty_id: facultyLookup.pallavi_gaikwad, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCDS101", faculty_id: facultyLookup.satyakam, l: "3", t: "0", p: "0", isLab: false }
        ];

        divC.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S001_${allocCounter++}`,
                semester_id: "S001",
                program_id: "P001",
                division_id: "D003",
                course_id: item.course_id,
                faculty_id: item.faculty_id,
                l: item.l, t: item.t, p: item.p,
                isLab: item.isLab,
                academicYear: "2026-2027"
            });
        });

        // --- DIVISION D (Cyber Security - D004) ---
        const divD = [
            { course_id: "26MCAC101", faculty_id: facultyLookup.ashwini_joshi, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC102", faculty_id: facultyLookup.pallavi_gaikwad, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC103", faculty_id: facultyLookup.pradnya, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC104", faculty_id: facultyLookup.harshit, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC105", faculty_id: facultyLookup.vinod, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "26MCAC106", faculty_id: facultyLookup.anjali_sharma, l: "3", t: "0", p: "1", isLab: false },
            { course_id: "26MCACL101", faculty_id: facultyLookup.pradnya, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCACL102", faculty_id: facultyLookup.pallavi_gaikwad, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "26MCCB101", faculty_id: facultyLookup.vinod, l: "3", t: "0", p: "0", isLab: false }
        ];

        divD.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S001_${allocCounter++}`,
                semester_id: "S001",
                program_id: "P001",
                division_id: "D004",
                course_id: item.course_id,
                faculty_id: item.faculty_id,
                l: item.l, t: item.t, p: item.p,
                isLab: item.isLab,
                academicYear: "2026-2027"
            });
        });

        await SubjectAllocation.insertMany(newAllocations);
        console.log(`Successfully seeded ${newAllocations.length} Subject Allocations for MCA Sem 1 (S001)!`);

    } catch (err) {
        console.error("Error seeding MCA Sem 1:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

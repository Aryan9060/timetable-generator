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
        console.log("Connected to MongoDB for MCA Sem 3 seeding!");

        // 1. Seed Courses for MCA Sem 3
        const mcaSem3Courses = [
            { course_id: "25MCAC301", course_name: "Software Engineering & Object Oriented Analysis Design", credit: "3", isActive: true },
            { course_id: "25MCAC302", course_name: "Advance Java Programming", credit: "3", isActive: true },
            { course_id: "25MCAC303", course_name: "Optimization Techniques", credit: "3", isActive: true },
            { course_id: "25MCAC304", course_name: "Advanced Web Technology", credit: "3", isActive: true },
            { course_id: "25MCAC305", course_name: "Research Methodology & Research Tools", credit: "3", isActive: true },
            { course_id: "25MCAC306", course_name: "Summer Internship Program", credit: "4", isActive: true },
            { course_id: "25MCCC301", course_name: "Cloud Architecture", credit: "3", isActive: true },
            { course_id: "25MCCC303", course_name: "Cloud Economics, Security with Data Visualization", credit: "3", isActive: true },
            { course_id: "25MCCCE1302", course_name: "Introduction to Cloud and Visualization", credit: "3", isActive: true },
            { course_id: "25MCDS301", course_name: "Data Analytics Application using AI & ML", credit: "3", isActive: true },
            { course_id: "25MCDS302", course_name: "Data Handling & Preprocessing", credit: "3", isActive: true },
            { course_id: "25MCDS303", course_name: "Data Mining and Data Warehousing", credit: "3", isActive: true },
            { course_id: "25MCCB301", course_name: "Cloud Security Management", credit: "3", isActive: true },
            { course_id: "25MCCBL302", course_name: "Cyber Security Analytics", credit: "3", isActive: true },
            { course_id: "25MCCSE1302", course_name: "Cyber Threat Analytics", credit: "3", isActive: true },
            { course_id: "25MCAL301", course_name: "Lab - I Advance Java Programming", credit: "2", isActive: true },
            { course_id: "25MCAL302", course_name: "Lab - II Advanced Web Technology & OOAD Lab", credit: "2", isActive: true },
            { course_id: "25MCCCL301", course_name: "Lab III: Cloud Architecture", credit: "2", isActive: true },
            { course_id: "25MCDSL301", course_name: "Lab III: Data Analytics Application using AI & ML", credit: "2", isActive: true },
            { course_id: "25MCCBL301", course_name: "Lab III: Cloud Security Management", credit: "2", isActive: true },
        ];

        for (const c of mcaSem3Courses) {
            await Course.updateOne({ course_id: c.course_id }, { $set: c }, { upsert: true });
        }
        console.log("MCA Sem 3 Courses seeded!");

        // 2. Map and ensure Faculty IDs
        const db = mongoose.connection.db;
        const allFaculties = await db.collection("faculties").find({}).toArray();
        
        // Helper to find faculty_id by name or partial name
        const findFacultyId = (searchTerms, fallbackName, email) => {
            const termList = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
            for (const f of allFaculties) {
                const name = (f.name || f.faculty_name || "").toLowerCase();
                if (termList.some(t => name.includes(t.toLowerCase()))) {
                    return f.faculty_id;
                }
            }
            return null;
        };

        // Custom mappings according to the sheets:
        const facultyLookup = {
            "hanifkhan": findFacultyId(["hanifkha", "hanif"], "Prof. Hanifkhan Pathan") || "F002",
            "alkawati": findFacultyId(["alkawati"], "Dr. Alkawati Magadum") || "F001",
            "jagruti": findFacultyId(["jagruti"], "Prof. Jagruti Kambari") || "F069",
            "dharmendra": findFacultyId(["dharmendra"], "Prof. Dharmendra Singh") || "F005",
            "pradnya": findFacultyId(["pradnya"], "Dr. Pradnya Muley") || "F007",
            "deepak_ulape": findFacultyId(["deepak ulape", "ulape"], "Prof. Deepak V Ulape") || "F006",
            "satyakam": findFacultyId(["satyakam", "rahul satyakam"], "Dr. Rahul Satyakam") || "F004",
            "rahul_sharma": findFacultyId(["rahul sharma"], "Prof. Rahul Sharma") || "F010",
            "snehal_dhane": findFacultyId(["snehal dhane", "snehal"], "Prof. Snehal Dhane") || "F060",
            "archana_singh": findFacultyId(["archana"], "Dr. Archana N Singh") || "F026",
            "pratibha_tiwari": findFacultyId(["pratibha tiwari"], "Prof. Pratibha Tiwari") || "F009",
            "netra_patil": findFacultyId(["netra"], "Dr. Netra Patil") || "F070",
            "ekta_talwar": findFacultyId(["ekta"], "Dr. Ekta Talwar") || "F065",
            "pallavi_gaikwad": findFacultyId(["pallavi"], "Prof. Pallavi Gaikwad") || "F018",
            "harshit": findFacultyId(["harshit"], "Prof. Harshit Kumar") || "F008",
            "swati_sayankar": findFacultyId(["swati"], "Prof. Swati Sayankar") || "F071"
        };

        // Create missing faculties in db if they don't exist yet
        const missingFaculties = [
            { faculty_id: "F069", name: "Prof. Jagruti Kambari", email: "jagruti.kambari@mituniversity.edu.in", department: "MCA" },
            { faculty_id: "F070", name: "Dr. Netra Patil", email: "netra.patil@mituniversity.edu.in", department: "MCA" },
            { faculty_id: "F071", name: "Prof. Swati Sayankar", email: "swati.sayankar@mituniversity.edu.in", department: "MCA" }
        ];

        for (const mf of missingFaculties) {
            await Faculty.updateOne({ faculty_id: mf.faculty_id }, { $set: mf }, { upsert: true });
        }
        console.log("Faculties verified/updated!");

        // 3. Clear existing S003 subject allocations and curriculums
        await SubjectAllocation.deleteMany({ semester_id: "S003" });
        await Curriculum.deleteMany({ semester_id: "S003" });

        // 4. Seed Curriculum for S003
        const sem3Curriculum = {
            program_id: "P001",
            semester_id: "S003",
            academicYear: "2025-2026",
            subjects: [
                { course_id: "25MCAC301", isSpecialization: false },
                { course_id: "25MCAC302", isSpecialization: false },
                { course_id: "25MCAC303", isSpecialization: false },
                { course_id: "25MCAC304", isSpecialization: false },
                { course_id: "25MCAC305", isSpecialization: false },
                { course_id: "25MCAC306", isSpecialization: false },
                { course_id: "25MCCC301", isSpecialization: true, specialization_id: "SP001" },
                { course_id: "25MCCC303", isSpecialization: true, specialization_id: "SP001" },
                { course_id: "25MCCCE1302", isSpecialization: true, specialization_id: "SP001" },
                { course_id: "25MCDS301", isSpecialization: true, specialization_id: "SP002" },
                { course_id: "25MCDS302", isSpecialization: true, specialization_id: "SP002" },
                { course_id: "25MCDS303", isSpecialization: true, specialization_id: "SP002" },
                { course_id: "25MCCB301", isSpecialization: true, specialization_id: "SP003" },
                { course_id: "25MCCBL302", isSpecialization: true, specialization_id: "SP003" },
                { course_id: "25MCCSE1302", isSpecialization: true, specialization_id: "SP003" },
            ]
        };
        await Curriculum.create(sem3Curriculum);
        console.log("Curriculum created for S003!");

        // 5. Seed Subject Allocations for S003
        let allocCounter = 1;
        const newAllocations = [];

        // --- DIVISION A (Cloud Computing - D001) ---
        const divA = [
            { course_id: "25MCAC301", faculty_id: facultyLookup.hanifkhan, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC302", faculty_id: facultyLookup.alkawati, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC303", faculty_id: facultyLookup.jagruti, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC304", faculty_id: facultyLookup.dharmendra, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC305", faculty_id: facultyLookup.pradnya, l: "2", t: "0", p: "1", isLab: false },
            { course_id: "25MCAC306", faculty_id: facultyLookup.deepak_ulape, l: "0", t: "0", p: "4", isLab: true },
            { course_id: "25MCCC301", faculty_id: facultyLookup.hanifkhan, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCCC303", faculty_id: facultyLookup.satyakam, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCCCE1302", faculty_id: facultyLookup.rahul_sharma, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAL301", faculty_id: facultyLookup.alkawati, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCAL302", faculty_id: facultyLookup.dharmendra, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCCCL301", faculty_id: facultyLookup.hanifkhan, l: "0", t: "0", p: "2", isLab: true }
        ];

        divA.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S003_${allocCounter++}`,
                semester_id: "S003",
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
            { course_id: "25MCAC301", faculty_id: facultyLookup.hanifkhan, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC302", faculty_id: facultyLookup.alkawati, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC303", faculty_id: facultyLookup.jagruti, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC304", faculty_id: facultyLookup.dharmendra, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC305", faculty_id: facultyLookup.archana_singh, l: "2", t: "0", p: "1", isLab: false },
            { course_id: "25MCAC306", faculty_id: facultyLookup.deepak_ulape, l: "0", t: "0", p: "4", isLab: true },
            { course_id: "25MCDS301", faculty_id: facultyLookup.deepak_ulape, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCDS302", faculty_id: facultyLookup.pratibha_tiwari, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCDS303", faculty_id: facultyLookup.rahul_sharma, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAL301", faculty_id: facultyLookup.alkawati, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCAL302", faculty_id: facultyLookup.dharmendra, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCDSL301", faculty_id: facultyLookup.deepak_ulape, l: "0", t: "0", p: "2", isLab: true }
        ];

        divB.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S003_${allocCounter++}`,
                semester_id: "S003",
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
            { course_id: "25MCAC301", faculty_id: facultyLookup.snehal_dhane, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC302", faculty_id: facultyLookup.netra_patil, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC303", faculty_id: facultyLookup.jagruti, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC304", faculty_id: facultyLookup.dharmendra, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC305", faculty_id: facultyLookup.archana_singh, l: "2", t: "0", p: "1", isLab: false },
            { course_id: "25MCAC306", faculty_id: facultyLookup.deepak_ulape, l: "0", t: "0", p: "4", isLab: true },
            { course_id: "25MCDS301", faculty_id: facultyLookup.deepak_ulape, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCDS302", faculty_id: facultyLookup.pratibha_tiwari, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCDS303", faculty_id: facultyLookup.rahul_sharma, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAL301", faculty_id: facultyLookup.netra_patil, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCAL302", faculty_id: facultyLookup.alkawati, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCDSL301", faculty_id: facultyLookup.deepak_ulape, l: "0", t: "0", p: "2", isLab: true }
        ];

        divC.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S003_${allocCounter++}`,
                semester_id: "S003",
                program_id: "P001",
                division_id: "D003",
                course_id: item.course_id,
                faculty_id: item.faculty_id,
                l: item.l, t: item.t, p: item.p,
                isLab: item.isLab,
                academicYear: "2026-2027"
            });
        });

        // --- DIVISION D (Cyber / Cloud Security - D004) ---
        const divD = [
            { course_id: "25MCAC301", faculty_id: facultyLookup.snehal_dhane, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC302", faculty_id: facultyLookup.netra_patil, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC303", faculty_id: facultyLookup.jagruti, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC304", faculty_id: facultyLookup.dharmendra, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAC305", faculty_id: facultyLookup.ekta_talwar, l: "2", t: "0", p: "1", isLab: false },
            { course_id: "25MCAC306", faculty_id: facultyLookup.deepak_ulape, l: "0", t: "0", p: "4", isLab: true },
            { course_id: "25MCCB301", faculty_id: facultyLookup.satyakam, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCCBL302", faculty_id: facultyLookup.pallavi_gaikwad, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCCSE1302", faculty_id: facultyLookup.harshit, l: "3", t: "0", p: "0", isLab: false },
            { course_id: "25MCAL301", faculty_id: facultyLookup.netra_patil, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCAL302", faculty_id: facultyLookup.dharmendra, l: "0", t: "0", p: "2", isLab: true },
            { course_id: "25MCCBL301", faculty_id: facultyLookup.swati_sayankar, l: "0", t: "0", p: "2", isLab: true }
        ];

        divD.forEach(item => {
            newAllocations.push({
                subjectAllocation_id: `SA_S003_${allocCounter++}`,
                semester_id: "S003",
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
        console.log(`Successfully seeded ${newAllocations.length} Subject Allocations for MCA Sem 3 (S003)!`);

    } catch (err) {
        console.error("Error seeding MCA Sem 3:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

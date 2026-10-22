import mongoose from "mongoose";
import { Curriculum } from "./src/models/curriculum.models.js";
import { Division } from "./src/models/division.models.js";
import { SubjectAllocation } from "./src/models/subjectAllocation.models.js";
import { Course } from "./src/models/course.models.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        const mongoUri = `${process.env.MONGODB_URI || "mongodb://localhost:27017/"}timetable`;
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB!");

        // Add Combined Lab Courses if they don't exist
        const combinedLabs = [
            { course_id: "C_WT_JAVA_LAB", course_name: "WT AND JAVA COMBINED LAB", credit: "2", isActive: true },
            { course_id: "C_LINUX_ADBMS_LAB", course_name: "LINUX AND ADBMS COMBINED LAB", credit: "2", isActive: true },
        ];
        for (const cl of combinedLabs) {
            await Course.updateOne({ course_id: cl.course_id }, { $set: cl }, { upsert: true });
        }

        // Get S002 P001 curriculum
        const curr = await Curriculum.findOne({ program_id: "P001", semester_id: "S002" });
        if (!curr) {
            console.log("Curriculum not found!");
            return;
        }

        // Get Divisions
        const divisions = await Division.find({});
        
        await SubjectAllocation.deleteMany({ program_id: "P001", semester_id: "S002" });

        let allocCount = 1;
        const newAllocations = [];

        // Get all faculties to distribute among subjects
        const faculties = await mongoose.connection.db.collection('faculties').find({}).toArray();
        let facultyIndex = 0;
        const getNextFaculty = () => {
            const f = faculties[facultyIndex % faculties.length];
            facultyIndex++;
            return f.faculty_id;
        };

        const courseFacultyMap = {
            "C_ADBMS": "F058",      // Prof. Anand Bhaskar (dbms)
            "C_DAA": "F004",        // Dr. Rahul Satyakam (algorithms)
            "C006": "F013",         // Dr. Vijaya Gondane (operating system)
            "C_LOGICAL": "F037",    // Dr. Chandresh Chakraborty (logical aptitude)
            "C017": "F060",         // Prof. Snehal Belkhode (java programming)
            "C011": "F002",         // Prof. Hanifkha Pathan (web technology)
            "C033": "F011",         // Prof. Laveena Bhatia (accounting)
            "C024": "F063",         // Snehal Patil (cloud computing)
            "C165": "F007",         // Dr. Pradnya Mulye (data science)
            "C007": "F003",         // Prof. Vinod Charawande (ethical hacking)
            "C_WT_JAVA_LAB": "F060",
            "C_LINUX_ADBMS_LAB": "F058",
            "C_AFM_LAB": "F011"
        };

        for (const div of divisions) {
            if (!div.classTeacher_id) continue;
            // Assign Core Subjects
            const coreSubjects = curr.subjects.filter(s => !s.isSpecialization);
            for (const sub of coreSubjects) {
                const fId = courseFacultyMap[sub.course_id] || getNextFaculty();
                newAllocations.push({
                    subjectAllocation_id: `SA_GEN_${allocCount++}`,
                    semester_id: "S002",
                    program_id: "P001",
                    division_id: div.division_id,
                    course_id: sub.course_id,
                    faculty_id: fId,
                    l: "3", t: "0", p: "0", isLab: false,
                    academicYear: "2025-2026"
                });
            }

            // Assign Specialization
            let specSubjects;
            if (div.division_id === "D004") {
                // Div D has both Data Science (SP002) and Ethical Hacking (SP003) students sitting together
                specSubjects = curr.subjects.filter(s => s.isSpecialization && (s.specialization_id === "SP002" || s.specialization_id === "SP003"));
            } else {
                specSubjects = curr.subjects.filter(s => s.isSpecialization && s.specialization_id === div.specialization_id);
            }
            for (const sub of specSubjects) {
                const fId = courseFacultyMap[sub.course_id] || getNextFaculty();
                newAllocations.push({
                    subjectAllocation_id: `SA_GEN_${allocCount++}`,
                    semester_id: "S002",
                    program_id: "P001",
                    division_id: div.division_id,
                    course_id: sub.course_id,
                    faculty_id: fId,
                    l: "3", t: "0", p: "0", isLab: false,
                    academicYear: "2025-2026"
                });
            }

            // Assign Labs (p=2)
            newAllocations.push({
                subjectAllocation_id: `SA_GEN_${allocCount++}`,
                semester_id: "S002",
                program_id: "P001",
                division_id: div.division_id,
                course_id: "C_WT_JAVA_LAB",
                faculty_id: courseFacultyMap["C_WT_JAVA_LAB"] || getNextFaculty(),
                l: "0", t: "0", p: "2", isLab: true,
                academicYear: "2025-2026"
            });
            newAllocations.push({
                subjectAllocation_id: `SA_GEN_${allocCount++}`,
                semester_id: "S002",
                program_id: "P001",
                division_id: div.division_id,
                course_id: "C_LINUX_ADBMS_LAB",
                faculty_id: courseFacultyMap["C_LINUX_ADBMS_LAB"] || getNextFaculty(),
                l: "0", t: "0", p: "2", isLab: true,
                academicYear: "2025-2026"
            });
            newAllocations.push({
                subjectAllocation_id: `SA_GEN_${allocCount++}`,
                semester_id: "S002",
                program_id: "P001",
                division_id: div.division_id,
                course_id: "C_AFM_LAB",
                faculty_id: courseFacultyMap["C_AFM_LAB"] || getNextFaculty(),
                l: "0", t: "0", p: "2", isLab: true,
                academicYear: "2025-2026"
            });
        }

        await SubjectAllocation.insertMany(newAllocations);
        console.log(`Inserted ${newAllocations.length} allocations for S002 P001!`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

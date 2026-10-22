import mongoose from "mongoose";
import { Program } from "./src/models/program.models.js";
import { Division } from "./src/models/division.models.js";
import { Specialization } from "./src/models/specialization.models.js";
import { Semester } from "./src/models/semester.models.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        const mongoUri = `${process.env.MONGODB_URI || "mongodb://localhost:27017/"}timetable`;
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB for Master Structure Seeding!");

        // 1. Programs
        const programs = [
            { program_id: "P001", program_name: "MCA", program_duration: "2 Years", isActive: true },
            { program_id: "P002", program_name: "MCA - CLOUD COMPUTING", program_duration: "2 Years", isActive: true },
            { program_id: "P003", program_name: "MCA - DATA SCIENCE", program_duration: "2 Years", isActive: true },
            { program_id: "P004", program_name: "MCA - CYBERSECURITY", program_duration: "2 Years", isActive: true },
            { program_id: "P005", program_name: "MBA", program_duration: "2 Years", isActive: true },
            { program_id: "P006", program_name: "M.TECH - CONSTRUCTION MANAGEMENT", program_duration: "2 Years", isActive: true },
        ];

        for (const p of programs) {
            await Program.updateOne({ program_id: p.program_id }, { $set: p }, { upsert: true });
        }
        console.log("Programs updated!");

        // 2. Divisions (A to H)
        const divisions = [
            { division_id: "D001", division_name: "A" },
            { division_id: "D002", division_name: "B" },
            { division_id: "D003", division_name: "C" },
            { division_id: "D004", division_name: "D" },
            { division_id: "D005", division_name: "E" },
            { division_id: "D006", division_name: "F" },
            { division_id: "D007", division_name: "G" },
            { division_id: "D008", division_name: "H" },
        ];

        for (const d of divisions) {
            await Division.updateOne({ division_id: d.division_id }, { $set: d }, { upsert: true });
        }
        console.log("Divisions updated!");

        // 3. Semesters (Odd & Even)
        const semesters = [
            { semester_id: "S001", semester_name: "SEMESTER I", isEven: false },
            { semester_id: "S002", semester_name: "SEMESTER II", isEven: true },
            { semester_id: "S003", semester_name: "SEMESTER III", isEven: false },
            { semester_id: "S004", semester_name: "SEMESTER IV", isEven: true },
            { semester_id: "S005", semester_name: "SEMESTER V", isEven: false },
            { semester_id: "S006", semester_name: "SEMESTER VI", isEven: true },
        ];

        for (const s of semesters) {
            await Semester.updateOne({ semester_id: s.semester_id }, { $set: s }, { upsert: true });
        }
        console.log("Semesters updated!");

        console.log("Master Structure Seeding Complete!");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

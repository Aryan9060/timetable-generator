import { Schema, model } from "mongoose";

const curriculumSchema = new Schema(
  {
    program_id: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    semester_id: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    subjects: [
      {
        course_id: { type: String, required: true },
        isSpecialization: { type: Boolean, default: false },
        specialization_id: { type: String, default: null }, // Only for specialization subjects
      }
    ],
    combined_labs: [
      {
        lab_name: { type: String, required: true },
        course_ids: [{ type: String }], // Array of courses that are combined in this lab
      }
    ]
  },
  { timestamps: true },
);

export const Curriculum = model("Curriculum", curriculumSchema);

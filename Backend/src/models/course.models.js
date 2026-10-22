import { Schema, model } from "mongoose";

const courseSchema = new Schema(
  {
    course_id: {
      type: String,
      required: [true, "Course ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    course_name: {
      type: String,
      required: [true, "Course Name is required"],
      trim: true,
      uppercase: true,
    },
    credit: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Course = model("Course", courseSchema);

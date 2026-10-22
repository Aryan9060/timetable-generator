import { Schema, model } from "mongoose";

const timeTableEntrySchema = new Schema(
  {
    faculty_id: {
      type: String,
      required: [true, "Faculty ID is required"],
      uppercase: true,
      trim: true,
    },
    course_id: {
      type: String,
      required: [true, "Course ID is required"],
      uppercase: true,
      trim: true,
    },
    entry_id: {
      type: String,
      required: [true, "Entry ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    class_group: {
      type: String,
      required: [true, "Class group is required"],
      uppercase: true,
      trim: true,
    },
    semester_id: {
      type: String,
      uppercase: true,
      trim: true,
      default: "S001",
    },
    program_id: {
      type: String,
      uppercase: true,
      trim: true,
    },
    day_of_week: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: [true, "Day of week is required"],
      lowercase: true,
      trim: true,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    slot_id: {
      type: String,
      required: [true, "Slot ID is required"],
      uppercase: true,
      trim: true,
    },
    room_no: {
      type: String,
      required: [true, "Room number is required"],
      uppercase: true,
      trim: true,
    },
    block: {
      type: String,
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const TimeTableEntry = model("TimeTableEntry", timeTableEntrySchema);

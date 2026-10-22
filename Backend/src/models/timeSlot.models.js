import { Schema, model } from "mongoose";

const timeSlotSchema = new Schema(
  {
    slot_id: {
      type: String,
      required: [true, "Slot ID is required"],
      unique: true,
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
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      // trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      // trim: true,
    },
    slot_type: {
      type: String,
      enum: ["LECTURE", "LAB", "BREAK", "LUNCH"],
      required: [true, "Slot type is required"],
      uppercase: true,
    },
    isBreak: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const TimeSlot = model("TimeSlot", timeSlotSchema);

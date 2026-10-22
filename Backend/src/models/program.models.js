import { Schema, model } from "mongoose";

const programSchema = new Schema(
  {
    program_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    program_name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    program_duration: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Program = model("Program", programSchema);

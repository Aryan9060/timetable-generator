import { Schema, model } from "mongoose";

const specializationSchema = new Schema(
  {
    specialization_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    specialization_name: {
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

export const Specialization = model("Specialization", specializationSchema);

import { Schema, model } from "mongoose";

const qualificationTypeSchema = new Schema(
  {
    qualification_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    qualification_name: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const QualificationType = model("QualificationType", qualificationTypeSchema);

import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    room_no: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    floor_no: {
      type: String,
      required: true,
      trim: true,
    },
    block: {
      type: String,
      required: true, 
      uppercase: true,
      trim: true,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

roomSchema.index({ room_no: 1, block: 1 }, { unique: true });

export const Room = model("Room", roomSchema);

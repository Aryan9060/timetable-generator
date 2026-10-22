import { Schema, model } from "mongoose";

const divisionSchema = new Schema({
  
  division_id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  division_name: {
    type: String,
    required: true,
    uppercase: true,
  },

  description: {
    type: String,
    trim: true,
  },
  classTeacher_id: {
    type: String,
    uppercase: true,
    trim: true,
  },
  specialization_id: {
    type: String,
    uppercase: true,
    trim: true,
  },
  preferredRoom_no: {
    type: String,
    uppercase: true,
    trim: true,
  },
  preferredRoom_block: {
    type: String,
    uppercase: true,
    trim: true,
  }

},{timestamps:true});

export const Division = model("Division", divisionSchema);

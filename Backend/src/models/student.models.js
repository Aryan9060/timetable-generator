import { model, Schema } from "mongoose";

const studentSchema = new Schema(
  {
    student_id: {
      type: String,
      required: [true, "Student id is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    student_name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "{VALUE} is not a valid email address",
      },
      unique: true,
      trim: true,
    },

    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },

    batch: {
      type: String,
      required: [true, "Batch is required"],
      trim: true,
    },

    date_of_birth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
  },
  { timestamps: true },
);

export const Student = model("Student", studentSchema);

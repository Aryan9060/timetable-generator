import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    user_id: {
      type: String,
      // required: [true, "User ID is required"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      lowercase: true,
      enum: {
        values: ["admin", "faculty", "student", "coordinator", "hod"],
        message: "{VALUE} role is not supported",
      },
      trim: true,
    },

    student_id: {
      type: String,
      default: null,
    },

    faculty_id: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// * Pre-save hook to generate user_id and hash password
// userSchema.pre("save", async function () {
//   try {
//     // * Generate user_id based on role and student/faculty id
//     console.log("User Id in Model :- ",this.user_id);

//     if (this.isNew && !this.user_id) {
      
//       const rolePrefix = this.role
//         ? this.role.substring(0, 3).toUpperCase()
//         : "USR";

//       if (this.student_id) {
//         this.user_id = `${rolePrefix}${this.student_id}`;
//       } else if (this.faculty_id) {
//         this.user_id = `${rolePrefix}${this.faculty_id}`;
//       } else {
//         // * For roles without student/faculty id, generate unique id

//         const timestamp = Date.now().toString(36).toUpperCase();
//         const random = Math.random().toString(36).substring(2, 6).toUpperCase();
//         this.user_id = `${rolePrefix}${timestamp}${random}`;
//       }
//     }

//     //* Hash password if modified
//     if (this.isModified("password")) {
//       const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
//       this.password = await bcrypt.hash(this.password, saltRounds);
//     }
//   } catch (error) {
//     //! Handle error
//     console.log("User Id in Model :- ",this.user_id);
    
//     console.error("Error in userSchema pre-save hook:", error);
//   }
// });

// * Pre-save hook to generate user_id and hash password
userSchema.pre("save", async function (next) {
  try {
    const prefix = this.role ? this.role.substring(0, 3).toUpperCase() : "USR";

    // * Generate user_id based on role and student/faculty id
    if (this.isNew && !this.user_id) {
      switch (this.role) {
        case "admin":
        case "coordinator":
          this.user_id = this.student_id ? `${prefix}${this.student_id}` : null;
          break;
        case "faculty":
          this.user_id = this.faculty_id ? `${prefix}${this.faculty_id}` : null;
          break;
        case "student":
          this.user_id = this.student_id ? `${prefix}${this.student_id}` : null;
          break;
        case "hod":
          this.user_id = this.faculty_id ? `${prefix}${this.faculty_id}` : null;
          break;
        default:
          // * For roles without student/faculty id, generate unique id
          const timestamp = Date.now().toString(36).toUpperCase();
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          this.user_id = `${prefix}${timestamp}${random}`;
      }
    }

    // * Hash password if modified
    if (this.isModified("password")) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }

    // next();
  } catch (error) {
    console.error("Error in userSchema pre-save hook:", error);
    // next(error);
  }
});
//* Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = model("User", userSchema);

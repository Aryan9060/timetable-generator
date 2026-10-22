import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parsePaginationParams } from "../utils/pagination.js";
import {
  generateTokens,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  verifyRefreshToken,
} from "../utils/Token.js";
import mongoose from "mongoose";
import { Student } from "../models/student.models.js";
import { Faculty } from "../models/faculty.models.js";
import bcrypt from "bcryptjs";
// import Faculty from "../../../Client/src/pages/dashboard/Faculty.jsx";

//* Register new user (single or multiple)
export const registerUser = asyncHandler(async (req, res) => {
  const users = req.body;

  console.log("Body -->", req.body);
  console.log("Users -->", req.user);

  // //! Handle single user registration
  // if (!Array.isArray(users)) {
  //   const { password, role, student_id, faculty_id, created_by } = users;

  //   //* Validate required fields
  //   if (!password || !role || (!student_id && !faculty_id)) {
  //     throw ApiError.badRequest(
  //       "Password, role, and student_id or faculty_id are required",
  //     );
  //   }

  //   //! Check for existing user
  //   const existingUser = await User.findOne({
  //     $or: [
  //       { student_id: student_id || null },
  //       { faculty_id: faculty_id || null },
  //     ],
  //   });

  //   if (existingUser) {
  //     throw ApiError.conflict(
  //       "User with this student_id or faculty_id already exists",
  //     );
  //   }

  //   //! Check for existing student or faculty
  //   const existingStudent = await Student.findOne({
  //     student_id: student_id || null,
  //   });
  //   const existingFaculty = await Faculty.findOne({
  //     faculty_id: faculty_id || null,
  //   });

  //   //! Check if student or faculty exists
  //   if (!existingStudent && !existingFaculty) {
  //     throw ApiError.badRequest(
  //       "Student or Faculty with this student_id or faculty_id does not exist",
  //     );
  //   }

  //   const hashedPassword = await User.hashPassword(password);

  //   //! Create user
  //   const newUser = await User.create({
  //     password: hashedPassword,
  //     role: role.toLowerCase(),
  //     student_id: student_id || null,
  //     faculty_id: faculty_id || null,
  //     created_by: created_by || null,
  //   });

  //   const createdUser = await User.findById(newUser._id).select(
  //     "-password -refreshToken",
  //   );

  //   return ApiResponse.created(
  //     createdUser,
  //     "User registered successfully",
  //   ).send(res);
  // }

  //! Handle multiple user registration (bulk)
  if (users.length === 0) {
    throw ApiError.badRequest("User data is required and must be an array");
  }

  //* Validate each user
  users.forEach((u) => {
    if (!u.password) {
      throw ApiError.badRequest("Password is required");
    }
    if (!u.role) {
      throw ApiError.badRequest("Role is required");
    }
    if (!u.student_id && !u.faculty_id) {
      throw ApiError.badRequest("Student ID or Faculty ID is required");
    }
  });

  //* Find unique records
  const studentIds = users.filter((u) => u.student_id).map((u) => u.student_id);
  const facultyIds = users.filter((u) => u.faculty_id).map((u) => u.faculty_id);

  const existingUsers = await User.find({
    $or: [
      { student_id: { $in: studentIds } },
      { faculty_id: { $in: facultyIds } },
    ],
  });

  const existingStudentIds = new Set(
    existingUsers
      .filter((u) => u.student_id)
      .map((u) => u.student_id.toString()),
  );
  const existingFacultyIds = new Set(
    existingUsers
      .filter((u) => u.faculty_id)
      .map((u) => u.faculty_id.toString()),
  );

  const uniqueUserRecords = users.filter((u) => {
    if (u.student_id && existingStudentIds.has(u.student_id.toString())) {
      return false;
    }
    if (u.faculty_id && existingFacultyIds.has(u.faculty_id.toString())) {
      return false;
    }
    return true;
  });

  if (uniqueUserRecords.length === 0) {
    throw ApiError.conflict("All provided users already exist in the database");
  }

  console.log("Unique User Records -->", uniqueUserRecords);

  //* Process each user: generate user_id and hash password
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  const processedUsers = await Promise.all(
    uniqueUserRecords.map(async (u) => {
      const prefix = u.role ? u.role.substring(0, 3).toUpperCase() : "USR";

      // * Generate user_id based on role

      switch (u.role) {
        case "admin":
          u.user_id = u.student_id ? `${prefix}${u.student_id}` : u.faculty_id ? `${prefix}${u.faculty_id}` : null;
          break;

        case "coordinator":
          u.user_id = u.student_id ? `${prefix}${u.student_id}` : u.faculty_id ? `${prefix}${u.faculty_id}` : null;
          break;

        case "faculty":
          u.user_id = u.student_id ? `${prefix}${u.student_id}` : u.faculty_id ? `${prefix}${u.faculty_id}` : null;
          break;

        case "student":
          u.user_id = u.student_id ? `${prefix}${u.student_id}` : u.faculty_id ? `${prefix}${u.faculty_id}` : null;
          break;

        case "hod":
          u.user_id = u.student_id ? `${prefix}${u.student_id}` : u.faculty_id ? `${prefix}${u.faculty_id}` : null;
          console.log("HOD User ID -->", u.user_id);
          break;

        default:
          const timestamp = Date.now().toString(36).toUpperCase();
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          u.user_id = `${prefix}${timestamp}${random}`;
      }


      // * Hash password
      u.password = await bcrypt.hash(u.password, saltRounds);

      // * created by
      u.created_by = `${req.user.user_name} - ${req.user.role}` || null;
      return u;
    }),
  );

  //* Save in database
  const userRecords = await User.insertMany(processedUsers);
  console.log("User -->", userRecords);

  if (userRecords.length === 0) {
    throw ApiError.internal("Failed to register users");
  }

  return ApiResponse.created(userRecords, "Users registered successfully").send(
    res,
  );
});

//! Get all users with pagination
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;
  const skip = (page - 1) * limit;

  //! Build match filter for search
  let matchFilter = {};
  if (search) {
    matchFilter.$or = [
      { role: { $regex: search, $options: "i" } },
      { student_id: { $regex: search, $options: "i" } },
      { faculty_id: { $regex: search, $options: "i" } },
    ];
  }

  //! Field-specific filters
  Object.keys(fieldFilters).forEach((key) => {
    if (
      key.startsWith("filter_") &&
      fieldFilters[key] !== undefined &&
      fieldFilters[key] !== ""
    ) {
      const fieldName = key.replace("filter_", "");
      const value = fieldFilters[key];

      //! Handle boolean filters
      if (value === "true" || value === "false") {
        matchFilter[fieldName] = value === "true";
      } else {
        matchFilter[fieldName] = value;
      }
    }
  });

  //! Build sort
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort = { createdAt: -1 };
  }

  //! Get total count
  const totalCount = await User.countDocuments(matchFilter);

  //! Get paginated users with their name and email
  const usersWithDetails = await User.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: "students", //! Lookup students collection
        localField: "student_id",
        foreignField: "student_id",
        as: "student_data",
      },
    },
    {
      $lookup: {
        from: "faculties",
        localField: "faculty_id",
        foreignField: "faculty_id",
        as: "faculty_data",
      },
    },
    {
      $addFields: {
        user_data: {
          $cond: {
            if: { $gt: [{ $size: "$student_data" }, 0] },
            then: { $arrayElemAt: ["$student_data", 0] },
            else: { $arrayElemAt: ["$faculty_data", 0] },
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        student_data: 0,
        faculty_data: 0,
      },
    },
    { $unwind: "$user_data" },
    {
      $project: {
        role: 1,
        user_id: 1,
        student_id: 1,
        faculty_id: 1,
        user_name: {
          $cond: {
            if: { $eq: ["$faculty_id", null] },
            then: "$user_data.student_name",
            else: "$user_data.faculty_name",
          },
        },
        email: "$user_data.email",
        isActive: 1,
        created_by: 1,
        updated_by: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      },
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const result = {
    data: usersWithDetails,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: skip,
      endIndex: skip + usersWithDetails.length,
    },
  };

  return ApiResponse.ok(result, "Users retrieved successfully").send(res);
});

//! Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("User Id -->", id);

  if (!id) {
    throw ApiError.badRequest("User ID is required");
  }

  //* Fetching data from database
  const getUserData = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "students",
        localField: "student_id",
        foreignField: "student_id",
        as: "student_data",
      },
    },
    {
      $lookup: {
        from: "faculties",
        localField: "faculty_id",
        foreignField: "faculty_id",
        as: "faculty_data",
      },
    },
    {
      $addFields: {
        user_data: {
          $cond: {
            if: { $gt: [{ $size: "$student_data" }, 0] },
            then: { $arrayElemAt: ["$student_data", 0] },
            else: { $arrayElemAt: ["$faculty_data", 0] },
          },
        },
      },
    },
    {
      $project: {
        role: 1,
        user_id: 1,
        student_id: 1,
        faculty_id: 1,
        user_name: {
          $cond: {
            if: { $eq: ["$faculty_id", null] },
            then: "$user_data.student_name",
            else: "$user_data.faculty_name",
          },
        },
        email: "$user_data.email",
        isActive: 1,
        created_by: 1,
        updated_by: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      },
    },
  ]);

  if (getUserData.length === 0) {
    throw ApiError.notFound("User not found");
  }

  return ApiResponse.ok(getUserData[0], "User fetched successfully").send(res);
});

//* Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("User ID is required");
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw ApiError.badRequest("User data is required");
  }

  const { password, role, updated_by, isActive } = req.body;

  //! Build update object
  const updateData = {};
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (updated_by) updateData.updated_by = updated_by;

  //! Handle password update separately to trigger hashing
  if (password) {
    if (password.length < 6) {
      throw ApiError.badRequest("Password must be at least 6 characters long");
    }
    user.password = password;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (updated_by) user.updated_by = updated_by;

    const updatedUser = await user.save();
    const userResponse = await User.findById(updatedUser._id).select(
      "-password -refreshToken",
    );

    return ApiResponse.ok(userResponse, "User updated successfully").send(res);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true },
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw ApiError.notFound("User not found");
  }

  return ApiResponse.ok(updatedUser, "User updated successfully").send(res);
});

//! Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("User ID is required");
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return ApiResponse.ok(user, "User deleted successfully").send(res);
});

// * Login with password hashing and JWT tokens
export const userLogin = async (req, res) => {
  const { user_id, password } = req.body;
  console.log(req.body);

  // ? Validate input
  if (!user_id?.trim() || !password?.trim()) {
    throw ApiError.badRequest("User ID and password are required");
  }

  console.log("User Id -->", user_id);

  // ? Find user by user_id
  const user = await User.findOne({ user_id });

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // ? Check if user is active
  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated. Please contact admin.");
  }

  // ! Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // * Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // * Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // * Get user details with student/faculty info
  const userWithDetails = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(user._id) } },
    {
      $lookup: {
        from: "students",
        localField: "student_id",
        foreignField: "student_id",
        as: "student_data",
      },
    },
    {
      $lookup: {
        from: "faculties",
        localField: "faculty_id",
        foreignField: "faculty_id",
        as: "faculty_data",
      },
    },
    {
      $addFields: {
        user_data: {
          $cond: {
            if: { $gt: [{ $size: "$student_data" }, 0] },
            then: { $arrayElemAt: ["$student_data", 0] },
            else: { $arrayElemAt: ["$faculty_data", 0] },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        role: 1,
        isActive: 1,
        user_id: 1,
        student_id: 1,
        faculty_id: 1,
        user_name: {
          $cond: {
            if: { $ne: ["$student_id", null] },
            then: "$user_data.student_name",
            else: "$user_data.faculty_name",
          },
        },
        email: "$user_data.email",
        class_group: {
          $cond: {
            if: { $ne: ["$student_id", null] },
            then: "$user_data.class",
            else: null,
          },
        },
        class: "$user_data.class",
        specialization: "$user_data.specialization",
        batch: "$user_data.batch",
      },
    },
  ]);

  console.log("User logged in -->", userWithDetails[0]);

  //* Set cookies and send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      ApiResponse.ok(
        {
          ...userWithDetails[0],
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ).toJSON(),
    );
};

// * Logout user
export const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw ApiError.badRequest("User ID is required");
  }

  // ? Clear refresh token from database
  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: null } },
    { new: true },
  );

  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json(ApiResponse.ok({}, "User logged out successfully").toJSON());
});

//* Refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError.unauthorized("Unauthorized request - No refresh token");
  }

  //! Verify refresh token
  const decodedToken = verifyRefreshToken(incomingRefreshToken);

  if (!decodedToken) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  //* Find user
  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  //! Check if refresh token matches
  if (user.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized("Refresh token is expired or used");
  }

  //! Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  //* Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
    .json(
      ApiResponse.ok(
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully",
      ).toJSON(),
    );
});

//! Get current user from token
export const getCurrentUser = asyncHandler(async (req, res) => {
  //* User is already attached to req by verifyJWT middleware
  const user = req.user;

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  //! Get user details with student/faculty info
  const userWithDetails = await User.aggregate([
    { $match: { _id: user._id } },
    {
      $lookup: {
        from: "students",
        localField: "student_id",
        foreignField: "student_id",
        as: "student_data",
      },
    },
    {
      $lookup: {
        from: "faculties",
        localField: "faculty_id",
        foreignField: "faculty_id",
        as: "faculty_data",
      },
    },
    {
      $addFields: {
        user_data: {
          $cond: {
            if: { $gt: [{ $size: "$student_data" }, 0] },
            then: { $arrayElemAt: ["$student_data", 0] },
            else: { $arrayElemAt: ["$faculty_data", 0] },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        role: 1,
        isActive: 1,
        user_id: 1,
        student_id: 1,
        faculty_id: 1,
        user_name: {
          $cond: {
            if: { $ne: ["$student_id", null] },
            then: "$user_data.student_name",
            else: "$user_data.faculty_name",
          },
        },
        email: "$user_data.email",
        class_group: {
          $cond: {
            if: { $ne: ["$student_id", null] },
            then: "$user_data.class",
            else: null,
          }
        },
      },
    },
  ]);

  return ApiResponse.ok(
    {
      user: userWithDetails[0],
    },
    "Current user fetched successfully",
  ).send(res);
});

//* Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    throw ApiError.badRequest(
      "User ID, current password, and new password are required",
    );
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest(
      "New password must be at least 6 characters long",
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  //! Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  //* Update password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  return ApiResponse.ok({}, "Password changed successfully").send(res);
});

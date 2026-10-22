import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.models.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Register a new student
export const registerStudent = asyncHandler(async (req, res) => {
  //gating data from clint side(Array of Objects [{}])

  const students = req.body;
  console.log("Body -->", req.body);

  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "Student data is required and must be an array");
  }

  //write validation for each required fields in arrey of object
  students.forEach((student) => {
    if (!student.student_id) {
      throw new ApiError(400, "Student ID is required");
    }
    if (!student.student_name) {
      throw new ApiError(400, "Student Name is required");
    }
    if (!student.email) {
      throw new ApiError(400, "Email is required");
    }
    if (!student.class) {
      throw new ApiError(400, "Class Code is required");
    }
    if (!student.batch) {
      throw new ApiError(400, "Batch is required");
    }

    if (!student.date_of_birth) {
      throw new ApiError(400, "Date of Birth is required");
    }
    if (!student.specialization) {
      throw new ApiError(400, "Specialization is required");
    }
  });

  const arr = [];

  // fillter those recordes which is not already stored in database
  const studentIds = students.map((student) => student.student_id);
  const emails = students.map((student) => student.email);

  const existingStudents = await Student.find({
    $or: [{ student_id: { $in: studentIds } }, { email: { $in: emails } }],
  });

  const existingStudentIds = new Set(existingStudents.map((s) => s.student_id));
  const existingEmails = new Set(existingStudents.map((s) => s.email));

  //* Filter out unique recored
  const uniqueStudentRecords = students.filter(
    (student) =>
      !existingStudentIds.has(student.student_id) &&
      !existingEmails.has(student.email),
  );
  console.log("Unique Student Records -->", uniqueStudentRecords);

  if (uniqueStudentRecords.length === 0) {
    throw new ApiError(
      408,
      "All provided students already exist in the database",
    );
  }

  // save in database
  const studentRecords = await Student.insertMany(uniqueStudentRecords);
  const studentRecordsInArray = Array.from(studentRecords);

  if (studentRecordsInArray.length === 0) {
    throw new ApiError(500, "Failed to register students");
  }

  console.log("Student -->", studentRecordsInArray);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        studentRecordsInArray,
        "Student registered successfully",
      ),
    );
});

//! Get all students with pagination
export const getAllStudents = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { student_id: { $regex: search, $options: "i" } },
      { student_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { class: { $regex: search, $options: "i" } },
    ];
  }
  
  // Field-specific filters
  Object.keys(fieldFilters).forEach(key => {
    if (key.startsWith('filter_') && fieldFilters[key] !== undefined && fieldFilters[key] !== '') {
      const fieldName = key.replace('filter_', '');
      const value = fieldFilters[key];
      
      //! Handle boolean filters
      if (value === 'true' || value === 'false') {
        filter[fieldName] = value === 'true';
      } else {
        filter[fieldName] = value;
      }
    }
  });

  //! Build sort
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const result = await paginateMongoose(Student, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Students retrieved successfully"));
});

//! Get student by id
export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("Student Id --> ", id);

  if (!id) {
    throw new ApiError(404, "Student Id is required");
  }

  const student = await Student.findById(id);

  console.log("Student -->", student);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Student fetched successfully", student));
});

//* Update student
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("Student Id --> ", id);

  if (!id) {
    throw new ApiError(404, "Student Id is required");
  }

  const student = await Student.findById(id);
  console.log("Student -->", student);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (!req.body) {
    throw new ApiError(404, "Student data is required");
  }

  const {
    student_name,
    email,
    gender,
    class: className,
    batch,
    date_of_birth,
    specialization,
    student_id,
  } = req.body;

  console.log("Body -->", req.body);

  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    {
      student_id: student_id ? student_id : student.student_id,
      student_name,
      email,
      gender,
      class: className,
      batch,
      date_of_birth,
      specialization,
    },
    { new: true },
  );

  console.log("Updated Student -->", updatedStudent);

  res
    .status(200)
    .json(new ApiResponse(200, updatedStudent, "Student updated successfully"));
});

//! Delete student
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("Student Id --> ", id);

  if (!id) {
    throw new ApiError(404, "Student Id is required");
  }

  const student = await Student.findByIdAndDelete(id);

  console.log("Deleted Student -->", student);

  res
    .status(200)
    .json(new ApiResponse(200, student, "Student deleted successfully"));
});

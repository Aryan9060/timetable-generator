import { Course } from "../models/course.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Add courses
export const addCourses = asyncHandler(async (req, res) => {
  const courses = req.body;

  if (!Array.isArray(courses) || courses.length === 0) {
    throw new ApiError(400, "Course data is required and must be an array");
  }

  //* Validate each course field
  courses.forEach((course) => {
    if (!course.course_id) throw new ApiError(400, "Course ID is required");
    if (!course.course_name) throw new ApiError(400, "Course Name is required");
    // if (!course.credit) throw new ApiError(400, "Credit is required");
  });

  //* Filter out existing courses by course_id
  const courseIds = courses.map((course) => course.course_id);
  const existingCourses = await Course.find({ course_id: { $in: courseIds } });
  const existingCourseIds = new Set(existingCourses.map((c) => c.course_id));

  const uniqueCourseRecords = courses.filter(
    (course) => !existingCourseIds.has(course.course_id),
  );

  if (uniqueCourseRecords.length === 0) {
    throw new ApiError(408, "All provided courses already exist");
  }

  const courseRecords = await Course.insertMany(uniqueCourseRecords);

  return res
    .status(201)
    .json(
      new ApiResponse(201, courseRecords, "Courses registered successfully"),
    );
});

//! Get all courses with pagination and filtering
export const getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { course_id: { $regex: search, $options: "i" } },
      { course_name: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(Course, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Courses retrieved successfully"));
});

//! Get course by id
export const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Course ID is required");
  }

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course retrieved successfully"));
});

//! Get course by course_id
export const getCourseByCourseId = asyncHandler(async (req, res) => {
  const { course_id } = req.params;

  if (!course_id) {
    throw new ApiError(400, "Course ID (string) is required");
  }

  const course = await Course.findOne({ course_id: course_id.toUpperCase() });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course retrieved successfully"));
});

//* Update course
export const updateCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const courseData = req.body;

  if (!id) {
    throw new ApiError(400, "Course ID is required");
  }

  if (!courseData) {
    throw new ApiError(400, "Course data is required");
  }

  const course = await Course.findByIdAndUpdate(id, courseData, { new: true });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, course, "Course updated successfully"));
});

//! Delete course by id
export const deleteCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Course ID is required");
  }

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, course, "Course deleted successfully"));
});


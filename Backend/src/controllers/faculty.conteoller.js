import { Faculty } from "../models/faculty.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Register new faculty
export const registerFaculty = asyncHandler(async (req, res) => {
  // gata data froem frontend

  const faculties = req.body;
  console.log("Body -->", req.body);

  //now validate data
  if (!Array.isArray(faculties) || faculties.length === 0) {
    throw new ApiError(400, "Faculty data is required and must be an array");
  }

  //validate each field
  faculties.forEach((faculty) => {
    if (!faculty.faculty_id) {
      throw new ApiError(400, "Faculty ID is required");
    }
    if (!faculty.faculty_name) {
      throw new ApiError(400, "Faculty Name is required");
    }
    if (!faculty.specialization) {
      throw new ApiError(400, "Specialization is required");
    }
    if (!faculty.higher_qualification) {
      throw new ApiError(400, "Higher Education is required");
    }
    if (!faculty.gender) {
      throw new ApiError(400, "Gender is required");
    }
    if (!faculty.date_of_joining) {
      throw new ApiError(400, "Date of Joining is required");
    }
    if (!faculty.date_of_birth) {
      throw new ApiError(400, "Date of Birth is required");
    }
    if (!faculty.address) {
      throw new ApiError(400, "Address is required");
    }
  });

  //filter out unique records from given data
  const facultyIds = faculties.map((faculty) => faculty.faculty_id);

  const existingFaculties = await Faculty.find({
    faculty_id: { $in: facultyIds }
  });
  const existingFacultyIds = new Set(
    existingFaculties.map((f) => f.faculty_id),
  );

  const uniqueFacultyRecords = faculties.filter(
    (faculty) => !existingFacultyIds.has(faculty.faculty_id)
  );

  console.log("Unique Faculty Records -->", uniqueFacultyRecords);
  if (uniqueFacultyRecords.length === 0) {
    throw new ApiError(
      408,
      "All provided faculties already exist in the database",
    );
  }

  //save in database
  const facultyRecords = await Faculty.insertMany(uniqueFacultyRecords, {
    ordered: false,
  });
  if (facultyRecords.length === 0) {
    throw new ApiError(500, "Failed to register faculties");
  }

  console.log("Faculty -->", facultyRecords);

  res
    .status(201)
    .json(
      new ApiResponse(201, facultyRecords, "Faculty registered successfully"),
    );
});

//! Get all faculties with pagination
export const getAllFaculties = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { faculty_id: { $regex: search, $options: "i" } },
      { faculty_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(Faculty, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Faculties retrieved successfully"));
});

//! Get faculty by ID
export const getFacultyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("Faculty Id -->", id);

  if (!id) {
    throw new ApiError(404, "Faculty Id is not found in Url");
  }

  const faculty = await Faculty.findById(id);

  console.log("Faculty -->", faculty);

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, faculty, "Faculty fetched successfully"));
});

//* Update faculty
export const updateFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("Faculty Id -->", id);

  if (!id) {
    throw new ApiError(404, "Faculty Id is not found in Url");
  }

  const faculty = await Faculty.findById(id);
  console.log("Faculty -->", faculty);

  if (!faculty) {
    throw new ApiError(404, "Faculty is not found");
  }

  if (!req.body) {
    throw new ApiError(404, "Faculty data is not found in body");
  }

  const {
    faculty_name,
    specialization,
    higher_qualification,
    gender,
    date_of_joining,
    DOB,
    address,
    isActive,
  } = req.body;

  console.log("Body -->", req.body);

  const updatedFaculty = await Faculty.findByIdAndUpdate(
    id,
    {
      faculty_name,
      specialization,
      higher_qualification,
      gender,
      date_of_joining,
      DOB,
      address,
      isActive,
    },
    { new: true },
  );

  console.log("Updated Faculty -->", updatedFaculty);

  if (!updatedFaculty) {
    throw new ApiError(404, "Faculty not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedFaculty, "Faculty updated successfully"));
});

//! Delete faculty
export const deleteFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("Faculty ID -->", id);

  if (!id) {
    throw new ApiError(404, "Faculty Id is not found in Url");
  }

  const faculty = await Faculty.findByIdAndDelete(id);

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, faculty, "Faculty deleted successfully"));
});

import { SubjectAllocation } from "../models/subjectAllocation.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  paginateMongoose,
  parsePaginationParams,
} from "../utils/pagination.js";

//* Add subject allocations
export const addSubjectAllocations = asyncHandler(async (req, res) => {
  const allocations = req.body;

  console.log("Allocations:", allocations);

  if (!Array.isArray(allocations) || allocations.length === 0) {
    throw new ApiError(
      400,
      "Subject allocation data is required and must be an array",
    );
  }

  //* Validate each allocation
  allocations.forEach((alloc) => {
    if (!alloc.subjectAllocation_id)
      throw new ApiError(400, "Subject Allocation ID is required");
    if (!alloc.semester_id) throw new ApiError(400, "Semester ID is required");
    if (!alloc.program_id) throw new ApiError(400, "Program ID is required");
    if (!alloc.division_id) throw new ApiError(400, "Division ID is required");
    if (!alloc.faculty_id) throw new ApiError(400, "Faculty ID is required");
    if (!alloc.course_id) throw new ApiError(400, "Course ID is required");
    // if (!alloc.l) throw new ApiError(400, "LTP Hours (l) is required");
    // if (!alloc.t) throw new ApiError(400, "LTP Hours (t) is required");
    // if (!alloc.p) throw new ApiError(400, "LTP Hours (p) is required");
    // if (!alloc.classTeacher) throw new ApiError(400, "Class Teacher is required");
    if (!alloc.academicYear) throw new ApiError(400, "Academic Year is required");
  });

  //* Filter out existing allocations
  const allocIds = allocations.map((a) => a.subjectAllocation_id);
  const existingAllocs = await SubjectAllocation.find({ subjectAllocation_id: { $in: allocIds } });
  const existingAllocIds = new Set(existingAllocs.map((a) => a.subjectAllocation_id));

  const uniqueAllocations = allocations.filter((a) => !existingAllocIds.has(a.subjectAllocation_id));

  if (uniqueAllocations.length === 0) throw new ApiError(408, "All provided subject allocations already exist");

  const allocRecords = await SubjectAllocation.insertMany(uniqueAllocations);

  return res
    .status(201)
    .json(new ApiResponse(201, allocRecords, "Subject allocations added successfully"));
});

//! Get all subject allocations with pagination
export const getAllSubjectAllocations = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};

  //* Search filter
  if (search) {
    filter.$or = [
      { subjectAllocation_id: { $regex: search, $options: "i" } },
      { semester_id: { $regex: search, $options: "i" } },
      { program_id: { $regex: search, $options: "i" } },
      { faculty_id: { $regex: search, $options: "i" } },
      { course_id: { $regex: search, $options: "i" } },
    ];
  }

  // Field-specific filters
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
        filter[fieldName] = value === "true";
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

  const result = await paginateMongoose(
    SubjectAllocation,
    filter,
    page,
    limit,
    { sort },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Subject allocations retrieved successfully",
      ),
    );
});

//! Get subject allocation by ID
export const getSubjectAllocationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Subject Allocation ID is required");

  const allocation = await SubjectAllocation.findById(id);

  if (!allocation) {
    throw new ApiError(404, "Subject allocation not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allocation,
        "Subject allocation fetched successfully",
      ),
    );
});

//* Update subject allocation
export const updateSubjectAllocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new ApiError(400, "Subject Allocation ID is required");

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Update data is required");
  }

  const updatedAlloc = await SubjectAllocation.findByIdAndUpdate(
    id,
    updateData,
    { new: true },
  );

  if (!updatedAlloc) {
    throw new ApiError(404, "Subject allocation not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedAlloc,
        "Subject allocation updated successfully",
      ),
    );
});

//! Delete subject allocation
export const deleteSubjectAllocation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Subject Allocation ID is required");

  const deletedAlloc = await SubjectAllocation.findByIdAndDelete(id);

  if (!deletedAlloc) throw new ApiError(404, "Subject allocation not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedAlloc,
        "Subject allocation deleted successfully",
      ),
    );
});

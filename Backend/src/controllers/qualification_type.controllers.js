import { QualificationType } from "../models/qualification_type.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Add qualification types
export const addQualificationTypes = asyncHandler(async (req, res) => {
  const qualifications = req.body;

  if (!Array.isArray(qualifications) || qualifications.length === 0) {
    throw new ApiError(400, "Qualification data is required and must be an array");
  }

  //* Validate each qualification
  qualifications.forEach((qual) => {
    if (!qual.qualification_id) throw new ApiError(400, "Qualification ID is required");
    if (!qual.qualification_name) throw new ApiError(400, "Qualification Name is required");
  });

  //* Filter out existing qualifications
  const qualIds = qualifications.map((q) => q.qualification_id);
  const existingQuals = await QualificationType.find({
    qualification_id: { $in: qualIds }
  });
  const existingQualIds = new Set(existingQuals.map((q) => q.qualification_id));

  const uniqueQualifications = qualifications.filter(
    (q) => !existingQualIds.has(q.qualification_id)
  );

  if (uniqueQualifications.length === 0) {
    throw new ApiError(408, "All provided qualifications already exist");
  }

  const qualRecords = await QualificationType.insertMany(uniqueQualifications);

  return res
    .status(201)
    .json(new ApiResponse(201, qualRecords, "Qualifications added successfully"));
});

//! Get all qualification types with pagination
export const getAllQualificationTypes = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { qualification_id: { $regex: search, $options: "i" } },
      { qualification_name: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(QualificationType, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Qualifications retrieved successfully"));
});

//! Get qualification by ID
export const getQualificationTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Qualification ID is required");

  const qualification = await QualificationType.findById(id);

  if (!qualification) {
    throw new ApiError(404, "Qualification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, qualification, "Qualification fetched successfully"));
});

//* Update qualification type
export const updateQualificationType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qualification_id, qualification_name } = req.body;

  if (!id) throw new ApiError(400, "Qualification ID is required");

  if (!qualification_id && !qualification_name) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updatedQual = await QualificationType.findByIdAndUpdate(
    id,
    { qualification_id, qualification_name },
    { new: true }
  );

  if (!updatedQual) {
    throw new ApiError(404, "Qualification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedQual, "Qualification updated successfully"));
});

//! Delete qualification type
export const deleteQualificationType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Qualification ID is required");

  const deletedQual = await QualificationType.findByIdAndDelete(id);

  if (!deletedQual) throw new ApiError(404, "Qualification not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedQual, "Qualification deleted successfully"));
});

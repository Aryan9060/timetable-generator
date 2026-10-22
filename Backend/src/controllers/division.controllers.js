import { Division } from "../models/division.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

export const registerDivision = asyncHandler(async (req, res) => {
  const divisions = req.body;

  if (!Array.isArray(divisions) || divisions.length === 0) {
    throw new ApiError(400, "Division data is required and must be an array");
  }

  divisions.forEach((div) => {
    if (!div.division_id) throw new ApiError(400, "Division ID is required");
    if (!div.division_name) throw new ApiError(400, "Division Name is required");
    if (!div.description) throw new ApiError(400, "Description is required");
  });

  const divisionIds = divisions.map((div) => div.division_id);
  const existingDivisions = await Division.find({ division_id: { $in: divisionIds } });
  const existingDivisionIds = new Set(existingDivisions.map((div) => div.division_id));

  const uniqueDivisionRecords = divisions.filter(
    (div) => !existingDivisionIds.has(div.division_id),
  );

  if (uniqueDivisionRecords.length === 0) {
    throw new ApiError(408, "All provided divisions already exist");
  }

  const divisionRecords = await Division.insertMany(uniqueDivisionRecords);

  return res
    .status(201)
    .json(
      new ApiResponse(201, divisionRecords, "Divisions registered successfully"),
    );
});

//! Get all divisions with pagination and filtering
export const getAllDivisions = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { division_id: { $regex: search, $options: "i" } },
      { division_name: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(Division, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Divisions retrieved successfully"));
});

//! Get division by ID
export const getDivisionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Division ID is required");

  const divisionData = await Division.findById(id);

  if (!divisionData) {
    throw new ApiError(404, "Division not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, divisionData, "Division fetched successfully"));
});

//get division by division_id
export const getDivisionByDivisionId = asyncHandler(async (req, res) => {
  const { division_id } = req.params;

  if (!division_id) throw new ApiError(400, "Division ID is required");

  const divisionData = await Division.findOne({ division_id });

  if (!divisionData) {
    throw new ApiError(404, "Division not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, divisionData, "Division fetched successfully"));
});

//* Update division
export const updateDivision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const divisionData = req.body;

  if (!id) throw new ApiError(400, "Division ID is required");

  if (!divisionData) throw new ApiError(400, "Division data is required");

  const updatedDivision = await Division.findByIdAndUpdate(id, divisionData, {
    new: true,
  });

  if (!updatedDivision) {
    throw new ApiError(404, "Division not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedDivision, "Division updated successfully"));
});

//! Delete division
export const deleteDivision = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Division ID is required");

  const deletedDivision = await Division.findByIdAndDelete(id);

  if (!deletedDivision) throw new ApiError(404, "Division not found");

  res
    .status(200)
    .json(new ApiResponse(200, deletedDivision, "Division deleted successfully"));
});

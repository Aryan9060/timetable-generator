import { TimeTableEntry } from "../models/timeTableEntry.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Add timetable entries
export const addTimeTableEntries = asyncHandler(async (req, res) => {
  const entries = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(400, "Timetable entry data is required and must be an array");
  }

  //* Validate each entry
  entries.forEach((entry) => {
    if (!entry.entry_id) throw new ApiError(400, "Entry ID is required");
    if (!entry.faculty_id) throw new ApiError(400, "Faculty ID is required");
    if (!entry.course_id) throw new ApiError(400, "Course ID is required");
    if (!entry.class_group) throw new ApiError(400, "Class Group is required");
    if (!entry.day_of_week) throw new ApiError(400, "Day of Week is required");
    if (!entry.slot_id) throw new ApiError(400, "Slot ID is required");
    if (!entry.room_no) throw new ApiError(400, "Room Number is required");
  });

  //* Filter out existing entries
  const entryIds = entries.map((e) => e.entry_id);
  const existingEntries = await TimeTableEntry.find({
    entry_id: { $in: entryIds }
  });
  const existingEntryIds = new Set(existingEntries.map((e) => e.entry_id));

  const uniqueEntries = entries.filter(
    (e) => !existingEntryIds.has(e.entry_id)
  );

  if (uniqueEntries.length === 0) {
    throw new ApiError(408, "All provided timetable entries already exist");
  }

  const entryRecords = await TimeTableEntry.insertMany(uniqueEntries);

  return res
    .status(201)
    .json(new ApiResponse(201, entryRecords, "Timetable entries added successfully"));
});

//! Get all timetable entries with pagination
export const getAllTimeTableEntries = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { entry_id: { $regex: search, $options: "i" } },
      { faculty_id: { $regex: search, $options: "i" } },
      { course_id: { $regex: search, $options: "i" } },
      { class_group: { $regex: search, $options: "i" } },
      { room_no: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(TimeTableEntry, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Timetable entries retrieved successfully"));
});

//! Get timetable entry by ID
export const getTimeTableEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Timetable Entry ID is required");

  const entry = await TimeTableEntry.findById(id);

  if (!entry) {
    throw new ApiError(404, "Timetable entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, entry, "Timetable entry fetched successfully"));
});

//* Update timetable entry
export const updateTimeTableEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new ApiError(400, "Timetable Entry ID is required");

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Update data is required");
  }

  const updatedEntry = await TimeTableEntry.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updatedEntry) {
    throw new ApiError(404, "Timetable entry not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEntry, "Timetable entry updated successfully"));
});

//! Delete timetable entry
export const deleteTimeTableEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Timetable Entry ID is required");

  const deletedEntry = await TimeTableEntry.findByIdAndDelete(id);

  if (!deletedEntry) throw new ApiError(404, "Timetable entry not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedEntry, "Timetable entry deleted successfully"));
});

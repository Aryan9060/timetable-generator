import { TimeSlot } from "../models/timeSlot.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Add time slots
export const addTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = req.body;

  if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
    throw new ApiError(400, "Time slot data is required and must be an array");
  }

  //* Validate each time slot
  timeSlots.forEach((slot) => {
    if (!slot.slot_id) throw new ApiError(400, "Slot ID is required");
    if (!slot.day_of_week) throw new ApiError(400, "Day of Week is required");
    if (!slot.startTime) throw new ApiError(400, "Start Time is required");
    if (!slot.endTime) throw new ApiError(400, "End Time is required");
    if (!slot.slot_type) throw new ApiError(400, "Slot Type is required");
  });

  //* Filter out existing time slots
  const slotIds = timeSlots.map((s) => s.slot_id);
  const existingSlots = await TimeSlot.find({
    slot_id: { $in: slotIds }
  });
  const existingSlotIds = new Set(existingSlots.map((s) => s.slot_id));

  const uniqueTimeSlots = timeSlots.filter(
    (s) => !existingSlotIds.has(s.slot_id)
  );

  if (uniqueTimeSlots.length === 0) {
    throw new ApiError(408, "All provided time slots already exist");
  }

  const slotRecords = await TimeSlot.insertMany(uniqueTimeSlots);

  return res
    .status(201)
    .json(new ApiResponse(201, slotRecords, "Time slots added successfully"));
});

//! Get all time slots with pagination
export const getAllTimeSlots = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { slot_id: { $regex: search, $options: "i" } },
      { day_of_week: { $regex: search, $options: "i" } },
      { slot_type: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(TimeSlot, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Time slots retrieved successfully"));
});

//! Get time slot by ID
export const getTimeSlotById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Time Slot ID is required");

  const timeSlot = await TimeSlot.findById(id);

  if (!timeSlot) {
    throw new ApiError(404, "Time slot not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, timeSlot, "Time slot fetched successfully"));
});

//* Update time slot
export const updateTimeSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new ApiError(400, "Time Slot ID is required");

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Update data is required");
  }

  const updatedTimeSlot = await TimeSlot.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  if (!updatedTimeSlot) {
    throw new ApiError(404, "Time slot not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTimeSlot, "Time slot updated successfully"));
});

//! Delete time slot
export const deleteTimeSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Time Slot ID is required");

  const deletedTimeSlot = await TimeSlot.findByIdAndDelete(id);

  if (!deletedTimeSlot) throw new ApiError(404, "Time slot not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTimeSlot, "Time slot deleted successfully"));
});

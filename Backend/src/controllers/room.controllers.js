import { Room } from "../models/room.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Add rooms
export const addRoom = asyncHandler(async (req, res) => {
  //recieve data form clint in array of object
  const room = req.body;
  if (!Array.isArray(room) || room.length === 0)
    throw new ApiError(400, "Room data is required and must be an array");

  room.forEach((room) => {
    if (!room.room_no) throw new ApiError(400, "Room number is required");
    if (!room.floor_no) throw new ApiError(400, "Floor number is required");
    if (!room.block) throw new ApiError(400, "Block is required");
  });

  //find unique records
  const roomKeys = room.map((r) => `${r.room_no.toString().trim().toUpperCase()}@${r.block.toString().trim().toUpperCase()}`);
  const uniqueRoomKeys = [...new Set(roomKeys)];

  if (uniqueRoomKeys.length !== room.length) {
    throw new ApiError(400, "Duplicate room numbers in the same block found in the input");
  }

  //! Check if any room already exists in the database
  const queryConditions = room.map((r) => ({
    room_no: r.room_no.toString().trim().toUpperCase(),
    block: r.block.toString().trim().toUpperCase(),
  }));

  const existingRooms = await Room.find({
    $or: queryConditions,
  });

  const existingKeys = new Set(
    existingRooms.map((r) => `${r.room_no.toString().trim().toUpperCase()}@${r.block.toString().trim().toUpperCase()}`)
  );

  const newRooms = room.filter((r) => {
    const key = `${r.room_no.toString().trim().toUpperCase()}@${r.block.toString().trim().toUpperCase()}`;
    return !existingKeys.has(key);
  });

  if (newRooms.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "All rooms already exist"));
  }

  //* Insert rooms into the database
  const createdRooms = await Room.insertMany(newRooms);

  res
    .status(201)
    .json(new ApiResponse(201, createdRooms, `${createdRooms.length} new rooms added successfully`));
});

//! Get all rooms with pagination and filtering
export const getAllRooms = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { room_no: { $regex: search, $options: "i" } },
      { block: { $regex: search, $options: "i" } },
      { floor_no: { $regex: search, $options: "i" } },
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

  const result = await paginateMongoose(Room, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Rooms retrieved successfully"));
});

//get room by id
export const getRoomById = asyncHandler(async (req, res) => {
  const room = req.params;

  if (!room.id) {
    throw new ApiError(400, "Room id is required");
  }

  const roomById = await Room.findById(room.id);

  if (!roomById) {
    throw new ApiError(404, "Room not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, roomById, "Room fetched successfully"));
});

//update room by id
export const updateRoomById = asyncHandler(async (req, res) => {
  const room = req.body;
  const id = req.params.id;

  if (!room) {
    throw new ApiError(400, "Room data is required");
  }

  if (!id) {
    throw new ApiError(400, "Room id is required");
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    id,
    {
      $set: {
        room_no: room.room_no,
        floor_no: room.floor_no,
        block: room.block,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedRoom) {
    throw new ApiError(404, "Room not found or update failed");
  }


  res
    .status(200)
    .json(new ApiResponse(200, updatedRoom, "Room updated successfully"));
});

//delete room
export const deleteRoomById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    throw new ApiError(400, "Room id is required");
  }

  const deletedRoom = await Room.findByIdAndDelete(id);

  if (!deletedRoom) {
    throw new ApiError(404, "Room not found or delete failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedRoom, "Room deleted successfully"));
})

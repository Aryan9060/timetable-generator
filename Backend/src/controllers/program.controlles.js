import { Program } from "../models/program.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { paginateMongoose, parsePaginationParams } from "../utils/pagination.js";

//* Add programs
export const addPrograms = asyncHandler(async (req, res) => {
  // recieve data form clint in array of object
  const program = req.body;

  if (!Array.isArray(program) || program.length === 0) {
    throw new ApiError(400, "Program data is required and must be an array");
  }

  //* Validate each program field
  program.forEach((prog) => {
    if (!prog.program_id) throw new ApiError(400, "Program ID is required");
    if (!prog.program_name) throw new ApiError(400, "Program Name is required");
    if (!prog.program_duration) throw new ApiError(400, "Program Duration is required");
  });

  //* Filter out existing programs by program_id
  const programIds = program.map((prog) => prog.program_id);
  const existingPrograms = await Program.find({
    program_id: { $in: programIds },
  });

  const existingProgramIds = new Set(existingPrograms.map((p) => p.program_id));

  const uniqueProgramRecords = program.filter(
    (prog) => !existingProgramIds.has(prog.program_id),
  );

  if (uniqueProgramRecords.length === 0) {
    throw new ApiError(408, "All provided programs already exist");
  }

  const programRecords = await Program.insertMany(uniqueProgramRecords);

  if (!programRecords || programRecords.length === 0)
    throw new ApiError(500, "Failed to register programs");

  return res
    .status(201)
    .json(
      new ApiResponse(201, programRecords, "Programs registered successfully"),
    );
});

//! Get all programs with pagination and filtering
export const getAllPrograms = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(req.query);
  const { search, sortBy, sortOrder, ...fieldFilters } = req.query;

  //! Build filter
  let filter = {};
  
  //* Search filter
  if (search) {
    filter.$or = [
      { program_id: { $regex: search, $options: "i" } },
      { program_name: { $regex: search, $options: "i" } },
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
        //! Handle string filters (exact match for select fields)
        filter[fieldName] = value;
      }
    }
  });

  //! Build sort
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const result = await paginateMongoose(Program, filter, page, limit, { sort });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Programs retrieved successfully"));
});

//! Get program by id
export const getProgramById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Program ID is required");
  }

  const program = await Program.findById(id);

  if (!program) throw new ApiError(404, "Program not found");

  res
    .status(200)
    .json(new ApiResponse(200, program, "Program retrieved successfully"));
});

//! Get program by program_id
export const getProgramByProgramId = asyncHandler(async (req, res) => {
    const { program_id } = req.params;

    if (!program_id) throw new ApiError(400, "Program ID is required");

    const program = await Program.findOne({ program_id });

    if (!program) throw new ApiError(404, "Program not found");

    res.status(200).json(200, program, "Program retrieved successfully");
})

//* Update program
export const updateProgram = asyncHandler(async (req, res) => {
    const { id } = req.params;
  const programData = req.body;

  if (!id) throw new ApiError(400, "Program ID is required");

  if (!programData || Object.keys(programData).length === 0) {
    throw new ApiError(400, "Program data is required for update");
  }

  const updatedProgram = await Program.findByIdAndUpdate(id, programData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProgram) {
    throw new ApiError(404, "Program not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedProgram, "Program updated successfully"));
});

//! Delete program
export const deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Program ID is required");

  const deletedProgram = await Program.findByIdAndDelete(id);

  if (!deletedProgram) {
    throw new ApiError(404, "Program not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedProgram, "Program deleted successfully"));
    
});
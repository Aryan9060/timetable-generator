import { SubjectAllocation } from "../models/subjectAllocation.models.js";
import { Room } from "../models/room.models.js";
import { TimeSlot } from "../models/timeSlot.models.js";
import { Timetable } from "../models/timetable.models.js";
import { TimeTableEntry } from "../models/timeTableEntry.models.js";
import { Division } from "../models/division.models.js";
import { Curriculum } from "../models/curriculum.models.js";
import { generateSchedule } from "../utils/timetableGenerator.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateTimetable = asyncHandler(async (req, res) => {
  const { semester_id, academicYear, generatedBy } = req.body;

  if (!semester_id || !academicYear || !generatedBy) {
    throw new ApiError(400, "semester_id, academicYear, and generatedBy are required");
  }

  // 1. Fetch all data needed for scheduling
  const allocations = await SubjectAllocation.find({ semester_id, academicYear });
  if (allocations.length === 0) {
    throw new ApiError(400, `No subject allocations found for semester ${semester_id} and academic year ${academicYear}. Please allocate subjects first.`);
  }

  const rooms = await Room.find();
  if (rooms.length === 0) {
    throw new ApiError(400, "No rooms configured in the database. Please add classrooms/labs first.");
  }

  const divisions = await Division.find();

  const timeSlots = await TimeSlot.find();
  if (timeSlots.length === 0) {
    throw new ApiError(400, "No time slots defined in the database. Please configure weekly time slots first.");
  }

  // 2. Run the generative scheduling solver
  const curriculum = await Curriculum.findOne({ semester_id });
  const scheduleResult = generateSchedule(allocations, rooms, timeSlots, divisions, curriculum);

  if (scheduleResult?.error) {
    throw new ApiError(400, scheduleResult.error);
  }

  //* Must be checked before the deletes below - an empty result would otherwise wipe the
  //* existing entries and publish an empty timetable in their place.
  if (!Array.isArray(scheduleResult) || scheduleResult.length === 0) {
    throw new ApiError(422, "Conflict-free schedule could not be generated with the current constraints (rooms, slots, or faculty allocations). Try increasing availability or reducing allocated hours.");
  }

  const generatedEntries = scheduleResult;

  // 3. Clear existing draft or published timetables and their entries for the same semester and academic year
  const classGroups = [...new Set(allocations.map(a => a.division_id))];
  await TimeTableEntry.deleteMany({
    class_group: { $in: classGroups },
    semester_id
  });
  await Timetable.deleteMany({ semester_id, academicYear });

  // 4. Save the new TimeTableEntry documents
  const savedEntries = await TimeTableEntry.insertMany(generatedEntries);

  // 5. Save the master Timetable document
  const timetableId = `TT-${semester_id}-${academicYear}-${Date.now()}`.toUpperCase();
  const timetable = await Timetable.create({
    timetable_id: timetableId,
    semester_id,
    academicYear,
    generatedBy,
    status: "published",
    entries: savedEntries
  });

  return res
    .status(201)
    .json(new ApiResponse(201, timetable, "Timetable generated and saved successfully"));
});

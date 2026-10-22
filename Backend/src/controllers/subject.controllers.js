import { Subject } from "../models/subject.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//* Add Subject
export const addSubject = asyncHandler(async (req, res) => {
  const subject = req.body;
  console.log(subject);


  if (!Array.isArray(subject) || subject.length === 0)
    throw new ApiError(400, "Subject data is required and must be an array");

  //* Validate
  if (!subject.every((sub) => sub.subject_id && sub.subject_name && sub.credit))
    throw new ApiError(
      400,
      "Subject id, name and credit are required for all subjects",
    );

  // find unique value which is not aviblable in database
  const uniqueSubject = subject.filter((sub) => {
    return sub.subject_id !== Subject.findOne({ subject_id: sub.subject_id });
  });

  if (uniqueSubject.length === 0)
    throw new ApiError(400, "All subjects already exist in the database");

  const createdSubject = await Subject.insertMany(uniqueSubject);
  console.log(createdSubject);


  if (!createdSubject)
    throw new ApiError(400, "Failed to add subjects");

  res.status(201).json({
    success: true,
    message: "Subjects added successfully",
    data: createdSubject,
  });
});

//! Get all subjects
export const getSubjects = asyncHandler((req, res) => {
  const subjects = Subject.find();

  if (subjects.length === 0)
    throw new ApiError(400, "Failed to fetch subjects");

  res.status(200).json({
    success: true,
    message: "Subjects fetched successfully",
    data: subjects,
  });
});

//! Get subject by id
export const getSubjectById = asyncHandler((req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Subject id is required");

  const subject = Subject.findById(id);

  if (!subject) throw new ApiError(404, "Subject not found");

  res.status(200).json({
    success: true,
    message: "Subject fetched successfully",
    data: subject,
  });
});

//! Get subject by subject_id
export const getSubjectBySubjectId = asyncHandler((req, res) => {
  const { subject_id } = req.params;
  if (!subject_id) throw new ApiError(400, "Subject id is required");

  const subject = Subject.findOne({ subject_id });

  if (!subject) throw new ApiError(404, "Subject not found");

  res.status(200).json({
    success: true,
    message: "Subject fetched successfully",
    data: subject,
  });
});

//! Delete subject 
export const deleteSubject = asyncHandler((req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Subject id is required");

  const subject = Subject.findByIdAndDelete(id);

  if (!subject) throw new ApiError(404, "Subject not found");

  res.status(200).json({
    success: true,
    message: "Subject deleted successfully",
    data: subject,
  });
});

//* Update subject
export const updateSubject = asyncHandler((req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!updateData) throw new ApiError(400, "Subject data is required");

  if (!id) throw new ApiError(400, "Subject id is required");

  const updatedSubject = Subject.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedSubject) throw new ApiError(404, "Subject not found");

  res.status(200).json({
    success: true,
    message: "Subject updated successfully",
    data: updatedSubject,
  });
});


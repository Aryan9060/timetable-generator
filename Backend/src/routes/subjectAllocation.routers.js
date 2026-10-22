import { Router } from "express";
import {
  addSubjectAllocations,
  deleteSubjectAllocation,
  getAllSubjectAllocations,
  getSubjectAllocationById,
  updateSubjectAllocation,
} from "../controllers/subjectAllocation.controllers.js";

const router = Router();

router.route("/").post(addSubjectAllocations).get(getAllSubjectAllocations);

router
  .route("/:id")
  .get(getSubjectAllocationById)
  .put(updateSubjectAllocation)
  .delete(deleteSubjectAllocation);

export default router;

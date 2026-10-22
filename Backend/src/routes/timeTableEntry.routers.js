import { Router } from "express";
import {
  addTimeTableEntries,
  deleteTimeTableEntry,
  getAllTimeTableEntries,
  getTimeTableEntryById,
  updateTimeTableEntry,
} from "../controllers/timeTableEntry.controllers.js";

const router = Router();

router.route("/").post(addTimeTableEntries).get(getAllTimeTableEntries);

router
  .route("/:id")
  .get(getTimeTableEntryById)
  .put(updateTimeTableEntry)
  .delete(deleteTimeTableEntry);

export default router;

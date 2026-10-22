import { Router } from "express";
import {
  addTimeSlots,
  deleteTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
} from "../controllers/timeSlot.controllers.js";

const router = Router();

router.route("/").post(addTimeSlots).get(getAllTimeSlots);

router
  .route("/:id")
  .get(getTimeSlotById)
  .put(updateTimeSlot)
  .delete(deleteTimeSlot);

export default router;

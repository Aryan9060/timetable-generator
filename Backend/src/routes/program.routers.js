import { Router } from "express";
import {
  addPrograms,
  deleteProgram,
  getAllPrograms,
  getProgramById,
  getProgramByProgramId,
  updateProgram,
} from "../controllers/program.controlles.js";

const router = Router();

router.route("/").post(addPrograms).get(getAllPrograms);

router
  .route("/:id")
  .get(getProgramById)
  .put(updateProgram)
  .delete(deleteProgram);

router.route("/:program_id").get(getProgramByProgramId);

export default router;

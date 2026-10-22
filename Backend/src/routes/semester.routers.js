import { Router } from "express";
import {
  addSemester,
  deleteSemester,
  getAllSemesters,
  updateSemester,
} from "../controllers/semester.controllers.js";

const router = Router();

router.route("/").post(addSemester).get(getAllSemesters);

router
  .route("/:id")
  .put(updateSemester)
  .delete(deleteSemester);

export default router;

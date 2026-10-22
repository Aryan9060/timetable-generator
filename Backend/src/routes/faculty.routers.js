import { Router } from "express";
import {
  deleteFaculty,
  getAllFaculties,
  getFacultyById,
  registerFaculty,
  updateFaculty,
} from "../controllers/faculty.conteoller.js";

const router = Router();

router.route("/").post(registerFaculty).get(getAllFaculties);
router
  .route("/:id")
  .get(getFacultyById)
  .delete(deleteFaculty)
  .put(updateFaculty);

export default router;

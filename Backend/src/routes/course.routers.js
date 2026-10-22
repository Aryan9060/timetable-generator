import { Router } from "express";
import {
  addCourses,
  deleteCourseById,
  getAllCourses,
  getCourseByCourseId,
  getCourseById,
  updateCourseById,
} from "../controllers/course.controlles.js";

const router = Router();

router.route("/").post(addCourses).get(getAllCourses);

router
  .route("/:id")
  .get(getCourseById)
  .put(updateCourseById)
  .delete(deleteCourseById);

router.route("/:course_id").get(getCourseByCourseId);

export default router;

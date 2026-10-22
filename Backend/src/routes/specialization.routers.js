import { Router } from "express";
import {
  addSpecialization,
  deleteSpecialization,
  getAllSpecialization,
  getSpecializationById,
  updateSpecialization,
} from "../controllers/specialization.controllers.js";

const router = Router();

router.route("/").post(addSpecialization).get(getAllSpecialization);

router
  .route("/:id")
  .get(getSpecializationById)
  .put(updateSpecialization)
  .delete(deleteSpecialization);

export default router;

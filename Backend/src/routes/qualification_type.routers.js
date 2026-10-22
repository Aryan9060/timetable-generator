import { Router } from "express";
import {
  addQualificationTypes,
  deleteQualificationType,
  getAllQualificationTypes,
  getQualificationTypeById,
  updateQualificationType,
} from "../controllers/qualification_type.controllers.js";

const router = Router();

router.route("/").post(addQualificationTypes).get(getAllQualificationTypes);

router
  .route("/:id")
  .get(getQualificationTypeById)
  .put(updateQualificationType)
  .delete(deleteQualificationType);

export default router;

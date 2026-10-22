import { Router } from "express";
import {
  registerDivision,
  deleteDivision,
  getAllDivisions,
  getDivisionByDivisionId,
  getDivisionById,
  updateDivision,
} from "../controllers/division.controllers.js";

const router = Router();

router.route("/").post(registerDivision).get(getAllDivisions);

router
  .route("/:id")
  .get(getDivisionById)
  .put(updateDivision)
  .delete(deleteDivision);

router.route("/:division_id").get(getDivisionByDivisionId);

export default router;

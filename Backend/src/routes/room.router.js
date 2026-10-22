import { Router } from "express";
import {
  addRoom,
  deleteRoomById,
  getAllRooms,
  getRoomById,
  updateRoomById,
} from "../controllers/room.controllers.js";

const router = Router();

router.route("/").post(addRoom).get(getAllRooms);

router
  .route("/:id")
  .get(getRoomById)
  .put(updateRoomById)
  .delete(deleteRoomById);

export default router;

//

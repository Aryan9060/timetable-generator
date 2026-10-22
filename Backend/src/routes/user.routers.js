import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  registerUser,
  updateUser,
  userLogin,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

//! Public routes
router.route("/login").post(userLogin);
router.route("/refresh-token").post(refreshAccessToken);

//! Protected routes
router
  .route("/")
  .post(verifyJWT, authorizeRoles("admin"), registerUser)
  .get(
    verifyJWT,
    authorizeRoles("admin", "faculty", "coordinator", "hod"),
    getAllUsers,
  );
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changePassword);
router
  .route("/:id")
  .get(verifyJWT, getUserById)
  .delete(verifyJWT, authorizeRoles("admin"), deleteUser)
  .patch(verifyJWT, authorizeRoles("admin"), updateUser);

export default router;

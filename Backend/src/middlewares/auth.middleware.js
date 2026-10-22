import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/Token.js";
import { User } from "../models/user.models.js";

//! Verify JWT token and attach user to request
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    
    //* Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    //* Verify token
    const decodedToken = verifyAccessToken(token);

    if (!decodedToken) {
      throw new ApiError(401, "Invalid or expired access token");
    }

    //* Find user and attach to request
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated. Please contact admin.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

//! Check if user has required role(s)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Please login to access this resource");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role (${req.user.role}) is not allowed to access this resource`
      );
    }

    next();
  };
};

//! Check if user is admin
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Please login to access this resource");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can access this resource");
  }

  next();
});

//! Check if user is faculty or admin
export const isFacultyOrAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Please login to access this resource");
  }

  const allowedRoles = ["admin", "faculty", "coordinator", "hod"];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(
      403,
      "Only faculty, admin, coordinator, or HOD can access this resource"
    );
  }

  next();
});

//! Optional auth - attaches user if token exists, but doesn't require it
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decodedToken = verifyAccessToken(token);

      if (decodedToken) {
        const user = await User.findById(decodedToken._id).select(
          "-password -refreshToken"
        );

        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    //? Continue without user if token is invalid
    next();
  }
});

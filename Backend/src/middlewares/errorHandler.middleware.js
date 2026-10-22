import { ApiError } from "../utils/ApiError.js";

/**
 *! Global Error Handler Middleware
 *! Catches all errors and formats them into consistent API responses
 */
const errorHandler = (err, req, res, next) => {
  let error = err;
  console.log("error -->",error);
  

  //* If error is not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal Server Error";
    
    //* Handle specific error types
    if (error.name === "ValidationError") {
      //* Mongoose validation error
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.validation("Validation Error", errors);
    } else if (error.name === "CastError") {
      //* Mongoose cast error (invalid ObjectId)
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      //* MongoDB duplicate key error
      const field = error.keyValue ? Object.keys(error.keyValue)[0] : "field";
      error = ApiError.conflict(
        `${field} already exists. Please use a different value.`
      );
    } else if (error.name === "JsonWebTokenError") {
      //* JWT invalid token
      error = ApiError.unauthorized("Invalid token. Please login again.");
    } else if (error.name === "TokenExpiredError") {
      //* JWT expired token
      error = ApiError.unauthorized("Token expired. Please login again.");
    } else {
      error = new ApiError(statusCode, message);
    }
  }

  //* Prepare error response
  const errorResponse = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    timestamp: error.timestamp || new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  //* Include errors array if present
  if (error.errors && error.errors.length > 0) {
    errorResponse.errors = error.errors;
  }

  //* Include stack trace in development mode
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = error.stack;
    //* Log error for debugging
    console.error("Error:", {
      message: error.message,
      statusCode: error.statusCode,
      path: req.originalUrl,
      method: req.method,
      stack: error.stack,
    });
  }

  return res.status(error.statusCode).json(errorResponse);
};

/**
 *! 404 Not Found Handler
 *! Handles requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(
    `Route ${req.originalUrl} with method ${req.method} not found`
  );
  next(error);
};

export { errorHandler, notFoundHandler };

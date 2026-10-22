/**
 *! Custom API Error Class
 *! Provides structured error responses with status codes and error details
 */
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    data = null,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  //* Static factory methods for common HTTP errors
  static badRequest(message = "Bad Request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized", errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden", errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = "Not Found", errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Conflict", errors = []) {
    return new ApiError(409, message, errors);
  }

  static validation(message = "Validation Error", errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = "Too Many Requests", errors = []) {
    return new ApiError(429, message, errors);
  }

  static internal(message = "Internal Server Error", errors = []) {
    return new ApiError(500, message, errors);
  }

  static serviceUnavailable(message = "Service Unavailable", errors = []) {
    return new ApiError(503, message, errors);
  }

  //*
  //* Convert error to JSON format for API responses
  //*
  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    };
  }
}

export { ApiError };
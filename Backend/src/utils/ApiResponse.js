/**
 *! Custom API Response Class
 *! Provides structured success responses with consistent formatting
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success", meta = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
    this.meta = meta;
  }

  //* 2xx Success Responses
  static ok(data, message = "Success", meta = null) {
    return new ApiResponse(200, data, message, meta);
  }

  static created(data, message = "Resource created successfully", meta = null) {
    return new ApiResponse(201, data, message, meta);
  }

  static accepted(data, message = "Request accepted", meta = null) {
    return new ApiResponse(202, data, message, meta);
  }

  static noContent(message = "No content") {
    return new ApiResponse(204, null, message);
  }

  //* Paginated response helper
  static paginated(data, pagination, message = "Success") {
    const meta = {
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: pagination.totalPages || 1,
        totalCount: pagination.totalCount || 0,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false,
      },
    };
    return new ApiResponse(200, data, message, meta);
  }

  //*
  //* Convert response to JSON format
  //*
  toJSON() {
    const response = {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    };

    if (this.meta) {
      response.meta = this.meta;
    }

    return response;
  }

  //*
  //* Send response via Express res object
  //*
  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }
}

export { ApiResponse };
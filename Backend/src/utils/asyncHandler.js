import mongoose from "mongoose";

/**
 *! Async Handler Wrapper
 *! Wraps async route handlers to catch errors and pass them to Express error middleware
 *! Eliminates need for try-catch blocks in controllers
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      //* Enhance error with request context for better debugging
      if (error && typeof error === "object") {
        error.path = req.originalUrl;
        error.method = req.method;
      }
      next(error);
    });
  };
};

/**
 *! Async Handler with Transaction Support
 *! For operations that need MongoDB transactions
 */
export const asyncHandlerWithTransaction =
  (requestHandler) => async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      //* Attach session to request for use in controllers
      req.session = session;
      await requestHandler(req, res, next);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error && typeof error === "object") {
        error.path = req.originalUrl;
        error.method = req.method;
      }
      next(error);
    } finally {
      session.endSession();
    }
  };

export { asyncHandler };
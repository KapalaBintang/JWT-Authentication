// Import necessary types from Express for request, response, and next function handling
import { Request, Response, NextFunction } from "express";

// Define a higher-order function (asyncHandler) that wraps an asynchronous function to handle errors automatically
const asyncHandler = (fn: Function) => {
  // Return a function that accepts the request, response, and next parameters
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the provided function and ensure that any errors are caught and passed to the next middleware (error handler)
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Export the asyncHandler function for use in other parts of the application
export default asyncHandler;

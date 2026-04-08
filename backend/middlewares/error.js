
import HandleError from "../utils/handleError.js";

const errorMiddleware = (err, req, res, next) => {

  // Debug log
  console.log("ERROR OCCURRED:", err);

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    const message = `Invalid resource: ${err.path}`;
    err = new HandleError(message, 400);
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const message = `This ${Object.keys(err.keyValue)} is already registered. Please login.`;
    err = new HandleError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    err = new HandleError(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message
  });

};

export default errorMiddleware;

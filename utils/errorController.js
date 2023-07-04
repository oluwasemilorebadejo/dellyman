const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  // still handling the invalid id err
  const message = `Invalid ${err.path}: ${err.value}. Please provide a valid value.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let field = Object.keys(err.keyValue)[0];
  if (field === "email")
    return new AppError("User already exists. Please log in.", 409);

  const message = `Duplicate value for ${field}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTErr = (err) =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredErr = (err) =>
  new AppError("Token expired. Please log in again.", 401);

const sendErrorDev = (err, req, res) =>
  // API and SSRendered
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorProd = (err, req, res) => {
  // (A) API
  if (req.originalUrl.startsWith("/api")) {
    // expected errors, send err to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // programming errors, dont send details to client
    console.error("ERROR", err);

    return res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
  // (B) SSRendered
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  // programming errors, dont send details to client
  console.error("ERROR", err);

  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "pls try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTErr(err);
    if (err.name === "TokenExpiredError") err = handleJWTExpiredErr(err);
    sendErrorProd(err, req, res);
  }
};

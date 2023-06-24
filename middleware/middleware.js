const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../company/models/companyModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");



exports.restrictTo =
  (...roles) =>
  // returns array ['admin']
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "access denied. you are not allowed to perform this operation",
          403
        )
      );
    }

    next();
  };

exports.setCompanyId = async (req, res, next) => {
  // nested routes
  if (!req.body.company) req.body.company = req.user.id; // sets req.body.company to company id

  next();
};

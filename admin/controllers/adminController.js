const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/adminModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const sendEmail = require("../../utils/email");
const axios = require("axios");

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Set the Authorization header with the token
  res.set("Authorization", `Bearer ${token}`);

  user.password = undefined;

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if username or password was entered
  if (!email || !password) {
    return next(new AppError("pls enter email or password", 400));
  }

  // check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password"); // { email: email }

  // FIX LATERR
  // if (user && user.verifiedOTP === false) {
  //   return next(
  //     new AppError("kindly verify your account before logging in", 400)
  //   );
  //   // THEN REDIRECT THEM TO GET OTP
  // }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }

  // if everything is okay send token to client and login
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get the token from the Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("you arent logged in. kindly log in to get access", 401)
    );
  }
  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "the user with this token no longer exists or action not allowed",
        401
      )
    );
  }
  // check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("user changed password. pls log in again", 401));
  }
  // grant access to protected route
  req.user = currentUser; // req.user stores the user data and is only available on protected routes, ie routes that have the protect middleware

  next();
});

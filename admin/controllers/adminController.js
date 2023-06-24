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

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cant manipulate cookie in any way ie cant delete the cookie
    secure: req.secure,
  };

  res.cookie("jwt", token, cookieOptions);

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
  // get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

exports.verifyCac = catchAsync(async (req, res, next) => {
  let company = await User.findById(req.params.id);

  if (company.role !== "company") {
    return next(
      new AppError("this is not user with the provided id isnt a company", 400)
    );
  }

  if (company.verifiedBvn === true) {
    company = await User.findByIdAndUpdate(
      req.params.id,
      {
        verifiedCac: true,
        isVerified: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    company = await User.findByIdAndUpdate(
      req.params.id,
      {
        verifiedCac: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  // if (company.isVerified === true) {
  //   const accountReference = uuidv4().replace(/-/g, "").slice(0, 20);

  //   try {
  //     const response = await axios.post(
  //       "https://api.flutterwave.com/v3/payout-subaccounts",
  //       {
  //         account_name: company.name,
  //         email: company.email,
  //         mobilenumber: company.phone,
  //         country: company.country,
  //         account_reference: accountReference,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
  //         },
  //       }
  //     );

  //     // console.log(response.data.data);

  //     company.walletId = accountReference;
  //     company.wallet = response.data.data.nuban;
  //     company.bank = response.data.data.bank_name;
  //     await company.save({ validateBeforeSave: false });
  //   } catch (err) {
  //     console.error(err);
  //     return next(new AppError("Error Creating account. pls try again", 500));
  //   }
  // }

  res.status(200).json({
    status: "success",
    data: {
      user: company,
    },
  });
});

const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const axios = require("axios");
const { json } = require("express");

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
  // const accountReference = uuidv4().replace(/-/g, "").slice(0, 20);

  // console.log(accountReference);
  // try {
  //   const response = await axios.post(
  //     "https://api.flutterwave.com/v3/payout-subaccounts",
  //     {
  //       account_name: req.body.fullName,
  //       email: req.body.email,
  //       mobilenumber: req.body.phone,
  //       country: req.body.country,
  //       account_reference: accountReference,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
  //       },
  //     }
  //   );
  // } catch (err) {
  //   return next(new AppError("User already exists", 409)); //check this implementation
  // }

  // console.log(response.data);

  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    country: req.body.country,
    // walletId: accountReference,
  });

  // i can still bring out some other details from the response.data so the user can be created alongside those properties such as wallet account number and bank etc

  // send OTP
  const data = JSON.stringify({
    length: 7,
    customer: {
      name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
    },
    sender: "blac",
    send: true,
    medium: ["whatsapp", "email"],
    expiry: 5,
  });

  const config = {
    method: "POST",
    url: "https://api.flutterwave.com/v3/otps",
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios(config);

    const otpData = response.data.data;
    const smsOtpData = otpData.find((item) => item.medium === "email");

    const otpReference = smsOtpData.reference;
    const otp = smsOtpData.otp;

    newUser.otp = otp;
    newUser.otpReference = otpReference;

    await newUser.save({ validateBeforeSave: false });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error generating OTP. Please try again", 500));
  }

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if username or password was entered
  if (!email || !password) {
    return next(new AppError("pls enter email or password", 400));
  }

  // check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password"); // { email: email }

  if (user && user.verifiedOTP === false) {
    return next(
      new AppError("kindly verify your account before logging in", 400)
    );
    // THEN REDIRECT THEM TO GET OTP
  }

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
    return next(new AppError("the user with this token no longer exists", 401));
  }
  // check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("user changed password. pls log in again", 401));
  }
  // grant access to protected route
  req.user = currentUser; // req.user stores the user data and is only available on protected routes, ie routes that have the protect middleware

  next();
});

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.verify = catchAsync(async (req, res, next) => {
  const { bvn, cac } = req.body;
  const { role } = req.user;

  // Check if the user role is 'rider' or 'company'
  // if (role === "rider" && !bvn) {
  //   return next(new AppError("Please provide a BVN for verification", 400));
  // } else if (role === "company" && (!bvn || !cac)) {
  //   return next(
  //     new AppError("Please provide both BVN and CAC for verification", 400)
  //   );
  // }

  // Verify the user's account based on their role and provided details
  // Implement your verification logic here

  // Update the user's 'isVerified' field to true
  req.user.isVerified = true;
  await req.user.save();

  res.status(200).json({
    status: "success",
    message: "Account verification successful!",
  });
});

exports.verifyCac = catchAsync(async (req, res, next) => {
  const company = await User.findById(req.params.id);

  if (company.role !== "company") {
    return next(
      new AppError("this is not user with the provided id isnt a company", 400)
    );
  }

  const updatedCompany = await User.findByIdAndUpdate(
    req.params.id,
    {
      isVerified: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updatedCompany,
    },
  });
});

exports.generateOTP = catchAsync(async (req, res, next) => {
  // send OTP
  const data = JSON.stringify({
    length: 7,
    customer: {
      name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
    },
    sender: "blac",
    send: true,
    medium: ["sms", "email"],
    expiry: 5,
  });

  const config = {
    method: "POST",
    url: "https://api.flutterwave.com/v3/otps",
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios(config);
    console.log(response.data);

    const otpData = response.data.data;
    const smsOtpData = otpData.find((item) => item.medium === "email");

    // if (!smsOtpData) {
    //   return next(new AppError("Error generating OTP. Please try again", 500));
    // }

    const otpReference = smsOtpData.reference;
    const otp = smsOtpData.otp;

    newUser.otp = otp;
    newUser.otpReference = otpReference;

    await newUser.save({ validateBeforeSave: false });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error generating OTP. Please try again", 500));
  }

  next();
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const currentUser = await User.findOne({ otp });

  if (!currentUser) {
    return next(new AppError("invalid otp", 400));
  }

  if (currentUser.verifiedOTP) {
    return next(new AppError("account already verified, kindly login", 400));
  }

  const otpReference = currentUser.otpReference;

  try {
    const data = JSON.stringify({
      otp,
    });

    const config = {
      method: "post",
      url: `https://api.flutterwave.com/v3/otps/${otpReference}/validate`,
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    if (response.data.status === "success") {
      currentUser.verifiedOTP = true;
      currentUser.otp = undefined;

      await currentUser.save({ validateBeforeSave: false });
    } else {
      return next(new AppError("invalid otp", 400));
    }

    res.status(201).json({
      status: "success",
      data: {
        message: "your account has been verified. you can now login",
      },
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("something went wrong. pls try again"));
  }
});

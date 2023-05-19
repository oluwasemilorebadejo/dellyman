const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
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
  const accountReference = uuidv4().replace(/-/g, "").slice(0, 20);

  // console.log(accountReference);
  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payout-subaccounts",
      {
        account_name: req.body.fullName,
        email: req.body.email,
        mobilenumber: req.body.phone,
        country: req.body.country,
        account_reference: accountReference,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );
  } catch (err) {
    return next(new AppError("User already exists", 400)); //check this implementation
  }

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
    walletId: accountReference,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;

  // await new Email(newUser, url).sendWelcome();

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
  if (role === "rider" && !bvn) {
    return next(new AppError("Please provide a BVN for verification", 400));
  } else if (role === "company" && (!bvn || !cac)) {
    return next(
      new AppError("Please provide both BVN and CAC for verification", 400)
    );
  }

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

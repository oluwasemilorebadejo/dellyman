const User = require("../models/companyModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // eslint-disable-next-line no-unused-expressions
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // sets id so it can be used by /me route to set id to current user id
  req.params.id = req.user.id;

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // check if user posts password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "this route is not for password updates., pls use /updatemypassword",
        400
      )
    );
  }

  // filtered fields that arent allowed to be updated
  const filteredBody = filterObj(req.body, "phone");

  // if not, update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidtors: true,
  }); // findbidndupdate can now be used because we arent working with paswords
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("invalid id", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
}); // done by the admin and the account is permanently delete

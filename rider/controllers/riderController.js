const Rider = require("../models/riderModel");
const Company = require("../../company/models/companyModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.addRider = catchAsync(async (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new AppError(
        "Cant add riders till account is verified. Kindly verify your account",
        400
      )
    );
  }
  const { firstName, lastName, phone, nationality, startDate } = req.body;

  const companyId = req.user.id;

  // Generate a unique 7-digit riderId
  const generateRandomId = () => {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  };

  let riderId = generateRandomId();

  // Check if the generated riderId already exists in the collection
  while (await Rider.exists({ riderId })) {
    riderId = generateRandomId();
  }

  // Create the rider
  const rider = await Rider.create({
    firstName,
    lastName,
    riderId,
    phone,
    nationality,
    startDate,
    company: companyId,
  });

  // Increment the company's points field
  await Company.findByIdAndUpdate(companyId, { $inc: { points: 1 } });

  res.status(201).json({
    status: "success",
    data: {
      rider,
    },
  });
});

exports.removeRider = catchAsync(async (req, res, next) => {
  // Find the rider by id
  const rider = await Rider.findById(req.params.id);

  // If the rider doesn't exist, return an error
  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  // Check if the rider belongs to the company
  if (rider.company.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to remove this rider", 403)
    );
  }

  // Set the end date for the rider
  rider.endDate = req.body.endDate; // Set the current date as the end date

  // Save the changes to the rider document
  await rider.save();

  res.status(200).json({
    status: "success",
    data: {
      message: "Rider removed successfully",
    },
  });
});

exports.getMyRiders = catchAsync(async (req, res, next) => {
  const companyId = req.user.id;

  // Find the riders for the company with no end date
  const riders = await Rider.find({
    company: companyId,
    endDate: { $exists: false },
  });

  res.status(200).json({
    status: "success",
    data: {
      riders,
    },
  });
});

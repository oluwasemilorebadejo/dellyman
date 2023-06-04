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
  const { firstName, lastName, phone, nationality } = req.body;

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

exports.getMyRiders = catchAsync(async (req, res, next) => {
  const companyId = req.user.id; // Assuming the authenticated user has a "company" property that holds the reference to the company

  const riders = await Rider.find({ company: companyId });

  res.status(200).json({
    status: "success",
    data: {
      riders,
    },
  });
});

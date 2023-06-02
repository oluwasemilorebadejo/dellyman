const Job = require("../models/jobModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.createJob = catchAsync(async (req, res, next) => {
  const { description, requirements, location, salary } = req.body;

  if (!req.user.isVerified) {
    return next(
      new AppError(
        "You cant post a job till account is verified. Kindly verify your account",
        400
      )
    );
  }

  const newJob = await Job.create({
    company: req.body.company,
    description,
    requirements,
    location,
    salary,
  });

  res.status(201).json({
    status: "success",
    data: {
      job: newJob,
    },
  });
});

// exports.getMyJobs = catchAsync(async (req, res, next) => {});

exports.getMyJobs = catchAsync(async (req, res, next) => {
  const companyId = req.user.id; // Assuming the authenticated user has a "company" property that holds the reference to the company

  const jobs = await Job.find({ company: companyId });

  res.status(200).json({
    status: "success",
    data: {
      jobs,
    },
  });
});

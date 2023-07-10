const Job = require("../models/jobModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures");

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
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    data: {
      job: newJob,
    },
  });
});

exports.getMyJobs = catchAsync(async (req, res, next) => {
  const companyId = req.user.id; // Assuming the authenticated user has a "company" property that holds the reference to the company

  const features = new APIFeatures(Job.find({ company: companyId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const jobs = await features.query;

  res.status(200).json({
    status: "success",
    totalJobs: jobs.length,
    data: {
      jobs,
    },
  });
});

exports.getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.find();

  res.status(200).json({
    status: "success",
    number: jobs.length,
    data: {
      jobs,
    },
  });
});

exports.updateJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { description, requirements, location, salary } = req.body;

  const job = await Job.findById(id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.company.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to update this job", 403));
  }

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    { description, requirements, location, salary },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      job: updatedJob,
    },
  });
});

exports.deleteJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const job = await Job.findById(id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.company.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to delete this job", 403));
  }

  await Job.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const job = await Job.findById(id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});

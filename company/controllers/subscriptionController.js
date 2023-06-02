const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const axios = require("axios");

exports.getAllPlans = catchAsync(async (req, res, next) => {
  const options = {
    method: "GET",
    url: "https://api.flutterwave.com/v3/payment-plans",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    },
  };

  axios(options)
    .then((response) => {
      res.status(200).json({
        plans: response.data,
      });
    })
    .catch((error) => {
      return next(new AppError("Error fetching plans. Pls try again"));
    });
});

exports.createPlan = catchAsync(async (req, res, next) => {
  const options = {
    method: "POST",
    url: "https://api.flutterwave.com/v3/payment-plans",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    },
    data: JSON.stringify({
      amount: req.body.amount,
      name: req.body.name,
      interval: req.body.interval, //billing interval
      duration: 1,
    }),
  };

  axios(options)
    .then((response) => {
      res.status(201).json({
        plan: response.data,
      });
    })
    .catch((error) => {
      console.error(error);
      return next(new AppError("Error creating plan. Pls try again"));
    });
});

exports.getPlan = catchAsync(async (req, res, next) => {});

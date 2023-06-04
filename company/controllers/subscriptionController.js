const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const axios = require("axios");
const generateTransactionId = require("../../utils/generateTransactionId");

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

exports.deletePlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const options = {
    method: "PUT",
    url: `https://api.flutterwave.com/v3/payment-plans/${id}/cancel`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    },
  };

  axios(options)
    .then((response) => {
      res.status(200).json({
        plan: response.data,
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

exports.getPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const options = {
    method: "GET",
    url: `https://api.flutterwave.com/v3/payment-plans/${id}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    },
  };

  axios(options)
    .then((response) => {
      res.status(200).json({
        plan: response.data,
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

exports.basicPlan = catchAsync(async (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new AppError(
        "You cant subscribe till your account is verified. Kindly verify your account",
        400
      )
    );
  }

  try {
    const transactionId = generateTransactionId();

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: transactionId,
        redirect_url: `${req.protocol}://${req.get("host")}/me`,
        meta: {
          consumer_id: req.user.id,
        },
        customer: {
          email: req.user.email,
          phonenumber: req.user.phone,
          name: req.user.name,
        },
        // customizations: {
        //   title: "Pied Piper Payments",
        //   logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
        // },
        payment_plan: 36761, // CHANGE THE PAYMENT PLAN IN PRODUCTION
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    res.status(303).json({
      status: "success",
      data: response.data,
    });
  } catch (err) {
    console.error(err.response.status);
    console.error(err.response.data);

    return next(
      new AppError(
        "Error making payments. pls wait a few minutes then try again",
        500
      )
    );
  }
});

exports.premiumPlan = catchAsync(async (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new AppError(
        "You cant subscribe till your account is verified. Kindly verify your account",
        400
      )
    );
  }

  try {
    const transactionId = generateTransactionId();

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: transactionId,
        redirect_url: `${req.protocol}://${req.get("host")}/me`,
        meta: {
          consumer_id: req.user.id,
        },
        customer: {
          email: req.user.email,
          phonenumber: req.user.phone,
          name: req.user.name,
        },
        // customizations: {
        //   title: "Pied Piper Payments",
        //   logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
        // },
        payment_plan: 36761, // CHANGE THE PAYMENT PLAN IN PRODUCTION
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    res.status(303).json({
      status: "success",
      data: response.data,
    });
  } catch (err) {
    console.error(err.response.status);
    console.error(err.response.data);

    return next(
      new AppError(
        "Error making payments. pls wait a few minutes then try again",
        500
      )
    );
  }
});

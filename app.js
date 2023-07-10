const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const compression = require("compression");
const Admin = require("./admin/models/adminModel");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/errorController");

const companyRouter = require("./company/routes/companyRoutes");
const jobRouter = require("./company/routes/jobRoutes");
const adminRouter = require("./admin/routes/adminRoutes");

const app = express();

app.enable("trust proxy");

// middleware

app.use(cors());

// set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// log env variable
app.use(morgan("dev"));

console.log(`ENVIROMENT: ${process.env.NODE_ENV}`);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(compression());

// routes

app.use("/api/v1/users/company", companyRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/admin", adminRouter);

app.use("/test", (req, res) => {
  res.status(200).json({ message: "Hello, world!" });
});

// Keep Alive route
app.get("/_vercel_keep_alive", (req, res) => {
  res.status(200).send("Vercel Serverless Function is alive!");
});

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Cannot find ${req.originalUrl}. This endpoint does not exist.`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;

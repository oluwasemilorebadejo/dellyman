const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/errorController");

const companyRouter = require("./company/routes/companyRoutes");
const jobRouter = require("./company/routes/jobRoutes");
const adminRouter = require("./admin/adminRoutes");

const app = express();

// middleware

// set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// log env variable
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
console.log(`ENVIROMENT: ${process.env.NODE_ENV}`);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

// routes

app.use("/api/v1/users/company", companyRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/admin", adminRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

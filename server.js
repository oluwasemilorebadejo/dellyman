const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION, SHUTTING DOWN...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" }); // has to be set before requiring app because the env vars have to be set so the app module has access to it also

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection sucessfull"));

const app = require("./app");

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// Keep Alive route
app.get("/_vercel_keep_alive", (req, res) => {
  res.status(200).send("Vercel Serverless Function is alive!");
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION, SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

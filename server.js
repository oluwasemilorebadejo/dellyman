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
    minPoolSize: 15,
  })
  .then(() => console.log("DB connection sucessfull"));

const app = require("./app");

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// Send keep-alive requests every 5 minutes
const keepAliveInterval = setInterval(() => {
  mongoose.connection.db.admin().ping((error) => {
    if (error) {
      console.error("Failed to send keep-alive request:", error);
    } else {
      console.log("Keep-alive request sent to MongoDB");
    }
  });
}, 5 * 60 * 1000);

// Close the keep-alive interval and the MongoDB connection when the application is terminated or finished
process.on("SIGINT", () => {
  clearInterval(keepAliveInterval);
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION, SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

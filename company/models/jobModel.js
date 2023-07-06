const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  title: {
    type: String,
    required: [true, "kindly enter job title"],
  },
  level: {
    type: String,
    enum: {
      values: ["entry", "mid", "senior"],
      message: "Job level not allowed.",
    },
  },
  type: {
    type: String,
    required: [true, "kindly enter job type"],
    enum: {
      values: ["full time", "contract", "part time", "internship"],
      message: "Job type not allowed.",
    },
  },
  minimumQualification: {
    type: String,
    enum: {
      values: [
        "none",
        "primary education",
        "secondary education",
        "bachelors",
        "masters",
        "PhD",
      ],
      message:
        "Qualification not allowed. Must be none or primary education or secondary education or bachelors or masters or PhD",
    },
  },
  description: {
    type: String,
    required: [true, "pls enter the job description"],
  },
  requirements: {
    type: [String],
    required: [true, "pls enter the job requirements"],
  },
  location: {
    type: String,
    required: [true, "pls enter the location"],
  },
  experience: {
    type: String,
    required: [true, "pls enter the job experience"],
    enum: ["none", "1-3", "5+"],
  },
  salary: {
    type: Number,
    required: [true, "pls enter the exact salary or salary range"],
  },
  deadline: {
    type: Date,
    required: [
      true,
      "pls enter the deadline. must be a date in the form YYYY-MM-DD",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;

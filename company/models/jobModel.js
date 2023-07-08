const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
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
        message:
          "{VALUE} is not supported. Job level must be entry, mid, or senior",
      },
    },
    type: {
      type: String,
      required: [true, "kindly enter job type"],
      enum: {
        values: ["full time", "contract", "part time", "internship"],
        message:
          "{VALUE} is not supported. Job type must be full time, contract, part time, or internship",
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
          "{VALUE} is not supported. Qualification must be none, primary education, secondary education, bachelors, masters, or PhD",
      },
    },
    description: {
      type: String,
      required: [true, "pls enter the job description"],
    },
    requirements: {
      type: String,
      required: [true, "pls enter the job requirements"],
    },
    location: {
      type: String,
      required: [true, "pls enter the location"],
    },
    experience: {
      type: String,
      required: [true, "pls enter the job experience"],
      enum: {
        values: ["none", "1-3", "5+"],
        message:
          "{VALUE} is not supported. Experience must be none, 1-3, or 5+",
      },
    },
    salary: {
      type: Number,
      required: [true, "pls enter the exact salary or salary range"],
    },
    deadline: {
      type: Date,
      required: [
        true,
        "pls enter the deadline. must be a date in the format YYYY-MM-DD",
      ],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        default: "active",
        message: "Status not allowed. Status must be active or inactive",
      },
    },
  },
  {
    timestamps: true, // Add the timestamps option
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;

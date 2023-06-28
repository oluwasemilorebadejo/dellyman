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
  },
  minimumQualification: {
    type: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;

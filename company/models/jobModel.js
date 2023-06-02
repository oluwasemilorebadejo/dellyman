const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  role: {
    type: String,
    // required: true,
    enum: ["rider"],
    message: "Role not allowed. Role must be rider",
  },
  level: {
    type: String,
  },
  minimunQualification: {
    type: String,
  },
  description: {
    type: String,
    // required: true,
  },
  summary: {
    type: String,
  },
  requirements: {
    type: [String],
    // required: true,
  },
  ageRange: {
    type: String,
  },
  location: {
    type: String,
    // required: true,
  },
  experience: {
    type: String,
  },
  salary: {
    type: Number,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;

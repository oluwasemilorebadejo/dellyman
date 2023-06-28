const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a last name"],
  },
  riderId: {
    type: String,
    unique: [true, "Please try again"],
    required: [true, "Rider ID needed"],
    validate: {
      validator: function (value) {
        return /^\d{7}$/.test(value);
      },
      message: "riderId must be a 7-digit number",
    },
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  role: {
    type: String,
    enum: ["rider"], // Modify this enum based on the available roles in your system
    default: "rider",
    message: "Role must be rider",
  },
  nationality: {
    type: String,
    required: [true, "Please provide a country"],
  },
  startDate: {
    type: Date,
    required: [true, "kindly enter a date"],
  },
  endDate: {
    type: Date,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

const Rider = mongoose.model("Rider", riderSchema);

module.exports = Rider;

const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "pls input your name"],
  },
  email: {
    type: String,
    required: [true, "pls input your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email address"],
  },
  phone: {
    type: String,
    validate: [validator.isMobilePhone, "please provide a valid phone number"],
  },
  organisation: {
    type: String,
    required: [true, "pls input name of organisation"],
  },
  role: {
    type: String,
    enum: {
      values: ["company"],
      message: "User role not allowed. Role must be company",
    },
    default: "company",
  },
  password: {
    type: String,
    required: [true, "pls input your password"],
    minlength: [8, "password must be more than 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "pls confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords dont match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  bvn: {
    type: Number,
  },
  cac: {
    type: String,
  },
  verifiedOTP: {
    type: Boolean,
    default: false,
  },
  walletId: {
    type: String,
  },
  wallet: {
    type: String,
  },
  bank: {
    type: String,
  },
  verifiedBvn: {
    type: Boolean,
    default: false,
  },
  verifiedCac: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  country: {
    type: String,
    required: [true, "pls enter your country code"],
    enum: {
      values: ["NG", "GH"],
      message: "Country not allowed. Country code must be NG or GH",
    },
  },
  otp: {
    type: String,
  },
  otpReference: {
    type: String,
  },
  plan: {
    type: String,
    enum: {
      values: ["free", "basic", "premium"],
      message: "Plan not allowed. Plan must be free, basic or premium",
    },
    default: "free",
  },
  points: {
    type: Number,
    default: 0,
  },
});

companySchema.pre("save", async function (next) {
  // function runs only if password is modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

companySchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

companySchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// methods are available on every document
companySchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

companySchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // false means not changed
  return false;
};

companySchema.methods.createPasswordResetToken = function () {
  const resetToken = Math.floor(1000000 + Math.random() * 9000000).toString();

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Company = mongoose.model("Company", companySchema);

module.exports = Company;

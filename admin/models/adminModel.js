const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: {
      default: "admin",
      message: "User role not allowed",
    },
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
  isVerified: {
    type: Boolean,
    default: true,
  },
});

// once admin verifies otp, set active to true

adminSchema.pre("save", async function (next) {
  // function runs only if password is modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

adminSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

adminSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// methods are available on every document
adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

adminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const admin = mongoose.model("admin", adminSchema);

module.exports = admin;

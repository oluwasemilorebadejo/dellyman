const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../../middleware/middleware");
const subscriptionController = require("../controllers/subscriptionController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.post("/verifyOTP", authController.verifyOTP);

router.use(protect); // applies protect middleware to routes defined after this

router.post("/verify", authController.verify);

// router.route("/plan/:id").get(subscriptionController.getPlan);

router.use(restrictTo("admin"));

module.exports = router;

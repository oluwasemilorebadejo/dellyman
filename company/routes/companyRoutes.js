const express = require("express");
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController");
const { restrictTo } = require("../../middleware/middleware");
const subscriptionController = require("../controllers/subscriptionController");
const riderController = require("../../rider/controllers/riderController");
const uploadCompanyCac = require("../../middleware/multer");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);

router.post("/generate-otp", authController.generateOTP);
router.post("/verifyOTP", authController.verifyOTP);

router.use(authController.protect); // applies protect middleware to routes defined after this

router.post("/verify-bvn", authController.verifyBvn);
router.post("/upload-cac", uploadCompanyCac, authController.uploadCac);

router
  .route("/rider")
  .post(riderController.addRider)
  .get(riderController.getMyRiders);

router.route("/rider/:id").patch(riderController.updateRider);

router.get("/plans", subscriptionController.getAllPlans);

router.post("/plans/basic", subscriptionController.basicPlan);

router.post("/plans/premium", subscriptionController.premiumPlan);

router.get("/me", companyController.getMe, companyController.getUser);

router.route("/update-me").patch(companyController.updateMe);

router.use(restrictTo("admin"));

module.exports = router;

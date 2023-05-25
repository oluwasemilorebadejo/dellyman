const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.post("/verifyOTP", authController.verifyOTP);

router.use(authController.protect); // applies protect middleware to routes defined after this

router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers);

router.post("/verify", authController.verify);

router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser);

router.patch("/verify-cac/:id", authController.verifyCac);

// test deleted user and make sure they cant login after, also verify the companies by cac

module.exports = router;

const express = require("express");

const { restrictTo } = require("../../middleware/middleware");
const jobController = require("../../company/controllers/jobController");
const subscriptionController = require("../../company/controllers/subscriptionController");
const companyController = require("../../company/controllers/companyController");
const authController = require("../controllers/adminController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.use(authController.protect);

router.use(restrictTo("admin"));

// Job routes
router.get("/jobs", jobController.getAllJobs);

// Plan routes
router.post("/plans", subscriptionController.createPlan);
router.get("/plans", subscriptionController.getAllPlans);
router.get("/plans/:id", subscriptionController.getPlan);
router.delete("/plans/:id", subscriptionController.deletePlan);

// Company routes
router.get("/users/company", companyController.getAllUsers);
router.get("/users/company/:id", companyController.getUser);
router.delete("/users/company/:id", companyController.deleteUser);

// test deleted user and make sure they cant login after, also verify the companies by cac

module.exports = router;

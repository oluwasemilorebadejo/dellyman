const express = require("express");
const jobController = require("../controllers/jobController");
const { restrictTo, setCompanyId } = require("../../middleware/middleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.use(restrictTo("company"));

router.route("/").post(setCompanyId, jobController.createJob);

router.route("/my-jobs").get(jobController.getMyJobs);

router
  .route("/:id")
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob);

module.exports = router;

const express = require("express");
const jobController = require("../controllers/jobController");
const {
  protect,
  restrictTo,
  setCompanyId,
} = require("../../middleware/middleware");

const router = express.Router();

router.use(protect);

router.use(restrictTo("company"));

router
  .route("/")
  .post(setCompanyId, jobController.createJob)
  .get(jobController.getMyJobs);

module.exports = router;

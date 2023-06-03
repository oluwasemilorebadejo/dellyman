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

router.route("/").post(setCompanyId, jobController.createJob);

router
  .route("/:id")
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob);

router.get("/my-jobs", jobController.getMyJobs);

module.exports = router;

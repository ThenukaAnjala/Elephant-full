const express = require("express");
const router = express.Router();
const stationController = require("../controllers/station.controller");

router.get("/station/dashboard", stationController.getDashboardData);
router.post("/station/train/:id/warn", stationController.warnTrain);

module.exports = router;

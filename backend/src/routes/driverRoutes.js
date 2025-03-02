const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driver.controller");

router.get("/driver/warning", driverController.getWarning);
router.post("/driver/warning/stop", driverController.stopWarning);

module.exports = router;

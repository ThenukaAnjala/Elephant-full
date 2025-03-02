const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/register/driver", authController.registerDriver);
router.post("/register/station", authController.registerStation);
router.post("/register/camera", authController.registerCamera);

module.exports = router;

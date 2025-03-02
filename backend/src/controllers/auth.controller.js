const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");
const StationMaster = require("../models/StationMaster");
const CameraUser = require("../models/CameraUser");

exports.login = async (req, res) => {
  const { email, password, cameraId } = req.body;
  try {
    let user = null;
    let role = "";

    // Check Driver by email
    user = await Driver.findOne({ email });
    if (user) {
      role = "driver";
    } else {
      // Check Station by email
      user = await StationMaster.findOne({ email });
      if (user) role = "station";
    }

    // If still no user, check Camera by email
    if (!user) {
      user = await CameraUser.findOne({ email });
      if (user) {
        role = "camera";
        // For camera users, confirm cameraId matches
        if (!cameraId || cameraId !== user.cameraId) {
          return res.status(400).json({ message: "Invalid camera ID" });
        }
      }
    }

    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({ message: "Login successful", token, role, user });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.registerDriver = async (req, res) => {
  const { email, password, name, trainNo, routeNumber } = req.body;
  try {
    let exist = await Driver.findOne({ email });
    if (exist) return res.status(400).json({ message: "Driver user exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newDriver = new Driver({ email, password: hashed, name, trainNo, routeNumber });
    await newDriver.save();
    res.json({ message: "Driver registered successfully" });
  } catch (err) {
    console.error("registerDriver error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.registerStation = async (req, res) => {
  const { email, password, name, stationNo, stationName } = req.body;
  try {
    let exist = await StationMaster.findOne({ email });
    if (exist) return res.status(400).json({ message: "Station master exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newStation = new StationMaster({ email, password: hashed, name, stationNo, stationName });
    await newStation.save();
    res.json({ message: "Station Master registered successfully" });
  } catch (err) {
    console.error("registerStation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.registerCamera = async (req, res) => {
  const { email, cameraId, password } = req.body;
  try {
    let exist = await CameraUser.findOne({ email });
    if (exist) return res.status(400).json({ message: "Camera user already exists for that email" });

    const hashed = await bcrypt.hash(password, 10);
    const newCam = new CameraUser({ email, cameraId, password: hashed });
    await newCam.save();
    res.json({ message: "Camera user registered successfully" });
  } catch (err) {
    console.error("registerCamera error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

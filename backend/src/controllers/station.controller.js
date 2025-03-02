const Driver = require("../models/Driver");
const CameraUser = require("../models/CameraUser");

exports.getDashboardData = async (req, res) => {
  try {
    const drivers = await Driver.find().lean();
    const cameras = await CameraUser.find().lean();
    // Each camera document now includes isOnline and detectedElephants
    res.json({ drivers, cameras });
  } catch (err) {
    console.error("getDashboardData error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.warnTrain = async (req, res) => {
  try {
    const driverId = req.params.id;
    console.log("Warn driver ID:", driverId);
    res.json({ message: `Warning sent to driver with id ${driverId}` });
  } catch (err) {
    console.error("warnTrain error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

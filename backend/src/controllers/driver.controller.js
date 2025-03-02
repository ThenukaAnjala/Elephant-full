const Warning = require("../models/Warning");

exports.getWarning = async (req, res) => {
  try {
    let w = await Warning.findOne();
    if (!w) {
      w = new Warning({ warningActive: false });
      await w.save();
    }
    res.json(w);
  } catch (err) {
    console.error("getWarning error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.stopWarning = async (req, res) => {
  try {
    let w = await Warning.findOne();
    if (!w) return res.status(400).json({ message: "No warning found" });
    w.warningActive = false;
    w.stationMasterName = "";
    await w.save();
    res.json({ message: "Warning stopped", w });
  } catch (err) {
    console.error("stopWarning error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

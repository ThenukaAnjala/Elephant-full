const mongoose = require("mongoose");

const WarningSchema = new mongoose.Schema({
  warningActive: { type: Boolean, default: false },
  stationMasterName: { type: String, default: "" }
});

module.exports = mongoose.model("Warning", WarningSchema);

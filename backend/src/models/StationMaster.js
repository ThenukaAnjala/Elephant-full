const mongoose = require("mongoose");

const StationMasterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  stationNo: { type: String, required: true },
  stationName: { type: String, required: true }
});

module.exports = mongoose.model("StationMaster", StationMasterSchema);

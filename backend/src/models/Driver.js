const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  trainNo: { type: String, required: true },
  routeNumber: { type: String, required: true }
});

module.exports = mongoose.model("Driver", DriverSchema);

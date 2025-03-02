const mongoose = require("mongoose");

const CameraUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  cameraId: { type: String, required: true },
  password: { type: String, required: true },
  // We'll update these fields via socket events
  isOnline: { type: Boolean, default: false },
  detectedElephants: { type: Boolean, default: false }
});

module.exports = mongoose.model("CameraUser", CameraUserSchema);

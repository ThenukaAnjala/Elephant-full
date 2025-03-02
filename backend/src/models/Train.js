// backend/src/models/Train.js
const mongoose = require("mongoose");

const TrainSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model("Train", TrainSchema);

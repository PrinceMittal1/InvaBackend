// models/Saved.js
const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

savedSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Saved", savedSchema);

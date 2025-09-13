const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  seller_id : { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

followSchema.index({ user_id: 1, seller_id: 1 }, { unique: true });

module.exports = mongoose.model("Followed", followSchema);

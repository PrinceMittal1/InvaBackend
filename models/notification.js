const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type : {type : String},
  heading : {type : String},
  message : {type : String},
  clicked : {type : Boolean},
  seller_id : {type : String},
  user_id : {type : String},
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

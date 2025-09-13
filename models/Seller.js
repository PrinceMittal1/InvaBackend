const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  seller_id  : {type : String},
  businessName: { type: String},
  businessType: { type: String},
  city: {type:String},
  stateCode : {type:String},
  state: {type:String},
  products : {type: [String]},
  profile_picture : {type : String},
  email: { type: String, unique: true},
  vector: {type : [String]},
  followers : {type : Number, default:0 },
  latitude : {type : String},
  longtitude : {type : String},
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Seller", sellerSchema);

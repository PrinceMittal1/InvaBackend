const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title : { type: String},
  description : { type: String},
  sellerName : {type:String},
  sellerId : {type : String, ref: "Seller"},
  sellerCity : {type:String},
  sellerState : {type:String},
  tags : {type : [String]},
  productType : {type : [String]},
  vector: {type : [String], default :[]},
  viewCount : {type : Number, default: 0 },
  likeCount : {type : Number, default: 0 },
  price : {type : Number},
  images : {type : [String], default : []},
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);


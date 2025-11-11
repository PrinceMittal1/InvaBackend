const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id : {type : String},
  name: { type: String},
  phoneNumber: { type: String},
  city: {type:String},
  state: {type:String},
  stateCode: {type:String},
  age:{type:Number},
  interest:{type:[String]},
  notification_token : {type : String},
  gender:{type:String},
  cords: {
    latitude: { type: String },
    longitude: { type: String }
  },
  profile_picture : {type : String},
  email: { type: String, unique: true},
  vector: {type : [String]},
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);


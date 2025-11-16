const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id : {type : String,default:''},
  name: { type: String,default:""},
  phoneNumber: { type: String,default:''},
  city: {type:String,default:''},
  state: {type:String,default:''},
  stateCode: {type:String,default:''},
  age:{type:Number, default:0},
  interest:{type:[String],default:[]},
  notification_token : {type : String,default:""},
  gender:{type:String,default:''},
  cords: {
    latitude: { type: String,default:'' },
    longitude: { type: String,default:'' }
  },
  profile_picture : {type : String,default:''},
  email: { type: String,default:''},
  vector: {type : [String],default:[]},
  // createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);


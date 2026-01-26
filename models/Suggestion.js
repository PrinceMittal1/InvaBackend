const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.ObjectId, 
    ref: "User", 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Suggestion", SuggestionSchema);
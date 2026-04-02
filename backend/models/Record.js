const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  type: { type: String, enum: ["income", "expense"] },
  category: String,
  date: { type: Date, default: Date.now },
  note: String,
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Record", recordSchema);

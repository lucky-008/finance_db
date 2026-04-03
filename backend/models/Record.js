import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  type: { type: String, enum: ["income", "expense"] },
  category: String,
  date: { type: Date, default: Date.now },
  note: String,
  isDeleted: { type: Boolean, default: false }
});

export default mongoose.model("Record", recordSchema);

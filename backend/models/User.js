import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["viewer", "analyst", "admin"], default: "viewer" },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model("User", userSchema);

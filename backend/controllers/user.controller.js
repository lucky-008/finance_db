const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required" });

  if (name.trim().length < 2)
    return res.status(400).json({ message: "Name must be at least 2 characters" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: "Invalid email format" });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  const validRoles = ["viewer", "analyst", "admin"];
  if (role && !validRoles.includes(role))
    return res.status(400).json({ message: "Role must be viewer, analyst, or admin" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: hash, role });
  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token });
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const Record = require("../models/Record");

exports.createRecord = async (req, res) => {
  const { amount, type, category } = req.body;

  if (amount == null || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ message: "Amount must be a positive number" });

  if (!type || !["income", "expense"].includes(type))
    return res.status(400).json({ message: "Type must be income or expense" });

  if (!category || category.trim().length === 0)
    return res.status(400).json({ message: "Category is required" });

  const record = await Record.create({ ...req.body, category: category.trim(), userId: req.user.id });
  res.json(record);
};

exports.getRecords = async (req, res) => {
  const { type, category } = req.query;

  const filter = { isDeleted: false };
  if (type) filter.type = type;
  if (category) filter.category = category;

  const records = await Record.find(filter);
  res.json(records);
};

exports.updateRecord = async (req, res) => {
  const { amount, type, category } = req.body;

  if (amount != null && (isNaN(amount) || Number(amount) <= 0))
    return res.status(400).json({ message: "Amount must be a positive number" });

  if (type && !["income", "expense"].includes(type))
    return res.status(400).json({ message: "Type must be income or expense" });

  if (category !== undefined && category.trim().length === 0)
    return res.status(400).json({ message: "Category cannot be empty" });

  const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!record) return res.status(404).json({ message: "Record not found" });
  res.json(record);
};

exports.deleteRecord = async (req, res) => {
  await Record.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ message: "Deleted" });
};

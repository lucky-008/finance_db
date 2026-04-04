import Record from "../models/Record.js";

export const createRecord = async (req, res) => {
  try {
    const { amount, type, category } = req.body;

    if (amount == null || isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ message: "Amount must be a positive number" });

    if (!type || !["income", "expense"].includes(type))
      return res.status(400).json({ message: "Type must be income or expense" });

    if (!category || category.trim().length === 0)
      return res.status(400).json({ message: "Category is required" });

    const record = await Record.create({ ...req.body, category: category.trim(), userId: req.user.id });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Failed to create record" });
  }
};

export const getRecords = async (req, res) => {
  try {
    const { type, category, search, page = 1, limit = 10 } = req.query;

    const filter = { isDeleted: false };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      Record.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
      Record.countDocuments(filter)
    ]);

    res.json({
      records,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};

export const updateRecord = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Failed to update record" });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete record" });
  }
};

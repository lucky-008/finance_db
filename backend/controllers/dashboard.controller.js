import Record from "../models/Record.js";

export const summary = async (req, res) => {
  try {
    const data = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0, expense = 0;
    data.forEach(d => {
      if (d._id === "income") income = d.total;
      else expense = d.total;
    });

    res.json({
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};

export const category = async (req, res) => {
  try {
    const data = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category data" });
  }
};

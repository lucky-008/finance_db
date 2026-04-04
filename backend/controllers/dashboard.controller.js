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

export const recentActivity = async (req, res) => {
  try {
    const records = await Record.find({ isDeleted: false })
      .sort({ date: -1 })
      .limit(10);

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};

export const trends = async (req, res) => {
  try {
    const { period } = req.query;

    let dateFormat;
    if (period === "weekly") {
      dateFormat = { year: { $year: "$date" }, week: { $isoWeek: "$date" } };
    } else {
      dateFormat = { year: { $year: "$date" }, month: { $month: "$date" } };
    }

    const data = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { period: dateFormat, type: "$type" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.period.year": 1, "_id.period.month": 1, "_id.period.week": 1 } }
    ]);

    const trendsMap = {};
    data.forEach(d => {
      const key = period === "weekly"
        ? `${d._id.period.year}-W${d._id.period.week}`
        : `${d._id.period.year}-${String(d._id.period.month).padStart(2, "0")}`;

      if (!trendsMap[key]) trendsMap[key] = { period: key, income: 0, expense: 0 };
      trendsMap[key][d._id.type] = d.total;
    });

    const result = Object.values(trendsMap).sort((a, b) => a.period.localeCompare(b.period));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trends" });
  }
};

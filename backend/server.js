require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/records", require("./routes/record.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

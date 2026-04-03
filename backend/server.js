import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import recordRoutes from "./routes/record.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

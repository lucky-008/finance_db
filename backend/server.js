import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes.js";
import recordRoutes from "./routes/record.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again after 15 minutes" }
});

app.use(cors());
app.use(express.json());
app.use(limiter);

app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

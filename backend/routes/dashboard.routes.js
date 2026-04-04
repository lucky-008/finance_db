import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { summary, category, recentActivity, trends } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/summary", auth, role("analyst", "admin"), summary);
router.get("/category", auth, role("analyst", "admin"), category);
router.get("/recent", auth, role("analyst", "admin"), recentActivity);
router.get("/trends", auth, role("analyst", "admin"), trends);

export default router;

import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { summary, category } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/summary", auth, role("analyst", "admin"), summary);
router.get("/category", auth, role("analyst", "admin"), category);

export default router;

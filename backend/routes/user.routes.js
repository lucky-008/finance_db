import { Router } from "express";
import { register, login, getUsers } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", auth, role("admin"), getUsers);

export default router;

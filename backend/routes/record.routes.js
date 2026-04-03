import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { createRecord, getRecords, updateRecord, deleteRecord } from "../controllers/record.controller.js";

const router = Router();

router.post("/", auth, role("admin"), createRecord);
router.get("/", auth, getRecords);
router.put("/:id", auth, role("admin"), updateRecord);
router.delete("/:id", auth, role("admin"), deleteRecord);

export default router;

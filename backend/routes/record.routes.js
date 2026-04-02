const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/record.controller");

router.post("/", auth, role("admin"), ctrl.createRecord);
router.get("/", auth, ctrl.getRecords);
router.put("/:id", auth, role("admin"), ctrl.updateRecord);
router.delete("/:id", auth, role("admin"), ctrl.deleteRecord);

module.exports = router;

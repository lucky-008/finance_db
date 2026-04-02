const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/dashboard.controller");

router.get("/summary", auth, role("analyst", "admin"), ctrl.summary);
router.get("/category", auth, role("analyst", "admin"), ctrl.category);

module.exports = router;

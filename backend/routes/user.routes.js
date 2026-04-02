const router = require("express").Router();
const { register, login, getUsers } = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.post("/register", register);
router.post("/login", login);
router.get("/", auth, role("admin"), getUsers);

module.exports = router;

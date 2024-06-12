const express = require("express");
const { registerUser, authUser, allUser } = require("../controllers/userController");
const { protect } = require("../middlwares/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUser); // # we can chain multiple request this way
router.post("/login", authUser);  // only one request will be done this way

module.exports = router;
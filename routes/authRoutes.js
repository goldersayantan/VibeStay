const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

router.get("/signin", authController.getSignIn);
router.post("/signin", authController.postSignIn);
router.get("/signup", authController.getSignUp);
router.post("/signup", authController.postSignUp);
module.exports = router
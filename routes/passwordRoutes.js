const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.get("/verify-otp", passwordController.getVerifyOTP);
router.post("/verify-otp", passwordController.postVerifyOTP);
router.get("/logout", passwordController.logOut);
router.get("/forgot-password", passwordController.getForgetPassword);
router.post("/forgot-password", passwordController.postForgetPassword);
router.post("/reset-password", passwordController.postResetPassword);

module.exports = router;
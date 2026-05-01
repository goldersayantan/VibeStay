const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/authController.js");

router.get("/signin", authController.getSignIn);
router.post("/signin", authController.postSignIn);
router.get("/signup", authController.getSignUp);
router.post("/signup", authController.postSignUp);
router.get("/auth/google", 
    passport.authenticate("google",
        {scope: ["profile", "email"]}
    )
);
router.get("/auth/google/callback", 
    passport.authenticate("google", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Logged in successfully with Google");
        res.redirect("/listings");
    }
);
module.exports = router
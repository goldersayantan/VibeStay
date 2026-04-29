const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const OTP = require("../models/otp");
const sendEmail = require("../config/mailer.js");

const getSignIn = (req, res) => {
    res.render("user/signin");
};

const postSignIn = (req, res, next)  => {
    passport.authenticate("local", (err, user, info) => {
        if(err) {
            return next(err);
        }
        if(!user)   {
            req.flash("error", "Invalid username or password");
            return res.redirect("/signin");
        }
        req.login(user, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Successfully logged in");
            return res.redirect("/listings");
        });
    })(req, res, next);
};

const getSignUp = (req, res) => {
    res.render("user/signup");
};

const postSignUp = async (req, res) => {
    try {
        const { username, email, password, "confirm-password": confirmPassword } = req.body;
        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match");
            return res.redirect("/signup");
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        await OTP.deleteMany({ email });
        await OTP.create({
            email,
            otp: hashedOtp,
            userData: { username, email, password }
        });
        await sendEmail(
            email,
            "OTP Verification",
            `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
        );
        res.render("user/verify-otp", { email });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/signup");
    }
};

module.exports = {
    getSignIn,
    postSignIn,
    getSignUp,
    postSignUp
}
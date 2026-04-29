const express = require("express");
const router = express.Router();
const OTP = require("../models/otp");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const sendEmail = require("../config/mailer");

const getVerifyOTP = (req, res)   => {
    res.redirect("/signup");
};

const postVerifyOTP = async(req, res, next)   => {
    const {email, otp} = req.body;
    const record = await OTP.findOne({ email });
    if(!record) {
        req.flash("error", "OTP expired or not found");
        return res.redirect("/signup");
    }
    const isMatch = await bcrypt.compare(otp, record.otp);
    if(!isMatch)    {
        req.flash("error", "Invalid OTP");
        return res.redirect("/verify-otp");
    }
    try {
        const newUser = new User({
            username: record.userData.username,
            email: record.userData.email
        });
        const registeredUser = await User.register(
            newUser,
            record.userData.password
        );
        req.login(registeredUser, async (err) => {
            if(err) {
                return next(err);
            }
            await OTP.deleteMany({email});
            req.flash("success", "Account created Successfully");
            res.redirect("/listings");
        })
    }catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

const logOut = (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        req.flash("success", "Logged Out Successfully.");
        res.redirect("/listings");
    });
};

const getForgetPassword = (req, res) => {
    res.render("user/forgot-password");
};

const postForgetPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user)   {
            req.flash("error", "User not found");
            return res.redirect("/forgot-password");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        await OTP.deleteMany({email});
        await OTP.create({
            email,
            otp: hashedOtp
        });
        await sendEmail(
            email,
            "Password Reset OTP",
            `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
        );
        req.flash("success", "OTP sent successfully.");
        res.render("user/reset-password", {email});
    }catch(err) {
        req.flash("error", "Failed to send OTP. Try again.");
        return res.redirect("/forgot-password");
    }
};

const postResetPassword = async(req, res) => {
    const {email, otp, newPassword, confirmNewPassword} = req.body;
    if(newPassword != confirmNewPassword)   {
        req.flash("error", "Passwords do not match");
        return res.redirect("/forgot-password");
    }
    const record = await OTP.findOne({email});
    if(!record) {
        req.flash("error", "OTP expired or not found");
        return res.redirect("/forgot-password");
    }
    const isMatch = await bcrypt.compare(otp, record.otp);
    if(!isMatch)    {
        req.flash("error", "invalid OTP");
        res.render("user/reset-password", { email });
    }
    const user = await User.findOne({email});
    if(!user)   {
        req.flash("error", "User not found");
        return res.redirect("/forgot-password");
    }
    await user.setPassword(newPassword);
    await user.save();
    await OTP.deleteMany({email});
    req.flash("success", "Password reset successful. Please login.");
    res.redirect("/signin");
};

module.exports = {getVerifyOTP, postVerifyOTP, logOut, getForgetPassword, postForgetPassword, postResetPassword};
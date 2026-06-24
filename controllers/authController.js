const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const OTP = require("../models/otp");
const sendEmail = require("../config/sendEmail.js");
const Listing = require("../models/listing");
const Booking = require("../models/booking.js");

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

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash(
                "error",
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
            );
            return res.redirect("/signup");
        }

        const {isDisposableEmail} = require("disposable-email-domains-js");
        if (isDisposableEmail(email)) {
            req.flash(
                "error",
                "Temporary email addresses are not allowed."
            );
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
        const otpTemplate = require("../emails/otpTemplate.js");
        await sendEmail(
            email,
            "OTP Verification",
            otpTemplate(username, otp)
        );
        res.render("user/verify-otp", { email });
    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/signup");
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        const listings = await Listing.find({
            owner: user._id
        });

        const myBookings = (await Booking.find({
            user: user._id
        }).populate("listing").sort({createdAt: -1})
        ).filter(booking => booking.listing);

        const bookingRequests = (await Booking.find({
            host: user._id,
            status: "pending"
        }).populate("user").populate("listing")
        ).filter(booking => booking.listing);
        
        listings.forEach(listing => {
            listing.startingPrice =
                listing.roomTypes?.length > 0
                    ? Math.min(
                        ...listing.roomTypes.map(room => room.pricePerNight)
                    )
                    : 0;
        });

        user.wishlist.forEach(listing => {
            listing.startingPrice = 
                listing.roomTypes?.length > 0
                    ? Math.min(
                        ...listing.roomTypes.map(room => room.pricePerNight)
                    )
                    : 0;
        });

        const approvedBookings = (
            await Booking.find({
                host: user._id,
                status: "approved",
                checkOut:   {
                    $gte: new Date()
                }
            }).populate("user").populate("listing")
        ).filter(booking => booking.listing);

        res.render("user/user-profile", {
            user,
            listings,
            bookingRequests,
            myBookings,
            approvedBookings,
            wishlistListings: user.wishlist
        });

    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
};

const getEditProfile = async(req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/edit-profile", {user});
};

const updateProfile = async(req, res) => {
    const {username, aboutme, gender, dob, country, city, pincode} = req.body;
    await User.findByIdAndUpdate(
        req.user._id,
        {username, aboutme, gender, dob, location: {country, city, pincode}},
        {new: true}
    );
    req.flash("success", "Profile Updated Successfully");
    res.redirect("/profile");
};

const toggleWishlist = async(req, res) => {
    try {
        if(!req.user)   {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }
        const {id} = req.params;
        const user = await User.findById(req.user._id);
        const exists = user.wishlist.some(
            listingId => listingId.toString() === id
        );
        if(exists)  {
            user.wishlist.pull(id);
            await user.save();
            return res.json({
                success: true,
                wishlisted: false,
                message: "Listing removed from wishlist."
            });
        }
        user.wishlist.push(id);
        await user.save();
        return res.json({
            success: true,
            wishlisted: true,
            message: "Listing added to wishlist ❤️"
        })
    }catch(err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
};

module.exports = {
    getSignIn,
    postSignIn,
    getSignUp,
    postSignUp,
    getProfile,
    getEditProfile,
    updateProfile,
    toggleWishlist
}
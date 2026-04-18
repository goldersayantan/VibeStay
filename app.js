// To use the data from .env file
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const passport = require("./config/passport");
const session = require("express-session");
const User = require("./models/user");
const ejsMate = require("ejs-mate");
const { isLoggedIn } = require("./middleware/isLoggedIn");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const sendEmail = require("./config/mailer");
const OTP = require("./models/otp");
const upload= require("./config/multer");
const Listing = require("./models/listing");
const cloudinary = require("./config/cloudConfig");
const methodOverride = require("method-override");
let port = 8080;

// Session Configuration
const sessionOptions = {
    secret: "mysupersecretcode", // Secret key used to sign and secure the session cookie
    resave: false, // Prevents session from being saved again if nothing changed
    saveUninitialized: false // Do not create a session until something is stored in it (good for login systems)
};

app.use(session(sessionOptions)); // Enables session management in Express (stores session data between requests)
app.use(passport.initialize()); // Initializes Passport authentication system for the app
app.use(passport.session()); // Allows Passport to use sessions to keep users logged in
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
app.use(methodOverride("_method"));

// For flash messages
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//MongoDB Connection
const DBUrl = process.env.mongoDBUrl;
app.use(express.urlencoded({extended : true}));
mongoose.connect(DBUrl).then(() => {
    console.log("Connected To Database");
}).catch((err) => {
    console.log(err);
});

// Setup for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Setup for CSS and JS
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("landingPage.ejs");
});

app.get("/index", async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings });
});

app.get("/listings", (req, res) => {
    res.redirect("/index");
});

app.post("/index", isLoggedIn, upload.array("images", 5), async(req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            req.flash("error", "At least 1 image is required");
            return res.redirect("/new");
        }

        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "VibeStay" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                ).end(fileBuffer);
            });
        };

        const uploadedImages = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer))
        );

        const imageData = uploadedImages.map(img => ({
            url: img.secure_url,
            filename: img.public_id
        }));

        let roomTypes = req.body.roomTypes;
        if (!roomTypes) roomTypes = [];
        else if (!Array.isArray(roomTypes)) roomTypes = [roomTypes];

        const newListing = new Listing({
            owner: req.user._id,
            title: req.body.title,
            description: req.body.description,
            propertyType: req.body.propertyType,
            roomTypes,
            location: {
                country: req.body.country,
                city: req.body.city,
                address: req.body.address,
                pincode: req.body.pincode,
                landmark: req.body.landmark
            },
            price: req.body.price,
            email: req.body.email,
            images: imageData
        });

        await newListing.save();

        req.flash("success", "Listing created successfully.");
        res.redirect("/index");

    } catch (err) {
        console.log(err);
        req.flash("error", "Error in creating listing.");
        res.redirect("/new");
    }
});

// User section (Sign In, Sign Up)
app.get("/signin", (req, res) => {
    res.render("user/signin");
});

app.post("/signin", (req, res, next)  => {
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
            return res.redirect("/index");
        });
    })(req, res, next);
});

app.get("/signup", (req, res) => {
    res.render("user/signup");
})

app.post("/signup", async(req, res) => {
    const {username, email, password, "confirm-password": confirmPassword} = req.body;
    if(password !== confirmPassword)    {
        req.flash("error", "Password do not match");
        return res.redirect("/signup");
    }
    const existingUser = await User.findOne({email});
    if(existingUser)    {
        req.flash("error", "User already exists");
        return res.redirect("/signup");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.deleteMany({ email });
    await OTP.create({
        email,
        otp: hashedOtp,
        userData: {username, email, password}
    });
    await sendEmail(
        email,
        "OTP Verification",
        `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
    );
    res.render("user/verify-otp", { email });
});

app.get("/verify-otp", (req, res)   => {
    res.redirect("/signup");
});

app.post("/verify-otp", async(req, res, next)   => {
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
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            OTP.deleteMany({email});
            req.flash("success", "Account created Successfully");
            res.redirect("/index");
        })
    }catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
});


app.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        req.flash("success", "Logged Out Successfully.");
        res.redirect("/index");
    });
});

app.get("/forgot-password", (req, res) => {
    res.render("user/forgot-password");
});

app.post("/forgot-password", async (req, res) => {
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
    try {
        await sendEmail(
        email,
        "Password Reset OTP",
        `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
    );
    }catch(err) {
        req.flash("error", "Failed to send OTP. Try again.");
        return res.redirect("/forgot-password");
    }
    res.render("user/reset-password", {email});
    req.flash("success", "OTP sent successfully.");
});

app.post("/reset-password", async(req, res) => {
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
});

// Listing new property
app.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Showing All the listings
app.get("/listings/:id", async(req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("owner");
        if(!listing)    {
            req.flash("error", "Listing not found");
            return res.redirect("/index");
        }
        res.render("listings/show", {listing});
    } catch(err)    {
        req.flash("error", "Something went wrong");
        res.redirect("/index");
    }
});

app.delete("/listings/:id", isLoggedIn, async(req, res) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing.owner.equals(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/index");
    }
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted");
    res.redirect("/index");
});

app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.send("Each image must be less than 1MB");
    }
    if (err.message === "Only JPG, JPEG, PNG files are allowed!") {
        return res.send("Invalid file type");
    }
    res.send(err.message || "Something went wrong");
});

app.listen(port, () => {
    console.log(`App is running on: http://localhost:${port}`)
});
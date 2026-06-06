// To use the data from .env file
require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const passport = require("./config/passport");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const connectDB = require("./config/db");
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
connectDB();
app.use(express.urlencoded({extended : true}));

// Setup for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Setup for CSS and JS
app.use(express.static(path.join(__dirname, "public")));

// Setup for assets
app.use(express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
    res.render("listings/landingPage.ejs");
});

const router = express.Router();
const listingRoutes = require("./routes/listingRoutes");
app.use(listingRoutes);

const authRoutes = require("./routes/authRoutes");
app.use(authRoutes);

const passwordRoutes = require("./routes/passwordRoutes");
app.use(passwordRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use(bookingRoutes);


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
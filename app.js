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

app.get("/index", (req, res) => {
    res.render("listings/index.ejs");
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

app.post("/signup", async (req, res, next)  =>  {
    const newUser = new User({
        username : req.body.username,
        email : req.body.email
    });
    const registeredUser = await User.register(newUser, req.body.password);
    req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
        res.redirect("/index");
    });
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

// Listing new property
app.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

app.listen(port, () => {
    console.log(`App is running on: http://localhost:${port}`)
});
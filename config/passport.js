const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            let actualUsername = username;

            if (username.includes("@")) {
                const user = await User.findOne({ email: username });
                if (!user) return done(null, false);
                actualUsername = user.username;
            }

            User.authenticate()(actualUsername, password, (err, user, info) => {
                if (err) return done(err);
                if (!user) return done(null, false, info);
                return done(null, user);
            });

        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
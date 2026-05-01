const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

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

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8080/auth/google/callback"
        },
        async(accessToken, efreshToken, profile, done) => {
            try{
                const email = profile.emails[0].value;
                let user = await User.findOne({
                    $or: [
                        {googleId: profile.id},
                        {email: email}
                    ]
                });
                if(user)    {
                    if(!user.googleId)  {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }
                const newUser = new User({
                    username: profile.displayName.replace(/\s+/g,"").toLowerCase(),
                    email: email,
                    googleId: profile.id
                });
                await newUser.save();
                return done(null, newUser);
            }catch(err) {
                return done(err, null);
            } 
        }
    )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
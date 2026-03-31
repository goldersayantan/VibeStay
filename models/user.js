const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default || require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
    // Here don't need to store username and password, they will be automatically stored because of "passport"
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
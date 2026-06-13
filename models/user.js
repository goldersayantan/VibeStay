const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default || require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
    // Here don't need to store username and password, they will be automatically stored because of "passport"
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId:   {
        type: String,
        default: null
    },
    createdAt:  {
        type: Date,
        ddefault: Date.now
    },
    aboutme:    {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Non-Binary", "Prefer-Not-To-Say"],
        default: null
    },
    dob:    {
        type: Date,
        default: null
    },
    location:   {
        country:    {
            type: String,
            default: ""
        },
        city:   {
            type: String,
            default: "" 
        },
        pincode:    {
            type: Number,
            default: ""
        }
    },
    wishlist:   [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
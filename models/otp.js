const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
    email:  {
        type: String,
        required: true
    },
    otp:    {
        type: String,
        required: true
    },
    userData:   {
        username: String,
        email: String,
        password: String
    },
    createdAt:  {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

module.exports = mongoose.model("OTP", otpSchema);
const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
    listing:    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    },
    user:   {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    roomTypeId: {
        type: mongoose.Schema.Types.ObjectId
    },
    roomsBooked: Number,
    checkIn: Date,
    checkOut: Date,
    status: {
        type: String,
        default: "confirmed"
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
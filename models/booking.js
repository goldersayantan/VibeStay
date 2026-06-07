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
    host:   {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    roomTypeId: {
        type: mongoose.Schema.Types.ObjectId
    },
    rooms:  [
        {
            roomTypeId: mongoose.Schema.Types.ObjectId,
            roomType: String,
            quantity: Number,
            pricePerNight: Number
        }
    ],
    checkIn: Date,
    checkOut: Date,
    totalPrice: Number,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    createdAt:  {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
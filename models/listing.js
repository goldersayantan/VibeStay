const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
    owner:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title:  {
        type: String,
        required: true,
    },
    description:    {
        type: String,
        required: true
    },
    images: [
        {
            url: String,
            filename: String
        }
    ],
    propertyType:   {
        type: String,
        enum: ["Hotel", "Apartment", "Villa", "Homestay", "Hostel", "Resort", "Guest House"],
        required: true
    },
    roomTypes:  [
        {
            roomType:   {
                type: String,
                enum:   ["single-room", "double-room", "twin-room", "triple-room", "quad-room", "queen-room", "king-room", "studio-room", "suite-room", "deluxe-room", "family-room", "hostel-room"],
                required: true
            },
            totalRooms: {
                type: Number,
                required: true,
                min: 0
            },
            pricePerNight:  {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    location:   {
        country:    {
            type: String,
            required: true
        },
        city:   {
            type: String,
            required: true
        },
        address:    {
            type: String,
            required: true
        },
        pincode:    {
            type: Number,
            required: true
        },
        landmark:   {
            type: String,
            required: true
        }
    },
    email:  {
        type: String,
        required: true
    },
    wifi:   {
        type: String,
        enum: ["wifi-available", "wifi-not-available"],
        required: true
    },
    parking:    {
        type: String,
        enum: ["parking-available", "parking-not-available"],
        required: true
    },
    reviews:    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    createdAt:  {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Listing", listingSchema);
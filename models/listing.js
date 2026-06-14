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
        },
    },
    geometry:   {
        type:   {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates:    {
            type: [Number],
            required: true,
            validate:   {
                validator: function(v)  {
                    return v.length === 2;
                },
                message: "Coordinates must contain longitude and latitude"
            }
        }
    },
    email:  {
        type: String,
        required: true
    },
    amenities:  {
        wifi:   {
            type: Boolean,
            default: false
        },
        parking:    {
            type: Boolean,
            default: false
        },
        spa:    {
            type: Boolean,
            default: false
        },
        pool:   {
            type: Boolean,
            default: false
        },
        gym:    {
            type: Boolean,
            default: false
        },
        airConditioning:    {
            type: Boolean,
            default: false
        },
        breakfast:  {
            type: Boolean,
            default: false
        },
        petFriendly:    {
            type: Boolean,
            default: false
        },
        laundryService: {
            type: Boolean,
            default: false
        },
        restaurant:  {
            type: Boolean,
            default: false
        },
        kitchen:    {
            type: Boolean,
            default: false
        },
        bar:    {
            type: Boolean,
            default: false
        },
        roomService:    {
            type: Boolean,
            default: false
        },
        frontDesk:  {
            type: Boolean,
            default: false
        }
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

listingSchema.index({ geometry: "2dsphere" });
module.exports = mongoose.model("Listing", listingSchema);
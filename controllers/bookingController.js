const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const {isLoggedIn} = require("../middleware/isLoggedIn");

const getBookingForm = async(req, res) => {
    const {listingId, checkIn, checkOut} = req.query;
    const listing = await Listing.findById(listingId);
    const availableRooms = [];
    for(const room of listing.roomTypes) {
        const bookings = await Booking.find({
            listing: listingId,
            status: "confirmed",
            roomTypeId: room._id,
            checkIn: {$lt: new Date(checkOut)},
            checkOut: {$gt: new Date(checkIn)}
        });
        const occupiedRooms = bookings.reduce((sum, booking) => 
            sum + booking.roomsBooked, 0
        );
        availableRooms.push({
            roomId: room._id,
            roomType: room.roomType,
            availableRooms: room.totalRooms - occupiedRooms,
            pricePerNight: room.pricePerNight
        });
    }
    res.render("bookings/new", {listing, checkIn, checkOut, availableRooms});
};

module.exports = {getBookingForm};
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

const createBooking = async(req, res) => {
    const {listingId, checkIn, checkOut, rooms} = req.body;
    const listing = await Listing.findById(listingId);
    let selectedRooms = [];
    let totalPrice = 0;
    const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    for(const room of listing.roomTypes)    {
        const quantity = Number(rooms[room._id]) || 0;
        if(quantity > 0)    {
            selectedRooms.push({
                roomTypeId: room._id,
                roomType: room.roomType,
                quantity,
                pricePerNight: room.pricePerNight
            });
            totalPrice += quantity * room.pricePerNight * nights;
        }
    }
    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        host: listing.owner,
        rooms: selectedRooms,
        checkIn,
        checkOut,
        totalPrice,
        status: "pending"
    });
    await booking.save();
    res.send("Booking Request Saved");
};

const approveBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking)    {
            req.flash("error", "Booking Not found");
            return res.redirect("/profile");
        }
        booking.status = "approved";
        await booking.save();
        req.flash("success", "Booking Approved Successfully");
        res.redirect("/profile");
    } catch(err)    {
        console.log(err);
        req.flash("error", "Something went wrong");
    }
};

const rejectBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking)    {
            req.flash("error", "Booking not found");
            return res.redirect("/profile");
        }
        booking.status = "rejected";
        await booking.save();
        req.flash("success", "Booking rejected successfully");
        res.redirect("/profile");
    }catch(err) {   
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/profile");
    }
};

module.exports = {getBookingForm, createBooking, approveBooking, rejectBooking};
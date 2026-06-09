const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const {isLoggedIn} = require("../middleware/isLoggedIn");
const getAvailableRooms = require("../utils/checkRoomAvailability");

const getBookingForm = async(req, res) => {
    const {listingId, checkIn, checkOut} = req.query;
    const listing = await Listing.findById(listingId);
    const availableRooms = [];
    for(const room of listing.roomTypes) {
        const bookings = await Booking.find({
            listing: listingId,
            status: "approved",
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
    const sendEmail = require("../config/mailer");
    const bookingPendingUser = require("../emails/bookingPendingUser");
    const bookingPendingHost = require("../emails/bookingPendingHost");
    await listing.populate("owner");
    await sendEmail(
        req.user.email, 
        "Booking Request Submitted", 
        bookingPendingUser(booking)
    );
    await sendEmail(
        listing.owner.email,
        "New booking Request",
        bookingPendingHost(booking)
    );
    res.redirect("/profile");
};

const approveBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking)    {
            req.flash("error", "Booking Not found");
            return res.redirect("/profile");
        }
        for(const room of booking.rooms)    {
            const available = await getAvailableRooms(
                booking.listing,
                room.roomTypeId,
                booking.checkIn,
                booking.checkOut
            );
            if(room.quantity > available)   {
                booking.status = "rejected";
                await booking.save();
                req.flash("error", "Booking rejected because rooms are no longer available.");
                return res.redirect("/profile");
            }
        }
        booking.status = "approved";
        await booking.save();
        await booking.populate("user");
        const bookingApproved = require("../emails/bookingApproved");
        await sendEmail(
            booking.user.email,
            "Booking Approved",
            bookingApproved(booking)
        );
        await rejectConflictingBookings(booking);
        req.flash("success", "Booking Approved Successfully");
        res.redirect("/profile");
    } catch(err)    {
        console.log(err);
        req.flash("error", "Something went wrong");
    }
};

const rejectConflictingBookings = async(approveBooking) => {
    const pendingBookings = await Booking.find({
        listing:
            approveBooking.listing,
        status: "pending",
        _id:    {
            $ne: approveBooking._id
        },
        checkIn:    {
            $lt: approveBooking.checkOut
        },
        checkOut:    {
            $gt: approveBooking.checkIn
        }
    });

    for(const booking of pendingBookings) {
        let valid = true;
        for(const room of booking.rooms) {
            const available =
                await getAvailableRooms(
                    booking.listing,
                    room.roomTypeId,
                    booking.checkIn,
                    booking.checkOut
                );
            if(room.quantity > available) {
                valid = false;
                break;
            }
        }
        if(!valid) {
            booking.status =
                "rejected";
            await booking.save();
        }
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
        await booking.populate("user");
        const bookingRejected = require("../emails/bookingRejected");
        await sendEmail(
            booking.user.email,
            "Booking Rejected",
            bookingRejected(booking)
        );
        req.flash("success", "Booking rejected successfully");
        res.redirect("/profile");
    }catch(err) {   
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/profile");
    }
};

const cancelBooking = async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking)    {
            req.flash("error", "Booking not found.");
            return res.redirect("/profile");
        }
        if(booking.user.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized");
            return res.redirect("/profile");
        }
        const oneDayBefore = new Date(booking.checkIn);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        if(new Date() >= oneDayBefore)  {
            req.flash("error", "Booking can only be cancelled at least 1 day before check-in");
            return res.redirect("/profile");
        }
        if(booking.status !== "pending" && booking.status !== "approved")   {
            req.flash("error", "This booking cannot be cancelled");
            return res.redirect("/profile");
        }
        booking.status = "cancelled";
        await booking.save();
        await booking.populate(["user", "host", "listing"]);
        const bookingCancelledUser = require("../emails/bookingCancelledUser");
        await sendEmail(
            booking.user.email,
            "Booking Cancelled",
            bookingCancelledUser(booking)
        );
        const bookingCancelledHost = require("../emails/bookingCancelledHost");
        await sendEmail(
            booking.host.email,
            "Guest Cancelled Booking",
            bookingCancelledHost(booking)
        );
        req.flash("success", "Booking cancelled successfully.");
        res.redirect("/profile");
    }catch(err) {
        req.flash("error", "Something went wrong");
        res.redirect("/profile")
    }
}

module.exports = {getBookingForm, createBooking, approveBooking, rejectBooking, cancelBooking};
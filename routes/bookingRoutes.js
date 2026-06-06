const express = require("express");
const router = express.Router();
const {isLoggedIn} = require("../middleware/isLoggedIn");
const bookingController = require("../controllers/bookingController");

router.get("/bookings/new", isLoggedIn, bookingController.getBookingForm);

module.exports = router
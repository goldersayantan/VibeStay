const express = require("express");
const router = express.Router();
const {isLoggedIn} = require("../middleware/isLoggedIn");
const bookingController = require("../controllers/bookingController");

router.get("/bookings/new", isLoggedIn, bookingController.getBookingForm);
router.post("/bookings", isLoggedIn, bookingController.createBooking);
router.post("/bookings/:id/approve", isLoggedIn, bookingController.approveBooking);
router.post("/bookings/:id/reject", isLoggedIn, bookingController.rejectBooking);

module.exports = router;
const express = require("express");
const router = express.Router();
const {isLoggedIn} = require("../middleware/isLoggedIn");
const reviewController = require("../controllers/reviewController");

router.post("/listings/:id/reviews", isLoggedIn, reviewController.createReview);
router.put("/listings/:id/reviews/:reviewId", isLoggedIn, reviewController.updateReview);
router.delete("/listings/:id/reviews/:reviewId", isLoggedIn, reviewController.deleteReview);

module.exports = router

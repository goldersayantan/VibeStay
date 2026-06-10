const express = require("express");
const router = express.Router();
const {isLoggedIn} = require("../middleware/isLoggedIn");
const upload = require("../config/multer");
const listingController = require("../controllers/listingController");
const reviewController = require("../controllers/reviewController");

router.get("/listings", listingController.getAllListings);
router.post("/listings", isLoggedIn, upload.array("images", 5), listingController.postNewListing);
router.get("/listings/new", isLoggedIn, listingController.getNewListing);
router.get("/listings/:id/edit", isLoggedIn, listingController.getEditListing);
router.get("/listings/:id", listingController.showListing);
router.delete("/listings/:id", isLoggedIn, listingController.deleteListing);
router.put("/listings/:id", isLoggedIn, upload.array("images", 5), listingController.updateListing);
router.get("/listings/:id/check-availability", listingController.chechAvailability);
router.post("/listings/:id/reviews", isLoggedIn, reviewController.createReview);

module.exports = router

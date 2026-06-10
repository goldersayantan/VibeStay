const Listing = require("../models/listing");
const Review = require("../models/review");

const createReview = async(req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    const review = new Review({
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user._id,
        listing: listing._id
    });
    await review.save();
    listing.reviews.push(review);
    await listing.save();
    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${id}`);
}

module.exports = {createReview}
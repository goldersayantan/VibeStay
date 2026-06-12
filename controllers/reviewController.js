const Listing = require("../models/listing");
const Review = require("../models/review");

const createReview = async(req, res) => {
    const {id} = req.params;

    const existingReview = await Review.findOne({
        listing: id,
        user:req.user._id
    });

    if(existingReview)  {
        req.flash("error", "You have already reviewd this property.");
        return res.redirect(`/listings/${id}`);
    }

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
};

const updateReview = async(req, res) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.user.equals(req.user._id))   {
        req.flash("error", "Unauthorized");
        return res.redirect(`/listings/${id}`);
    }
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();
    req.flash("success", "Review updated successfully");
    res.redirect(`/listings/${id}`);
};

const deleteReview = async(req, res) => {
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {
        $pull:  {
            reviews: reviewId
        }
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
};

module.exports = {createReview, updateReview, deleteReview};
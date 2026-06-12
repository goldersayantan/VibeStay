const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:   {
        type: String,
        required: true
    },
    user:   {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    listing:    {
        type: Schema.Types.ObjectId,
        ref: "Listing"
    },
    createdAt:  {
        type: Date,
        default: Date.now
    }
});

reviewSchema.index(
    {user: 1, listing: 1},
    {unique: true}
);

module.exports = mongoose.model("Review", reviewSchema);
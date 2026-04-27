const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const {isLoggedIn} = require("../middleware/isLoggedIn");
const cloudinary = require("../config/cloudConfig");
const upload = require("../config/multer");

router.get("/listings", async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings });
});

router.post("/listings", isLoggedIn, upload.array("images", 5), async(req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            req.flash("error", "At least 1 image is required");
            return res.redirect("/new");
        }

        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "VibeStay" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                ).end(fileBuffer);
            });
        };

        const uploadedImages = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer))
        );

        const imageData = uploadedImages.map(img => ({
            url: img.secure_url,
            filename: img.public_id
        }));

        let roomTypes = req.body.roomTypes;
        if (!roomTypes) roomTypes = [];
        else if (!Array.isArray(roomTypes)) roomTypes = [roomTypes];

        const newListing = new Listing({
            owner: req.user._id,
            title: req.body.title,
            description: req.body.description,
            propertyType: req.body.propertyType,
            roomTypes,
            location: {
                country: req.body.country,
                city: req.body.city,
                address: req.body.address,
                pincode: req.body.pincode,
                landmark: req.body.landmark
            },
            price: req.body.price,
            email: req.body.email,
            images: imageData
        });

        await newListing.save();

        req.flash("success", "Listing created successfully.");
        res.redirect("/listings");

    } catch (err) {
        console.log(err);
        req.flash("error", "Error in creating listing.");
        res.redirect("listings/new");
    }
});

router.get("/listings/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Showing All the listings
router.get("/listings/:id", async(req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("owner");
        if(!listing)    {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        res.render("listings/show", {listing});
    } catch(err)    {
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
});

router.delete("/listings/:id", isLoggedIn, async(req, res) => {
    const listing = await Listing.findById(req.params.id);
    if(!listing.owner.equals(req.user._id)) {
        req.flash("error", "Unauthorized");
        return res.redirect("/listings");
    }
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
});

module.exports = router

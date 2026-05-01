const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const {isLoggedIn} = require("../middleware/isLoggedIn");
const cloudinary = require("../config/cloudConfig");
const upload = require("../config/multer");

const getAllListings = async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings });
};

const getNewListing = (req, res) => {
    res.render("listings/new.ejs");
};

const postNewListing = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            req.flash("error", "At least 1 image is required");
            return res.redirect("/listings/new");
        }
        let roomTypes = req.body.roomTypes;
        if (!roomTypes) {
            req.flash("error", "Please select at least one room type");
            return res.redirect("/listings/new");
        }
        if (!Array.isArray(roomTypes)) {
            roomTypes = [roomTypes];
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
            req.files.map((file) => uploadToCloudinary(file.buffer))
        );
        const imageData = uploadedImages.map((img) => ({
            url: img.secure_url,
            filename: img.public_id
        }));
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
            wifi: req.body.wifi,
            parking: req.body.parking,
            images: imageData
        });
        await newListing.save();
        req.flash("success", "Listing created successfully.");
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        req.flash("error", "Error in creating listing.");
        res.redirect("/listings/new");
    }
};

const getEditListing = async(req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("owner");
        if(!listing)    {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        res.render("listings/edit", {listing});
    }catch(err) {
        req.flash("error", "Something went wrong");
        res.redirect("/listings");
    }
}

const showListing = async(req, res) => {
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
};

const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "Unauthorized");
            return res.redirect("/listings");
        }
        for (let image of listing.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
        await Listing.findByIdAndDelete(req.params.id);
        req.flash("success", "Listing deleted successfully");
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        req.flash("error", "Error deleting listing");
        res.redirect("/listings");
    }
};

const updateListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "Unauthorized");
            return res.redirect("/listings");
        }
        let roomTypes = req.body.roomTypes;

        if (!roomTypes) {
            req.flash("error", "Please select at least one room type");
            return res.redirect(`/listings/${id}/edit`);
        }
        if (!Array.isArray(roomTypes)) {
            roomTypes = [roomTypes];
        }
        if (req.body.deleteImages) {
            let deleteImages = req.body.deleteImages;
            if (!Array.isArray(deleteImages)) {
                deleteImages = [deleteImages];
            }
            for (let filename of deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }

            listing.images = listing.images.filter(
                (img) => !deleteImages.includes(img.filename)
            );
        }
        let newImages = [];
        if (req.files && req.files.length > 0) {
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
                req.files.map((file) => uploadToCloudinary(file.buffer))
            );
            newImages = uploadedImages.map((img) => ({
                url: img.secure_url,
                filename: img.public_id
            }));
        }
        const totalImages = listing.images.length + newImages.length;

        if (totalImages > 5) {
            req.flash("error", "Maximum 5 images allowed");
            return res.redirect(`/listings/${id}/edit`);
        }
        listing.images.push(...newImages);
        listing.title = req.body.title;
        listing.description = req.body.description;
        listing.propertyType = req.body.propertyType;
        listing.roomTypes = roomTypes;
        listing.location = {
            country: req.body.country,
            city: req.body.city,
            address: req.body.address,
            pincode: req.body.pincode,
            landmark: req.body.landmark
        };
        listing.price = req.body.price;
        listing.email = req.body.email;
        listing.wifi = req.body.wifi;
        listing.parking = req.body.parking;

        await listing.save();
        req.flash("success", "Listing updated successfully");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        req.flash("error", "Error updating listing");
        res.redirect("/listings");
    }
};
module.exports = {getAllListings, getNewListing, postNewListing, getEditListing, showListing, deleteListing, updateListing};






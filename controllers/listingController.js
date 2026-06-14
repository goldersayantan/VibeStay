const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const User = require("../models/user");
const {isLoggedIn} = require("../middleware/isLoggedIn");
const cloudinary = require("../config/cloudConfig");
const upload = require("../config/multer");
const axios = require("axios");

const getAllListings = async (req, res) => {
    const listings = await Listing.find({})
        .populate("owner")
        .lean();

    let wishlist = [];
    if(req.user)    {
        wishlist = req.user.wishlist?.map(id => id.toString()) || [];
    }
        
    const allListings = listings.map(listing => ({
        ...listing,
        startingPrice:
            listing.roomTypes?.length > 0
                ? Math.min(
                    ...listing.roomTypes.map(room => room.pricePerNight)
                )
                : 0
    }));

    res.render("listings/index", { allListings, wishlist });
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
        if (!roomTypes || !Array.isArray(roomTypes)) {
            req.flash("error", "Please provide room details");
            return res.redirect("/listings/new");
        }
        roomTypes = roomTypes
            .filter(room => Number(room.totalRooms) > 0)
            .map(room => ({
                roomType: room.roomType,
                totalRooms: Number(room.totalRooms),
                availableRooms: Number(room.totalRooms),
                pricePerNight: Number(room.pricePerNight)
            }));
        if(roomTypes.length === 0)  {
            req.flash("error", "Please add at least one room type");
            return res.redirect("/listings/new");
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

        const geoResponse = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: `${req.body.address}, ${req.body.city}, ${req.body.country}`,
                    format: "json",
                    limit: 1
                },
                headers:    {
                    "User-Agent": "VibeStay"
                }
            }
        );
        if(!geoResponse.data || geoResponse.data.length === 0)  {
            req.flash("error", "Unable to locate the property address.");
            return res.redirect("/listings/new");
        }
        const coordinates = [
            Number(geoResponse.data[0].lon),
            Number(geoResponse.data[0].lat)
        ]

        const amenityFields = [
            "wifi",
            "parking",
            "spa",
            "pool",
            "gym",
            "airConditioning",
            "breakfast",
            "petFriendly",
            "laundryService",
            "restaurant",
            "kitchen",
            "roomService",
            "frontDesk"
        ];
        const amenities = {};
        amenityFields.forEach((field) => {
            amenities[field] = Boolean(req.body.amenities?.[field]);
        });

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
            geometry:   {
                type: "Point",
                coordinates
            },
            email: req.body.email,
            amenities,
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
        const listing = await Listing.findById(req.params.id)
            .populate("owner")
            .populate({
                path: "reviews",
                populate:   {
                    path: "user"
                }
            });
        if(!listing)    {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        let userReview = null;
        if(req.user)    {
            userReview = listing.reviews.find(
                review => review.user._id.equals(req.user._id)
            );
        }
        res.render("listings/show", {listing, userReview});
    } catch(err)    {
        req.flash("error", "Something went wrong");
        console.log(err);
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

        if (!roomTypes || !Array.isArray(roomTypes)) {
            req.flash("error", "Please provide room details");
            return res.redirect(`/listings/${id}/edit`);
        }

        roomTypes = roomTypes
            .filter(room => Number(room.totalRooms) > 0)
            .map(room => {
                const existingRoom = listing.roomTypes.find(
                    r => r.roomType === room.roomType
                );

                return {
                    roomType: room.roomType,
                    totalRooms: Number(room.totalRooms),

                    // Preserve availability if room already exists
                    availableRooms: existingRoom
                        ? existingRoom.availableRooms
                        : Number(room.totalRooms),

                    pricePerNight: Number(room.pricePerNight)
                };
            });

        if (roomTypes.length === 0) {
            req.flash("error", "Please add at least one room type");
            return res.redirect(`/listings/${id}/edit`);
        }

        let deleteImages = req.body.deleteImages || [];
        if (!Array.isArray(deleteImages)) {
            deleteImages = [deleteImages];
        }

        if (deleteImages.length > 0) {
            await Promise.all(
                deleteImages.map((filename) =>
                    cloudinary.uploader.destroy(filename)
                )
            );

            listing.images = listing.images.filter(
                (img) => !deleteImages.includes(img.filename)
            );
        }

        const existingCount = listing.images.length;
        const newUploadCount = req.files ? req.files.length : 0;

        const totalImages = existingCount + newUploadCount;

        if (totalImages === 0) {
            req.flash("error", "Please upload at least one image");
            return res.redirect(`/listings/${id}/edit`);
        }

        if (totalImages > 5) {
            req.flash("error", "Maximum 5 images allowed");
            return res.redirect(`/listings/${id}/edit`);
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

        let locationChanged = 
            listing.location.country !== req.body.country ||
            listing.location.city !== req.body.city ||
            listing.location.address !== req.body.address;
        if(locationChanged) {
            const geoResponse = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: `${req.body.address}, ${req.body.city}, ${req.body.country}`,
                        format: "json",
                        limit: 1
                    },
                    headers:    {
                        "User-Agent": "VibeStay"
                    }
                }
            );
            if(!geoResponse.data || geoResponse.data.length === 0)  {
                req.flash("error", "Unable to locate the property address.");
                return res.redirect(`/listings/${id}/edit`);
            }
            listing.geometry = {
                type: "Point",
                coordinates:    [
                    Number(geoResponse.data[0].lon),
                    Number(geoResponse.data[0].lat)
                ]
            };
        }

        const amenityFields = [
            "wifi", 
            "parking", 
            "spa", 
            "pool",
            "gym",
            "airConditioning",
            "breakfast",
            "petFriendly",
            "laundryService",
            "restaurant",
            "kitchen",
            "bar",
            "roomService",
            "frontDesk"
        ];
        const amenities = {};
        amenityFields.forEach((field) => {
            amenities[field] = Boolean(req.body.amenities?.[field]);
        });

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
        listing.email = req.body.email;
        listing.amenities = amenities;

        await listing.save();

        req.flash("success", "Listing updated successfully");
        res.redirect(`/listings/${id}`);

    } catch (err) {
        console.error(err);
        req.flash("error", "Error updating listing");
        res.redirect("/listings");
    }
};

const chechAvailability = async(req, res) => {
    const {id} = req.params;
    const {checkIn, checkOut} = req.query;
    const listing = await Listing.findById(id);
    const roomAvailability = [];
    for(const room of listing.roomTypes)    {
        const bookings = await Booking.find({
            listing: id,
            status: "approved",
            checkIn:    {
                $lt: new Date(checkOut)
            },
            checkOut:   {
                $gt: new Date(checkIn)
            }
        });
        let occupiedRooms = 0;
        bookings.forEach(booking => {
            const bookedRoom = booking.rooms.find(
                r => r.roomTypeId.toString() === room._id.toString()
            );
            if(bookedRoom)  {
                occupiedRooms += bookedRoom.quantity;
            }
        });
        roomAvailability.push({
            roomId: room._id,
            roomType: room.roomType,
            availableRooms: room.totalRooms - occupiedRooms,
            pricePerNight: room.pricePerNight
        });
    }
    res.json(roomAvailability);
};

module.exports = {getAllListings, getNewListing, postNewListing, getEditListing, showListing, deleteListing, updateListing, chechAvailability};






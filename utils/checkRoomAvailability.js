const Listing = require("../models/listing");
const Booking = require("../models/booking");

async function getAvailableRooms(
    listingId,
    roomTypeId,
    checkIn,
    checkOut
)   {
    const listing = await Listing.findById(listingId);
    const room = listing.roomTypes.id(roomTypeId);
    const approvedBookings = await Booking.find({
        listing: listingId,
        status: "approved",
        checkIn:    {
            $lt: checkOut
        },
        checkOut:   {
            $gt: checkIn
        }
    });
    let occupied = 0;
    approvedBookings.forEach(booking => {
        booking.rooms.forEach(bookedRoom => {
            if(bookedRoom.roomTypeId.toString() === roomTypeId.toString())  {
                occupied += bookedRoom.quantity;
            }
        });
    });
    return room.totalRooms - occupied;
}

module.exports = getAvailableRooms;
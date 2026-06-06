const today = new Date().toISOString().split("T")[0];
document.getElementById("checkIn").min = today;
document.getElementById("checkOut").min = today;

const form = document.getElementById("availabilityForm");
form.addEventListener("submit", async(e) => {
    e.preventDefault();
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    const listingId = window.location.pathname.split("/").pop();
    if(checkOut <= checkIn) {
        alert("Check-Out date must be after Check-In date.");
        return;
    }
    const response = await fetch(`/listings/${listingId}/check-availability?checkIn=${checkIn}&checkOut=${checkOut}`);
    const rooms = await response.json();
    let html = "";
    let hasAvailableRoom = false;
    rooms.forEach(room => {
        const roomName = room.roomType.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        html += `
            <div class="room-card">
                <h4>${roomName}</h4>
                <p>Available: ${room.availableRooms}</p>
                <p>₹${room.pricePerNight} / night</p>
        `;
        if(room.availableRooms > 0) {
            hasAvailableRoom = true;
            html += `
                <span class="available-badge">Available</span>
            `;
        }else   {
            html += `
                <span class="sold-out">Sold Out</span>
            `;
        }
        html += `</div>`;
    });
    if(hasAvailableRoom)    {
        html += `
            <div class="booking-action">
                <a class="proceed-booking-btn" href="/bookings/new?listingId=${listingId}&checkIn=${checkIn}&checkOut=${checkOut}">
                    Proceed To Book
                </a>
            </div>
        `;
    }
    document.getElementById("availabilityResults").innerHTML = html;
});
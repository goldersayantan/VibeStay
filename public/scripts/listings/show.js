const today = new Date().toISOString().split("T")[0];
document.getElementById("checkIn").min = today;
document.getElementById("checkOut").min = today;

// Availability Checking
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
                <p>$${room.pricePerNight} / night</p>
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

// New Rating
const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating-value");
let selectedRating = 0;

function highlightStars(value)  {
    stars.forEach(star => {
        if(star.dataset.value <= value) {
            star.classList.add("active");
        }else   {
            star.classList.remove("active");
        }
    })
}

stars.forEach(star => {
    star.addEventListener("mouseover", () => {
        const value = star.dataset.value;
        highlightStars(value);
    });
    star.addEventListener("click", () => {
        selectedRating = star.dataset.value;
        ratingInput.value = selectedRating;
        highlightStars(selectedRating);
    });
    star.addEventListener("mouseout", () => {
        highlightStars(selectedRating);
    });
});

// Editting Rating
const editStars = document.querySelectorAll(".edit-star");
const editRatingInput = document.getElementById("edit-rating-value");

if (editStars.length && editRatingInput) {
    editStars.forEach(star => {
        star.addEventListener("click", () => {
            editRatingInput.value = star.dataset.value;
            editStars.forEach(s => {
                if(Number(s.dataset.value) <= Number(star.dataset.value)) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    });
}
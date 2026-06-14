console.log("map.js loaded");
console.log("coordinates:", coordinates);
console.log("L:", L);

if(coordinates && coordinates.length === 2) {
    const lng = coordinates[0];
    const lat = coordinates[1];
    const map = L.map("map").setView([lat, lng], 13);
    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
            <strong>${listingTitle}</strong>
            <br>
            ${listingAddress}    
        `)
        .openPopup();
}
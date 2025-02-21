const socket = io(); // Backend se connect ho raha hai

// **Geolocation Request**
navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User Location:", latitude, longitude); // Debugging
        map.setView([latitude, longitude], 12);
        L.marker([latitude, longitude]).addTo(map).bindPopup("You are here!").openPopup(); // Ensure marker is added
        socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
        console.error("Geolocation Error:", error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    }
);

// **Leaflet Map Initialization**
const map = L.map("map").setView([20, 78], 5); // Default India Center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Ensure Map Resizes Properly
setTimeout(() => {
    map.invalidateSize();
}, 500);

const markers = {};

// **Receiving Location from Backend**
socket.on("receive-location", (data) => {
    console.log("Received Location from Backend:", data);
});

    const { id, latitude, longitude } = data;
    if (!latitude || !longitude) return; 

    map.setView([latitude, longitude], 12);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User: ${id}`).openPopup();
    }

// **User Disconnect Event**
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
setTimeout(() => {
    map.invalidateSize();
}, 1000);
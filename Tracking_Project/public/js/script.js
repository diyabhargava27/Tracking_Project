const socket = io();

// ✅ 1. Map initialize
const map = L.map("map").setView([20, 78], 5);

// ✅ 2. Tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ✅ 3. Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

// Store markers for multiple users
const markers = {};

// ✅ 4. Live location tracking (BEST)
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords;

    console.log("User Location:", latitude, longitude);

    map.setView([latitude, longitude], 12);

    // Apna marker
    if (!markers["me"]) {
      markers["me"] = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("You are here!")
        .openPopup();
    } else {
      markers["me"].setLatLng([latitude, longitude]);
    }

    // Send to backend
    socket.emit("send-location", { latitude, longitude });
  },

  (error) => {
    console.error("Geolocation Error Code:", error.code);
    console.error("Geolocation Error Message:", error.message);

    // ✅ Fallback (important)
    const latitude = 20;
    const longitude = 78;

    map.setView([latitude, longitude], 5);

    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("Default Location (Permission Denied)")
      .openPopup();
  },

  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);

// ✅ 5. Receive other users' locations
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  if (!latitude || !longitude) return;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`User: ${id}`);
  }
});

// ✅ 6. Remove disconnected users
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

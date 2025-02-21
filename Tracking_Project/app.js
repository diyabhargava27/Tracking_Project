const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// **Set EJS as View Engine**
app.set("view engine", "ejs");

// **Static Folder Set Karo**
app.use(express.static(path.join(__dirname, "public")));

// **Routes**
app.get("/", (req, res) => {
    res.render("index"); // EJS file render karega
});

// **Socket.io Connection**
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        io.emit("user-disconnected", socket.id);
    });
});

// **Server Listen**
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
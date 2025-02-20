const express = require('express');
const app = express();
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const path = require('path');
const io = socketio(server);

app.set("view engine", "ejs");

// Correct way to serve static files
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    socket.on("send-location",function(data){//send location jo receive kiya hai backend per , 
    // vahn se receive loca bhej diya frontend per
io.emit("receive-location",{id:socket.id, ...data});
    });
    console.log("connected");
});

app.get("/", function (req, res) {
    res.render("index");
});

server.listen(8080);
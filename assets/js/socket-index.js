const socket = io(); // Connect to Socket.IO server
socket.emit("chat message", "hello");
socket.on("chat message", function (msg) {
  console.log(msg);
});

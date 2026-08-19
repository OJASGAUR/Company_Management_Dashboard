const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // User joins their own personal room (using their user ID) to receive DMs
  socket.on("register", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} registered as user ${userId}`);
    io.emit("user_status", { userId, status: "ONLINE" });
  });

  socket.on("send_message", (data) => {
    // data should contain { senderId, receiverId, content, timestamp }
    if (data.receiverId) {
      // Send DM to specific user room
      io.to(data.receiverId).emit("receive_message", data);
    }
    // Also send back to sender so they see their own message confirmed
    socket.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

// config/socket.js
let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require("socket.io");
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000", // Đúng với frontend
        credentials: true,
      }
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Thêm logic để người dùng tham gia phòng riêng
      socket.on("join_room", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
  },
};
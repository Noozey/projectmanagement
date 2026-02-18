import kanbanHandler from "./kanban.socket.js";
import messageHandler from "./message.socket.js";
import userHandler from "./user.socket.js";

export default function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    userHandler(io, socket);
    messageHandler(io, socket);
    kanbanHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

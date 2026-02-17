import { supabase } from "../database/supabaseConfig.js";

export default function messageHandler(io, socket) {
  socket.on("send_message", async (data) => {
    console.log(data);
    try {
      const senderId = socket.userId;
      const receiverId = data.receiverId;
      const text = data.text;

      if (!senderId || !receiverId || !text) return;

      const payload = {
        senderId,
        receiverId,
        text,
        createdAt: new Date(),
      };

      io.to(receiverId).emit("receive_message", payload);

      console.log("Message sent:", payload);
    } catch (err) {
      console.log("Message handler error:", err);
    }
  });
}

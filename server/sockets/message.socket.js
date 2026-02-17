import { supabase } from "../database/supabaseConfig.js";

export default function messageHandler(io, socket) {
  socket.on("send_message", async (data) => {
    try {
      const senderId = socket.userId;
      const { receiverId, text } = data;

      if (!senderId || !receiverId || !text) return;

      // Save to Supabase
      const { data: saved, error } = await supabase
        .from("messages")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          text,
        })
        .select()
        .single();

      if (error) throw error;

      const payload = {
        id: saved.id,
        senderId: saved.sender_id,
        receiverId: saved.receiver_id,
        text: saved.text,
        createdAt: saved.created_at,
      };

      // Emit to receiver and sender
      io.to(receiverId).emit("receive_message", payload);
    } catch (err) {
      console.log("Message handler error:", err);
    }
  });
}

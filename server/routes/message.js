import express from "express";
import { supabase } from "../database/supabaseConfig.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const messageRouter = express.Router();

messageRouter.get("/:userId", authMiddleware, async (req, res) => {
  const currentUserId = req.user.uid;
  const otherUserId = req.params.userId;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),` +
        `and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
    )
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const messages = data.map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    text: m.text,
    createdAt: m.created_at,
  }));

  res.json({ messages });
});

export { messageRouter };

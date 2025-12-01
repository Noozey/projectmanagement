import express from "express";
import { supabase } from "../database/supabaseConfig.js";

const userRouter = express.Router();

userRouter.post("/profile", async (req, res) => {
  const { email } = req.body;

  const { data: user, err } = await supabase
    .from("registration")
    .select("*")
    .ilike("email", `%${email}%`);

  if (err) {
    return res.status(500).json({ message: "Database error", err });
  }
  return res.status(200).json({ message: user });
});

export { userRouter };

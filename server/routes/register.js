import express from "express";
import { supabase } from "../database/supabaseConfig.js";
import bcrypt from "bcrypt";

const registerRouter = express.Router();

registerRouter.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const { data: existingUser, error: selectError } = await supabase
    .from("registration")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  if (selectError && selectError.code !== "PGRST116") {
    return res
      .status(500)
      .json({ message: "Database error", error: selectError });
  }

  const { data, error } = await supabase
    .from("registration")
    .insert([{ name, email, password: hashedPassword }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ message: "Error creating account", error });
  }

  return res
    .status(200)
    .json({ message: "Account created successfully", user: data });
});

export { registerRouter };

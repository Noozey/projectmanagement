import express from "express";
import { supabase } from "../database/supabaseConfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase
    .from("registration")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ message: "Database error", error });
  }
  if (!data) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const hashedPassword = data.password;

  const passwordMatch = await bcrypt.compare(password, hashedPassword);

  const token = jwt.sign(
    {
      fullName: data.name,
      email: data.email,
      avatar: data.avatar,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  passwordMatch
    ? res.status(200).json({ message: "successful", token: token })
    : res.status(401).json({ message: "Invalid email or password" });

  return;
});

export { loginRouter };

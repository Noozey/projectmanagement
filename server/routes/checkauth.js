import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const checkAuthrouter = express.Router();

checkAuthrouter.get("/", authMiddleware, (req, res) => {
  return res.status(200).json({
    valid: true,
    user: req.user,
  });
});

export { checkAuthrouter };

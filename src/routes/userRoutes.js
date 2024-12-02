import express from "express";
import User from "../models/Customer.js";

const router = express.Router();

// POST route to save user data
router.post("/", async (req, res) => {
  try {
    const { name, email, gender, hobbies, message } = req.body;
    const user = new User({ name, email, gender, hobbies, message });
    await user.save();
    res.status(201).json({ message: "User data saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

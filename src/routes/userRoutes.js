import express from "express";
import User from "../models/Customer.js";

const router = express.Router();

// POST route to save user data
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      //phoneNumber,
      services,
      newOrRebuild,
      websiteNeeds,
      budget,
    } = req.body;

    // Input validation (basic check)
    // if (!name || !email || !phoneNumber) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Name, email, and phone number are required fields.",
    //   });
    // }

    // Create a new user instance
    const user = new User({
      name,
      email,
      company,
      //phoneNumber,
      services,
      newOrRebuild,
      websiteNeeds,
      budget,
    });

    // Save to database
    const savedUser = await user.save();

    // Success response
    res.status(201).json({
      success: true,
      message: "User data saved successfully.",
      data: savedUser,
    });
  } catch (err) {
    console.error("🔥 Error saving user data:", err.message); // Log the error
    res.status(500).json({
      success: false,
      message: "Failed to save user data. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    // phoneNumber: {
    //   type: String, // Store as a string to accommodate formats like "+1234567890"
    //   //required: true, // Optional: make it required
    //   match: [
    //     /^\+?[1-9]\d{1,14}$/, // Regex for E.164 international phone numbers
    //     "Please enter a valid phone number.",
    //   ],
    //   trim: true, // Removes extra whitespace
    // },
    services: {
      type: [String], // Array of strings
      default: [],
      enum: [
        "Web Design / UI/UX Design",
        "Webflow Development",
        "Brand/website strategy",
        "Marketing Services",
        "Bit of everything",
      ], // Adjust options as needed
    },
    newOrRebuild: {
      type: String,
      required: true,
      enum: [
        "Brand new website",
        "Rebuild of existing website",
        "Updates to existing website",
      ],
    },
    // pages: {
    //   type: String,
    //   trim: true,
    // },
    websiteNeeds: {
      type: String, // Array of strings
      required: true,
      enum: ["Blog", "Ecommerce", "Memberships", "Portfolio", "Not sure yet"], // Adjust options as needed
    },
    // details: {
    //   type: String,
    //   trim: true,
    //   maxlength: 1000,
    // },
    budget: {
      type: [String], // Array of strings
      required: true,
      enum: [
        "Less than 20,000 (small project)",
        "Upto 50,000 (medium project)",
        "Over 50,000 (large project)",
      ], // Adjust options as needed
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

const Customer = mongoose.model("User", userSchema);

export default Customer;

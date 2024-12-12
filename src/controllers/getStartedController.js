import GetStarted from "../models/getStartedmodel.js";

// Submit form data
export const submitForm = async (req, res) => {
  try {
    const formData = req.body;
    const newEntry = new GetStarted(formData);
    await newEntry.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ error: "An error occurred while saving the form" });
  }
};

// Fetch all form submissions
export const getFormEntries = async (req, res) => {
  try {
    const entries = await GetStarted.find();
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "An error occurred while retrieving the data" });
  }
};

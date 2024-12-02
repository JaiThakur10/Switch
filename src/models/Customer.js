import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  hobbies: { type: [String], required: true },
  message: { type: String, required: true },
});

const Customer = mongoose.model("User", userSchema);

export default Customer;

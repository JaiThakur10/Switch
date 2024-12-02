import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./db/db.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables
dotenv.config({
  path: "./env",
});

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*
import express from "express"
const app = express()

;( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI} /${DB_NAME}`)
       app.on("error", (error) =>{
        console.log("Error:",error);
        throw error
       })

       app.listen(process.env.PORT, () =>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.error("ERROR:",error)
        throw err
    }
})() */

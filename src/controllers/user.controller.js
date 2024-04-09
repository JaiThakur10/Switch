import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res) =>{
   //get user details from frontend
   //validation - not empty
   //check if user already exist: username,email
   //check for images, check for avtar
   //upload them to cloudinary,avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return res

   const {fullname, email, username, password } =req.body
   //console.log("email:", email);

   if(
      [fullname,email,username,password].some((field)=> field?.trim() === "" )
   ){
      throw new ApiError(400,"Please enter all the fields")
   }

   const existedUser = await User.findOne({ $or: [{ email },{ username }] })
   if(existedUser){
      throw new ApiError(409,"This user already exist")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght > 0){
      coverImageLocalPath = req.files.coverImage[0].path
   }

   if(!avatarLocalPath){
      throw  new ApiError(400,"Please upload a valid avatar image and avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const  coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
      throw new ApiError(400,"Please upload an avatar image")
   }

   const user = await User.create({
      fullname, 
      email, 
      username: username.toLowerCase(), 
      password, 
      avatar: avatar.url, 
      coverImage:coverImage?.url || "",
   })

   const createdUser = await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
      throw new ApiError(500,"Something went wrong while creating user")
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,"User created successfully!")
   )





})


export {registerUser}
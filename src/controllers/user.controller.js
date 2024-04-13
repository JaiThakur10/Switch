import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshTokens = async(userId) =>{
   try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({ validateBeforeSave: false })

       return {accessToken, refreshToken}


   } catch (error) {
       throw new ApiError(500, "Something went wrong while generating referesh and access token")
   }
}


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

const loginUser = asyncHandler(async (req, res) =>{
   // req body -> data
   // username or email
   //find the user
   //password check
   //access and referesh token
   //send cookie

   const {email, username, password} = req.body
   console.log(email);

   if (!username && !email) {
       throw new ApiError(400, "username or email is required")
   }
   
   // Here is an alternative of above code based on logic discussed in video:
   // if (!(username || email)) {
   //     throw new ApiError(400, "username or email is required")
       
   // }

   const user = await User.findOne({
       $or: [{username}, {email}]
   })

   if (!user) {
       throw new ApiError(404, "User does not exist")
   }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
   throw new ApiError(401, "Invalid user credentials")
   }

  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
       httpOnly: true,
       secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
       new ApiResponse(
           200, 
           {
               user: loggedInUser, accessToken, refreshToken
           },
           "User logged In Successfully"
       )
   )

})

const logoutUser = asyncHandler(async(req,res) => {
   //
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )

   const options = {
      httpOnly: true,
      secure: true
   }
   
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200, {}, "User logged out"))
})

const refereshAccessToken = asyncHandler(async(req,res) => {
   const incomingRefreshToken =  req.cookies.refereshToken || req.body.refereshToken

   if(!incomingRefreshToken){
      throw new ApiError(401,"unauthorized request")
   }

   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
      
      const user = await User.findById(decodedToken?._id)
      if(!user){
         throw new ApiError(401,"invalid refresh token")
      }
   
      if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refreshtoken is expired or used")
      }
   
   
      const options = {
         httpOnly: true,
         secure:true
      }
   
      const {accessToken,newrefreshToken}=await generateAccessAndRefereshTokens(user._id)
   
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrefreshToken,options)
      .json(
         new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "access Tokens refresed"
         )
      )
   } catch (error) {
      throw new ApiError(401,error?.message || "Invalid refresh token")
   }

})

const changeCurrentPassword = asyncHandler(async(req,res) => {
   const {oldPassword,newPassword}=req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(400,"invalid old pass")
   }

   user.password = newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password changed sussefully"))
   
})



const getCurrentUser = asyncHandler(async(req,res) =>{
   return res
   .status(200)
   .json(200,req.user,"current user fetched successfully")
})

const updateAccounDetails = asyncHandler(async(req,res) =>{
   const {fullname,email} =req.body

   if(!fullname || !email){
      throw new ApiError(400,"All fields are required")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            fullname,
            email
         }
      },
      {new:true}
   ).select("-password")

   return res
   .status(200)
   .json( new ApiResponse(200,user,"Account Details updated succefully!"))
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
   const avatarLocalPath = req.file?.path
   

   if(!avatarLocalPath){
      throw new ApiError(400,"avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400,"Error while uploading on avatar")
   }

   const user =  await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar: avatar.url
         }
      },
      {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200,user,"Avatar updated succefully")
   )


})

const updateUserCoverAvatar = asyncHandler(async(req,res) =>{
   const coverImageLocalPath = req.file?.path
   

   if(!coverImageLocalPath){
      throw new ApiError(400,"Cover image file is missing")
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url){
      throw new ApiError(400,"Error while uploading on cover Image")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            coverImage: coverImage.url
         }
      },
      {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200,user,"Cover image updated succefully")
   )


})


export {
   registerUser,
   loginUser,
   logoutUser,
   refereshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccounDetails,
   updateUserAvatar,
   updateUserCoverAvatar,
}
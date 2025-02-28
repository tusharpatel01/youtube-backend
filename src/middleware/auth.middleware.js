import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";

 export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
     const token =req.cookies?.accessToken||req.headers("authorization")?.replace("Bearer","").trim();
     if(!token){
         throw new ApiError(401, "unauthorized request");
     }
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKENS_SECRET);
     const user=await User.findById(decodedToken?._id).select("-password -refreshTokens");
     if(!user){
         throw new ApiError(404,"user not found");
     }
     req.user=user;
     next();
   } catch (error) {
       throw new ApiError(401,"unauthorized request and tokens");
    
   }


})
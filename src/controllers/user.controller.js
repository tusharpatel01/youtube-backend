import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User
      .findById(userId)
    const accessTokens = user.generateAccessTokens();
    const refreshTokens = user.generateRefreshTokens();

    user.refreshTokens = refreshTokens;
    await user.save({ validateBeforeSave: false });
    return { accessTokens, refreshTokens };

  } catch (error) {
    console.log(error);
    throw new ApiError(500, "error generating tokens");

  }

}
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, userName, email, password } = req.body;
  console.log(userName);

  if (
    [fullName, userName, email, password].some(
      (fields) => fields?.trim() === "")
  ) {
    throw new ApiError(400, "please fill all fields");
  }
  //check if user already exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with userName or email already exists");
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  //   console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError("avatar is required", 400);
  }
  //await is used to wait for the function to complete
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  //   console.log(avatar);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "error uploading avatar");
  }
  console.log(userName);


  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password" - "refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, " error while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(400, "please provide username or email");
  }
  if (!password) {
    throw new ApiError(400, "please provide password");
  }
  const user = await User.findOne({ $or: [{ userName }, { email }] })


  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "password is incorrect");
  }

  const { accessTokens, refreshTokens } = await generateAccessAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  const options = {
    httpOnly: true,
    secure: true,
  }
  res.status(200)
    .cookie("refreshToken", refreshTokens, options)
    .cookie("accessToken", accessTokens, options)
    .json(new ApiResponse(200, { user: loggedInUser, refreshTokens, accessTokens }, "user logged in successfully"));



})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshTokens: undefined
    },



  });
  const options = {
    secure: true,
    httpOnly: true,
  };
  return res
    .status(200)
    .clearCookie("refreshTokens", options)
    .clearCookie("accessTokens", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));




});

const refreshAccessTokens = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken
      , process.env.REFRESH_TOKENS_SECRET)
    const user = User.findById(decodedToken?._id)
    if (!user) {
      throw ApiError(401, "invalid refresh token");
    }
    if (incomingRefreshToken !== user.refreshTokens) {
      throw ApiError(401, "token expires or invalid");
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessTokens, newRefreshTokens } = await generateAccessAndRefreshTokens(user._id);

    return response.
      status(200)
      .cookie("refreshToken", newRefreshTokens, options)
      .cookie("accessToken", accessTokens, options)
      .json(new ApiResponse(200, { accessTokens, refreshTokens: newRefreshTokens }, "tokens refreshed successfully"));

  } catch (error) {
    throw new ApiError(401, "invalid refresh token");

  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "password is incorrect");
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));


})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user found successfully"));

})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "please provide first name and email");

  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      fullName,
      email
    }
  }, { new: true }).select("-password ");
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "error uploading ,avatar file is missing");
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar.url
    }

  }, {
    new: true
  }

  ).select("-password");
  return
  res.
    status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image is required");
  }
  const updateUserCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!updateUserCoverImage.url) {
    throw new ApiError(400, "error uploading cover image file is missing");
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      coverImage: updateUserCoverImage.url
    }
  }, { new: true }).select("-password");
  return res.
    status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"))

})



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessTokens,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,



};

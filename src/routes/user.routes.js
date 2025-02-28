import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";
import { loginUser, logoutUser } from "../controllers/user.controller.js";
// import verifyJWT from "../middleware/auth.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {refreshAccessTokens} from "../controllers/user.controller.js";
const router = Router();
router.route("/register").post(
  upload.fields([
      {
          name: "avatar",
          maxCount: 1
      }, 
      {
          name: "coverImage",
          maxCount: 1
      }
  ]),
  registerUser
  );
  router.route("/login").post(loginUser);       
  router.route("/logout").post( verifyJWT , logoutUser);
  router.route("/refresh-token").post(refreshAccessTokens);

export default router;

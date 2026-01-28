import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getUserData,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/send-verify-otp").post(verifyJWT, sendVerifyOtp);
router.route("/verify-account").post(verifyJWT, verifyEmail);
router.route("/reset-password").post(resetPassword);
router.route("/send-reset-otp").post(sendResetOtp);

router.route("/is-auth").get(verifyJWT, isAuthenticated);
router.route("/data").get(verifyJWT, getUserData);
export default router;

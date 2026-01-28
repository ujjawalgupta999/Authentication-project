import { User } from "../models/user.model.js";
import transporter from "../mailConfig/mail.config.js";
import dotenv from "dotenv";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../mailConfig/emailTemplate.js";

dotenv.config({
  path: "./.env",
});

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//register user
const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return res.json({
      success: false,
      message: "User with email or username already exists",
    });
  }

  const user = await User.create({
    email,
    password,
    username: username.toLowerCase(),
  });

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    return res.json({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }
  const options = {
    httpOnly: true,
    secure: false, // true in production (HTTPS required)
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  };

  // welcome email logic
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "welcome to greatstack",
    text: `Welcome to greatstack website. Your account has been created with email id ${email}`,
  };
  await transporter.sendMail(mailOptions);

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ success: true, message: "User registered Successfully" });
};

//logic for sending verify otp
const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isVerified) {
      return res.json({ success: false, message: "AccountAlready verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailoption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Account Verification OTP`,

      html: EMAIL_VERIFY_TEMPLATE.repeat("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
    };

    await transporter.sendMail(mailoption);

    return res.json({
      success: true,
      message: "verification otp is sent on email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//verify email
const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user._id;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "otp is expired" });
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiredAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: "email verified successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//is authenticated
const isAuthenticated = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "user email is not verified yet !",
      });
    }
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//get user data
const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      userData: {
        name: user.username,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//send reset otp

const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "email is requried" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user not exit" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;

    await user.save();
    const mailoption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Password reset OTP`,

      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
    };
    await transporter.sendMail(mailoption);

    return res.json({
      success: true,
      message: "password reset otp is sent on the user email ",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//reset password
const resetPassword = async (req, res) => {
  const { otp, newPassword, email } = req.body;
  if (!otp || !newPassword || !email) {
    return res.json({ success: false, message: "Credential are requried" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user is not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      res.json({ success: false, message: "Invalied OTP" });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.password = newPassword;

    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;
    await user.save({ validateBeforeSave: false });
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.json({ success: false, message: "Invalid user credentials" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedInUser) {
    return res.json({
      success: false,
      message: "Something went wrong while logging in ",
    });
  }

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ success: true, message: "User logged in successfully" });
};

//logout user
const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "User logged out successfully" });
};

export {
  registerUser,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  getUserData,
  sendResetOtp,
  resetPassword,
  loginUser,
  logoutUser,
};

import User from "../models/user.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: {
          name: !name,
          email: !email,
          password: !password,
        },
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message: "Password is not strong enough",
        requirements: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const userToReturn = { ...savedUser._doc };
    delete userToReturn.password;
    delete userToReturn.refreshToken;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userToReturn,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
        expected: user.password,
        actual: password,
        isMatch: isMatch,
      });
    }
    // expiry should be 2 hours, but for the sakes of testing it will temporarily be 5 days
    const accessToken = jwt.sign(
      { email: user.email, userId: user._id },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    const refreshToken = jwt.sign(
      { email: user.email, userId: user._id },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful !",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    if (req.user?.userId) {
      await User.findByIdAndUpdate(req.user.userId, {
        refreshToken: null,
      });
    }

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "No access token" });

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

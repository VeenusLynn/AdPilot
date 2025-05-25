import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const login = async (req, res) => {
  try {
    dotenv.config();
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

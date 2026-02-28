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

    const { name, email, password, role } = req.body;

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

    // Only accept known roles; any unknown value falls back to the model default ("viewer")
    const allowedRoles = ["admin", "viewer"];
    const assignedRole = allowedRoles.includes(role) ? role : "viewer";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
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
      });
    }

    const accessToken = jwt.sign(
      { email: user.email, userId: user._id, role: user.role },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "2h",
      },
    );

    const refreshToken = jwt.sign(
      { email: user.email, userId: user._id, role: user.role },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
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
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

/**
 * updateProfile — PATCH /api/auth/profile
 *
 * Allows the authenticated user to update their own display name.
 * Role and password are explicitly excluded — role cannot be self-assigned,
 * and password changes will be handled by a dedicated reset flow.
 *
 * Authorization: verifyToken middleware must run before this handler.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }
      user.name = name.trim();
    }

    const updated = await user.save();
    console.log(`[Profile] User ${userId} updated their profile`);

    const userToReturn = updated.toObject();
    delete userToReturn.password;
    delete userToReturn.refreshToken;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userToReturn,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * uploadProfileImage — POST /api/auth/profile/image
 *
 * Receives a single image file (already parsed by uploadProfile multer
 * middleware), stores the relative path in the user document, and returns
 * the updated user object.
 *
 * Authorization: verifyToken must run before this handler.
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const userId = req.user.userId;
    const imagePath = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true, select: "-password -refreshToken" },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(
      `[Profile] User ${userId} uploaded a new profile image: ${imagePath}`,
    );

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Upload failed", error: error.message });
  }
};

/**
 * changePassword — POST /api/auth/change-password
 *
 * Lets the authenticated user change their password.
 * Steps:
 *  1. Verify currentPassword matches the stored hash.
 *  2. Reject if newPassword === currentPassword (no-op change).
 *  3. Validate newPassword with the same strong-password rules used at registration.
 *  4. Hash and persist the new password.
 *
 * Authorization: verifyToken must run before this handler.
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both currentPassword and newPassword are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Reject identical passwords
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    // Validate strength — same rules as registration
    const isStrong = validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrong) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and symbol",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`[Security] User ${userId} changed their password`);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

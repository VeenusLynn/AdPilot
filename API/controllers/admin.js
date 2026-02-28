import User from "../models/user.js";
import bcrypt from "bcrypt";

/**
 * GET /api/admin/users
 * Returns all users, excluding sensitive fields.
 * Requires: verifyToken + requireRole("admin")
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -refreshToken");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/**
 * PUT /api/admin/users/:id
 * Update a user's name, email, role, and optionally password.
 *
 * Security rules:
 *  - Admin's own role can never be downgraded via this endpoint.
 *  - Changing role OR password requires the acting admin to supply their
 *    own current password (adminPassword) for re-verification.
 *
 * Requires: verifyToken + requireRole("admin")
 */
export const updateUser = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id: targetId } = req.params;
    const { name, email, role, newPassword, adminPassword } = req.body;

    const sensitiveChange = role !== undefined || newPassword;

    // Re-verify admin password if sensitive change requested
    if (sensitiveChange) {
      if (!adminPassword) {
        return res.status(400).json({
          success: false,
          message: "Admin password is required to change role or password",
        });
      }

      const admin = await User.findById(adminId);
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found" });
      }

      const isMatch = await bcrypt.compare(adminPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Admin password verification failed",
        });
      }
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Block admin from removing their own admin role
    if (targetId === adminId && role !== undefined && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot remove your own admin role",
      });
    }

    if (name !== undefined) target.name = name.trim();
    if (email !== undefined) target.email = email.trim().toLowerCase();
    if (role !== undefined) target.role = role;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      target.password = await bcrypt.hash(newPassword, salt);
    }

    const updated = await target.save();

    console.log(
      `[Admin] User ${adminId} updated user ${targetId} — fields: ${[
        name && "name",
        email && "email",
        role && "role",
        newPassword && "password",
      ]
        .filter(Boolean)
        .join(", ")}`,
    );

    const userToReturn = updated.toObject();
    delete userToReturn.password;
    delete userToReturn.refreshToken;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userToReturn,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already in use" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

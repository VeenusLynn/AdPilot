import React from "react";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material";

/**
 * UserAvatar — single source of truth for user avatar rendering.
 *
 * Reads user state directly from Redux so it re-renders automatically
 * whenever the profile image is updated (no prop-drilling needed for src).
 *
 * Falls back gracefully:
 *   1. profileImage from MongoDB → served as a static asset
 *   2. First letter of user's name as MUI Avatar initials
 *   3. Generic "U" if name is also missing
 *
 * If the image URL fails to load (network error, deleted file), the
 * onError handler clears the src so MUI falls back to the initials color.
 *
 * @param {number}  size      - width & height in px (default 40)
 * @param {object}  sx        - additional MUI sx props
 */
const UserAvatar = ({ size = 40, sx = {} }) => {
  const user = useSelector((state) => state.user.data);
  const baseUrl = import.meta.env.VITE_BASE_URL || "";

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const imageSrc = user?.profileImage ? `${baseUrl}${user.profileImage}` : null;

  return (
    <Avatar
      src={imageSrc || undefined}
      alt={user?.name || "User"}
      onError={(e) => {
        // If the image fails to load, remove src so initials show instead
        e.currentTarget.src = "";
      }}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        backgroundColor: "#475BE8", // primary brand color — consistent with theme
        color: "#fff",
        ...sx,
      }}
    >
      {!imageSrc && initial}
    </Avatar>
  );
};

export default UserAvatar;

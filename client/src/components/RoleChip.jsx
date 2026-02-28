import React from "react";
import { Chip, useTheme } from "@mui/material";

/**
 * RoleChip — displays a user's role as a themed badge.
 *
 * Colors are derived from the active MUI theme tokens so the chip
 * automatically adapts when the user toggles dark / light mode.
 *
 * Dark mode:
 *   Admin  → blue-tinted background #1E2A3A, blue text, blue border
 *   Viewer → muted background,  secondary text, divider border
 *
 * Light mode:
 *   Admin  → light blue background, primary-dark text, primary border
 *   Viewer → light grey background, secondary text, divider border
 *
 * @param {"admin"|"viewer"} role
 * @param {"small"|"medium"} size  (default "small")
 */
const RoleChip = ({ role, size = "small" }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isAdmin = role === "admin";

  const styles = isAdmin
    ? {
        backgroundColor: isDark ? "#1E2A3A" : "#EEF2FF",
        color: isDark ? "#60A5FA" : theme.palette.primary.dark || "#1a2991",
        borderColor: isDark ? "#3B82F6" : theme.palette.primary.main,
      }
    : {
        backgroundColor: isDark
          ? theme.palette.background.components
          : theme.palette.grey[500] + "33", // 20% opacity grey
        color: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
      };

  return (
    <Chip
      label={isAdmin ? "Admin" : "Viewer"}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: "11px",
        letterSpacing: "0.05em",
        textTransform: "capitalize",
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: "8px",
        px: 0.25,
        transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
      }}
    />
  );
};

export default RoleChip;

import React, { useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import RoleChip from "./RoleChip"; // re-use the Status chip pattern

// ── Initials placeholder ────────────────────────────────────────────────────

const CampaignInitials = ({ name, size = 120 }) => {
  const theme = useTheme();
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : "?";

  return (
    <Box
      sx={{
        width: "100%",
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.dark || "#1a2991"} 0%, ${theme.palette.primary.main} 100%)`,
        borderRadius: "12px 12px 0 0",
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: size * 0.28,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "0.05em",
          userSelect: "none",
        }}
      >
        {initials}
      </Typography>
    </Box>
  );
};

// ── Status chip (reuses the same design language as RoleChip) ───────────────

const StatusBadge = ({ active }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const styles = active
    ? {
        bg: isDark ? "#1B2E2B" : "#ECFDF3",
        color: isDark ? "#86efac" : "#027A48",
        border: isDark ? "#4ade80" : "#6ee7b7",
      }
    : {
        bg: isDark ? "#2E1C1B" : "#FEF3F2",
        color: isDark ? "#fca5a5" : "#B42318",
        border: isDark ? "#f87171" : "#fca5a5",
      };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        px: 1,
        py: 0.25,
        borderRadius: "20px",
        border: `1px solid ${styles.border}`,
        backgroundColor: styles.bg,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: styles.color,
        }}
      />
      <Typography
        sx={{ fontSize: "11px", fontWeight: 600, color: styles.color }}
      >
        {active ? "Active" : "Inactive"}
      </Typography>
    </Box>
  );
};

// ── CampaignCard ────────────────────────────────────────────────────────────

/**
 * CampaignCard — displays a single ad campaign as a card.
 *
 * Image fallback strategy:
 *  1. If ad.imageUrl exists → render <img> with onError handler
 *  2. onError fires → state flips imgError=true → CampaignInitials renders
 *  3. If no imageUrl at all → CampaignInitials renders immediately
 *
 * @param {{ ad: object }} props
 */
const CampaignCard = ({ ad }) => {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL || "";

  const showImage = ad.imageUrl && !imgError;
  const imageSrc = ad.imageUrl?.startsWith("http")
    ? ad.imageUrl
    : `${baseUrl}${ad.imageUrl}`;

  const createdAt = ad.createdAt
    ? new Date(ad.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.components,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: theme.shadows[1],
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {/* Image or initials */}
      {showImage ? (
        <Box
          component="img"
          src={imageSrc}
          alt={ad.name}
          onError={() => setImgError(true)}
          sx={{
            width: "100%",
            height: 120,
            objectFit: "cover",
            borderRadius: "12px 12px 0 0",
            display: "block",
          }}
        />
      ) : (
        <CampaignInitials name={ad.name} size={120} />
      )}

      {/* Card body */}
      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        {/* Name */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={ad.name}
        >
          {ad.name}
        </Typography>

        {/* Status + size */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <StatusBadge active={ad.active} />
          <Typography
            sx={{
              fontSize: "11px",
              color: theme.palette.text.secondary,
              fontFamily: "monospace",
            }}
          >
            {ad.size?.width}×{ad.size?.height}
          </Typography>
        </Box>

        {/* Created date */}
        <Typography
          sx={{
            fontSize: "11px",
            color: theme.palette.text.secondary,
            mt: "auto",
            pt: 0.5,
          }}
        >
          Added {createdAt}
        </Typography>
      </Box>
    </Box>
  );
};

export default CampaignCard;

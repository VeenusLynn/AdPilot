import React, { useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchAds } from "../../state/adSlice";
import CampaignCard from "../../components/CampaignCard";
import { BarChartOutlined } from "@mui/icons-material";

// ── Stat tile ──────────────────────────────────────────────────────────────

const StatTile = ({ label, value, accent }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.components,
        borderRadius: "14px",
        px: 3,
        py: 2.5,
        boxShadow: theme.shadows[1],
        borderLeft: `4px solid ${accent}`,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: theme.palette.text.secondary,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "32px",
          fontWeight: 800,
          color: accent,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

// ── Coming Soon analytics card ─────────────────────────────────────────────

const AnalyticsPlaceholder = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.components,
        borderRadius: "14px",
        border: `1.5px dashed ${theme.palette.divider}`,
        height: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        boxShadow: "none",
      }}
    >
      <BarChartOutlined
        sx={{
          fontSize: 48,
          color: isDark ? "#374151" : "#D1D5DB",
        }}
      />
      <Typography
        sx={{
          fontSize: "15px",
          fontWeight: 700,
          color: theme.palette.text.secondary,
        }}
      >
        Campaign Analytics
      </Typography>
      <Typography
        sx={{
          fontSize: "12px",
          color: theme.palette.text.secondary,
          opacity: 0.7,
        }}
      >
        Charts and performance data — coming soon
      </Typography>
    </Box>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────

const EmptyState = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        color: theme.palette.text.secondary,
      }}
    >
      <Typography sx={{ fontSize: "14px" }}>No campaigns yet.</Typography>
      <Typography sx={{ fontSize: "12px", opacity: 0.6 }}>
        Create your first campaign to see it here.
      </Typography>
    </Box>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { data: ads, loading, error } = useSelector((state) => state.ads);
  const user = useSelector((state) => state.user.data);

  useEffect(() => {
    dispatch(fetchAds());
  }, [dispatch]);

  // Sort by createdAt descending, take top 8 for "Recently Added"
  const recentAds = useMemo(
    () =>
      [...ads]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [ads],
  );

  const activeCount = ads.filter((ad) => ad.active).length;
  const inactiveCount = ads.length - activeCount;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Box p={{ xs: 3, md: 5 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800} mb={0.25}>
          {greeting()}
          {user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening with your campaigns today.
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box py={4}>
          <Typography color="error">
            Failed to load campaigns: {error}
          </Typography>
        </Box>
      ) : (
        <>
          {/* ── Stat tiles ── */}
          <Grid container spacing={2.5} mb={5}>
            <Grid item xs={12} sm={4}>
              <StatTile
                label="Total Campaigns"
                value={ads.length}
                accent={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatTile
                label="Active"
                value={activeCount}
                accent={theme.palette.common.green}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatTile
                label="Inactive"
                value={inactiveCount}
                accent={theme.palette.common.red}
              />
            </Grid>
          </Grid>

          {/* ── Recently Added ── */}
          <Box mb={5}>
            <Box
              display="flex"
              alignItems="baseline"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h5" fontWeight={700}>
                Recently Added
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {ads.length} total
              </Typography>
            </Box>

            {recentAds.length === 0 ? (
              <EmptyState />
            ) : (
              <Grid container spacing={2}>
                {recentAds.map((ad) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={ad._id}>
                    <CampaignCard ad={ad} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* ── Campaign Analytics (placeholder) ── */}
          <Box mb={2}>
            <Typography variant="h5" fontWeight={700} mb={2}>
              Campaign Analytics
            </Typography>
            <AnalyticsPlaceholder />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;

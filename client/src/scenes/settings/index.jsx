import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  AccountCircleOutlined,
  LockOutlined,
  NotificationsNoneOutlined,
  WarningAmberOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import RoleChip from "../../components/RoleChip";
import ChangePasswordForm from "./ChangePasswordForm";

// ── Reusable section container ─────────────────────────────────────────────

const Section = ({ icon: Icon, title, children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.components,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: theme.shadows[1],
        mb: 3,
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Icon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
        <Typography sx={{ fontWeight: 700, fontSize: "15px" }}>
          {title}
        </Typography>
      </Box>

      {/* Section body */}
      <Box sx={{ px: 3, py: 2.5 }}>{children}</Box>
    </Box>
  );
};

// ── Read-only info row ─────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.25,
      }}
    >
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: theme.palette.text.secondary,
          width: 130,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>
        {value ?? "—"}
      </Box>
    </Box>
  );
};

// ── Coming-soon toggle ─────────────────────────────────────────────────────

const ComingSoonToggle = ({ label }) => (
  <Tooltip title="Coming soon" placement="left" arrow>
    <Box>
      <FormControlLabel
        control={<Switch disabled size="small" />}
        label={
          <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
            {label}
          </Typography>
        }
        labelPlacement="start"
        sx={{
          width: "100%",
          justifyContent: "space-between",
          ml: 0,
          py: 0.75,
          opacity: 0.6,
        }}
      />
    </Box>
  </Tooltip>
);

// ── Settings page ──────────────────────────────────────────────────────────

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.data);

  const formattedCreated = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <Box p={{ xs: 3, md: 1 }} maxWidth={700} mx="auto">
      {/* Page title */}
      <Typography variant="h3" fontWeight={800} mb={2}>
        Settings
      </Typography>

      {/* ── Profile ── */}
      <Section icon={AccountCircleOutlined} title="Profile">
        <Typography variant="body2" color="text.secondary" mb={2}>
          Manage your display name and profile picture from your Profile page.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          endIcon={<ChevronRightOutlined />}
          onClick={() => navigate("/profile")}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Go to Profile
        </Button>
      </Section>

      {/* ── Security ── */}
      <Section icon={LockOutlined} title="Security">
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            mb: 2,
            color: theme.palette.text.primary,
          }}
        >
          Change password
        </Typography>
        <ChangePasswordForm />
      </Section>

      {/* ── Notification preferences ── */}
      <Section
        icon={NotificationsNoneOutlined}
        title="Notification Preferences"
      >
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Notification settings are coming soon.
        </Typography>
        <ComingSoonToggle label="Email notifications" />
        <Divider />
        <ComingSoonToggle label="Budget alerts" />
        <Divider />
        <ComingSoonToggle label="Weekly performance summary" />
      </Section>

      {/* ── Account info ── */}
      <Section icon={AccountCircleOutlined} title="Account Information">
        <InfoRow label="Email" value={user?.email} />
        <Divider />
        <InfoRow
          label="Role"
          value={user?.role ? <RoleChip role={user.role} /> : "—"}
        />
        <Divider />
        <InfoRow label="Member since" value={formattedCreated} />
      </Section>

      {/* ── Danger Zone ── */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.components,
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: theme.shadows[1],
          border: `1px solid ${
            theme.palette.mode === "dark" ? "#3B1C1C" : "#FECACA"
          }`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 3,
            py: 2,
            borderBottom: `1px solid ${
              theme.palette.mode === "dark" ? "#3B1C1C" : "#FECACA"
            }`,
          }}
        >
          <WarningAmberOutlined
            sx={{ fontSize: 20, color: theme.palette.common.red }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "15px",
              color: theme.palette.common.red,
            }}
          >
            Danger Zone
          </Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                Delete Account
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Permanently remove your account and all associated data.
              </Typography>
            </Box>
            <Tooltip title="Coming soon" placement="left" arrow>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: theme.palette.common.red,
                    color: theme.palette.common.red,
                    whiteSpace: "nowrap",
                    "&.Mui-disabled": {
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.secondary,
                    },
                  }}
                >
                  Delete Account
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;

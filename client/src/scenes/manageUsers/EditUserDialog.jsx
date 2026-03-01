import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

/**
 * EditUserDialog — two independent zones:
 *
 * 1. Basic Info  (name + email) — saved immediately, no admin password needed.
 * 2. Danger Zone (role + password) — admin must confirm their own password first.
 *
 * Each zone has its own Save button that only sends the relevant fields.
 */
const EditUserDialog = ({
  open,
  user,
  currentUserId,
  onClose,
  onSave,
  saving,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ── Basic info form ──────────────────────────────────────────────────────
  const [basicForm, setBasicForm] = useState({ name: "", email: "" });
  const [basicErrors, setBasicErrors] = useState({});

  // ── Danger zone form ─────────────────────────────────────────────────────
  const [dangerForm, setDangerForm] = useState({
    role: "viewer",
    newPassword: "",
    adminPassword: "",
  });
  const [dangerErrors, setDangerErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // ── Track which zone is currently saving ─────────────────────────────────
  const [savingZone, setSavingZone] = useState(null); // "basic" | "danger"

  const isSelf = user?._id === currentUserId;

  // Sync when a different user is opened
  useEffect(() => {
    if (user) {
      setBasicForm({ name: user.name || "", email: user.email || "" });
      setDangerForm({
        role: user.role || "viewer",
        newPassword: "",
        adminPassword: "",
      });
      setBasicErrors({});
      setDangerErrors({});
      setShowNew(false);
      setShowAdmin(false);
      setSavingZone(null);
    }
  }, [user]);

  const sharedSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

  // ── Basic info handlers ──────────────────────────────────────────────────
  const handleBasicChange = (field) => (e) => {
    setBasicForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (basicErrors[field])
      setBasicErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateBasic = () => {
    const errs = {};
    if (!basicForm.name.trim() || basicForm.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (
      !basicForm.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicForm.email)
    )
      errs.email = "Please enter a valid email";
    setBasicErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveBasic = async () => {
    if (!validateBasic()) return;
    setSavingZone("basic");
    // keepOpen=true so the dialog stays open — user may still want to apply danger-zone changes
    await onSave(
      user._id,
      {
        name: basicForm.name.trim(),
        email: basicForm.email.trim().toLowerCase(),
      },
      true,
    );
    setSavingZone(null);
  };

  // ── Danger zone handlers ─────────────────────────────────────────────────
  const handleDangerChange = (field) => (e) => {
    setDangerForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (dangerErrors[field])
      setDangerErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateDanger = () => {
    const errs = {};
    if (
      dangerForm.newPassword &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(
        dangerForm.newPassword,
      )
    ) {
      errs.newPassword =
        "8+ chars with uppercase, lowercase, number, and symbol";
    }
    if (!dangerForm.adminPassword)
      errs.adminPassword =
        "Your admin password is required to confirm this change";
    setDangerErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveDanger = async () => {
    if (!validateDanger()) return;
    setSavingZone("danger");
    const payload = {
      role: dangerForm.role,
      adminPassword: dangerForm.adminPassword,
    };
    if (dangerForm.newPassword) payload.newPassword = dangerForm.newPassword;
    await onSave(user._id, payload);
    setSavingZone(null);
  };

  // ── Visibility toggle adornment ──────────────────────────────────────────
  const visToggle = (show, toggle) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" onClick={toggle} tabIndex={-1} edge="end">
          {show ? (
            <VisibilityOff fontSize="small" />
          ) : (
            <Visibility fontSize="small" />
          )}
        </IconButton>
      </InputAdornment>
    ),
  });

  // ── Danger zone colours ──────────────────────────────────────────────────
  const dangerBg = isDark ? "rgba(211,47,47,0.08)" : "rgba(211,47,47,0.05)";
  const dangerBorder = theme.palette.error.main;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          backgroundColor: theme.palette.background.components,
        },
      }}
    >
      {/* ── Dialog header ─────────────────────────────────────────────── */}
      <DialogTitle sx={{ fontWeight: 700, fontSize: "17px", pb: 0, pt: 3 }}>
        Edit User
        <Typography variant="body2" color="text.secondary" mt={0.25}>
          {user?.email}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 2.5,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* ── Zone 1: Basic Info ──────────────────────────────────────── */}
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: theme.palette.text.secondary,
            mb: 1.5,
          }}
        >
          Basic Info
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} mb={1}>
          <TextField
            label="Name"
            fullWidth
            size="small"
            value={basicForm.name}
            onChange={handleBasicChange("name")}
            error={Boolean(basicErrors.name)}
            helperText={basicErrors.name || " "}
            sx={sharedSx}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            size="small"
            value={basicForm.email}
            onChange={handleBasicChange("email")}
            error={Boolean(basicErrors.email)}
            helperText={basicErrors.email || " "}
            sx={sharedSx}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveBasic}
            disabled={saving && savingZone === "basic"}
            startIcon={
              saving && savingZone === "basic" ? (
                <CircularProgress size={13} color="inherit" />
              ) : null
            }
            sx={{
              borderRadius: "9px",
              textTransform: "none",
              fontWeight: 600,
              color: "#fff",
              px: 2.5,
            }}
          >
            {saving && savingZone === "basic" ? "Saving…" : "Save Info"}
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* ── Zone 2: Danger Zone ─────────────────────────────────────── */}
        <Box
          sx={{
            borderRadius: "12px",
            border: `1.5px solid ${dangerBorder}`,
            backgroundColor: dangerBg,
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Danger zone header */}
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberOutlined
              fontSize="small"
              sx={{ color: theme.palette.error.main }}
            />
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: theme.palette.error.main,
              }}
            >
              Danger Zone
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mt: -1 }}
          >
            Changes here require your admin password to confirm. Role changes
            cannot be undone without another admin action.
          </Typography>

          {/* Role select */}
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={dangerForm.role}
              label="Role"
              onChange={handleDangerChange("role")}
              disabled={isSelf}
              sx={{ borderRadius: "10px" }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
            {isSelf && (
              <Typography
                variant="caption"
                color="text.secondary"
                mt={0.5}
                ml={0.5}
              >
                You cannot change your own role
              </Typography>
            )}
          </FormControl>

          {/* New password */}
          <TextField
            label="New password"
            type={showNew ? "text" : "password"}
            fullWidth
            size="small"
            value={dangerForm.newPassword}
            onChange={handleDangerChange("newPassword")}
            error={Boolean(dangerErrors.newPassword)}
            helperText={
              dangerErrors.newPassword || "Leave blank to keep current password"
            }
            InputProps={visToggle(showNew, () => setShowNew((p) => !p))}
            sx={sharedSx}
          />

          {/* Divider inside danger zone */}
          <Divider sx={{ borderColor: "rgba(211,47,47,0.25)" }} />

          {/* Admin password confirmation */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                color: theme.palette.error.main,
                fontWeight: 600,
              }}
            >
              Sensitive change — confirm your admin password to proceed
            </Typography>
            <TextField
              label="Your admin password"
              type={showAdmin ? "text" : "password"}
              fullWidth
              size="small"
              value={dangerForm.adminPassword}
              onChange={handleDangerChange("adminPassword")}
              error={Boolean(dangerErrors.adminPassword)}
              helperText={dangerErrors.adminPassword || " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" color="error" />
                  </InputAdornment>
                ),
                ...visToggle(showAdmin, () => setShowAdmin((p) => !p)),
              }}
              sx={sharedSx}
            />
          </Box>

          {/* Danger-zone save button */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={handleSaveDanger}
              disabled={saving && savingZone === "danger"}
              startIcon={
                saving && savingZone === "danger" ? (
                  <CircularProgress size={13} color="inherit" />
                ) : null
              }
              sx={{
                borderRadius: "9px",
                textTransform: "none",
                fontWeight: 600,
                color: "#fff",
                px: 2.5,
              }}
            >
              {saving && savingZone === "danger"
                ? "Saving…"
                : "Save Critical Changes"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;

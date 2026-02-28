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
  Alert,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";

/**
 * EditUserDialog
 *
 * Sensitive-change detection:
 *   If role changes OR newPassword is non-empty → adminPassword field appears.
 *   The admin must confirm their own password before the update is sent.
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

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "viewer",
    newPassword: "",
    adminPassword: "",
  });
  const [showNew, setShowNew] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync form when a different user is opened
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "viewer",
        newPassword: "",
        adminPassword: "",
      });
      setErrors({});
    }
  }, [user]);

  const isSelf = user?._id === currentUserId;
  const sensitiveChange =
    form.role !== user?.role || form.newPassword.length > 0;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (
      form.newPassword &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(
        form.newPassword,
      )
    ) {
      newErrors.newPassword =
        "8+ chars with uppercase, lowercase, number, and symbol";
    }
    if (sensitiveChange && !form.adminPassword) {
      newErrors.adminPassword =
        "Your password is required to confirm this change";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
    };
    if (form.newPassword) payload.newPassword = form.newPassword;
    if (sensitiveChange) payload.adminPassword = form.adminPassword;
    onSave(user._id, payload);
  };

  const sharedSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };
  const passwordAdornment = (show, toggle) => ({
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: "17px", pb: 1 }}>
        Edit User
        <Typography variant="body2" color="text.secondary" mt={0.25}>
          {user?.email}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        {/* Basic info */}
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={form.name}
          onChange={handleChange("name")}
          error={Boolean(errors.name)}
          helperText={errors.name || " "}
          sx={sharedSx}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          size="small"
          value={form.email}
          onChange={handleChange("email")}
          error={Boolean(errors.email)}
          helperText={errors.email || " "}
          sx={sharedSx}
        />

        {/* Role — disabled if editing yourself */}
        <FormControl fullWidth size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={form.role}
            label="Role"
            onChange={handleChange("role")}
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

        <Divider />

        {/* Optional password change */}
        <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
          Change Password{" "}
          <Typography
            component="span"
            sx={{ fontSize: "12px", color: "text.secondary" }}
          >
            (leave blank to keep current)
          </Typography>
        </Typography>
        <TextField
          label="New password"
          type={showNew ? "text" : "password"}
          fullWidth
          size="small"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword || " "}
          InputProps={passwordAdornment(showNew, () => setShowNew((p) => !p))}
          sx={sharedSx}
        />

        {/* Admin password confirmation — appears when sensitive change detected */}
        {sensitiveChange && (
          <>
            <Divider />
            <Alert severity="warning" sx={{ borderRadius: "10px", py: 0.5 }}>
              <Typography variant="caption" fontWeight={600}>
                Sensitive change — confirm your admin password to proceed
              </Typography>
            </Alert>
            <TextField
              label="Your admin password"
              type={showAdmin ? "text" : "password"}
              fullWidth
              size="small"
              value={form.adminPassword}
              onChange={handleChange("adminPassword")}
              error={Boolean(errors.adminPassword)}
              helperText={errors.adminPassword || " "}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" color="warning" />
                  </InputAdornment>
                ),
                ...(passwordAdornment(showAdmin, () => setShowAdmin((p) => !p))
                  .endAdornment && {
                  endAdornment: passwordAdornment(showAdmin, () =>
                    setShowAdmin((p) => !p),
                  ).endAdornment,
                }),
              }}
              sx={sharedSx}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving && <CircularProgress size={14} color="inherit" />}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;

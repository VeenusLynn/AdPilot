import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { changeUserPassword } from "../../state/api";

// ── Client-side password strength check (mirrors backend rules) ─────────────

const isStrongPassword = (pwd) =>
  /[A-Z]/.test(pwd) &&
  /[a-z]/.test(pwd) &&
  /[0-9]/.test(pwd) &&
  /[^A-Za-z0-9]/.test(pwd) &&
  pwd.length >= 8;

// ── ChangePasswordForm ──────────────────────────────────────────────────────

const ChangePasswordForm = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field-level error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleShow = (field) => () =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = () => {
    const newErrors = {};

    if (!form.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!form.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!isStrongPassword(form.newPassword)) {
      newErrors.newPassword =
        "Must be 8+ chars with uppercase, lowercase, number, and symbol";
    } else if (form.newPassword === form.currentPassword) {
      newErrors.newPassword = "New password must differ from current password";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await changeUserPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to change password";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (field, label, showKey) => (
    <TextField
      fullWidth
      size="small"
      type={showPasswords[showKey] ? "text" : "password"}
      label={label}
      value={form[field]}
      onChange={handleChange(field)}
      error={Boolean(errors[field])}
      helperText={errors[field] || " "}
      FormHelperTextProps={{ sx: { minHeight: "18px" } }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={toggleShow(showKey)}
              edge="end"
              tabIndex={-1}
            >
              {showPasswords[showKey] ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
    />
  );

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box display="flex" flexDirection="column" gap={0.5}>
        {passwordField("currentPassword", "Current password", "current")}
        {passwordField("newPassword", "New password", "new")}
        {passwordField("confirmPassword", "Confirm new password", "confirm")}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1, mb: 2 }}
      >
        Minimum 8 characters · uppercase · lowercase · number · symbol
      </Typography>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={loading && <CircularProgress size={14} color="inherit" />}
        sx={{
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          color: "#fff",
        }}
      >
        {loading ? "Updating…" : "Update Password"}
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;

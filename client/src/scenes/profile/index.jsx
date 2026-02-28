import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, uploadProfilePic } from "../../state/userSlice";
import UserAvatar from "../../components/UserAvatar";
import RoleChip from "../../components/RoleChip";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Alert,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useSnackbar } from "notistack";

// ── Shared info row ────────────────────────────────────────────────────────

const InfoRow = ({
  label,
  value,
  editMode,
  fieldName,
  formValues,
  onChange,
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: editMode && fieldName ? "flex-start" : "center",
        gap: 2,
        py: 1.75,
      }}
    >
      <Typography
        sx={{
          width: 120,
          flexShrink: 0,
          fontSize: "12px",
          fontWeight: 700,
          color: theme.palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          pt: editMode && fieldName ? "10px" : 0,
        }}
      >
        {label}
      </Typography>

      {editMode && fieldName ? (
        <TextField
          size="small"
          fullWidth
          value={formValues[fieldName] ?? ""}
          onChange={(e) => onChange(fieldName, e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />
      ) : (
        <Box
          sx={{
            fontSize: "15px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
          }}
        >
          {value ?? "—"}
        </Box>
      )}
    </Box>
  );
};

// ── Profile page ───────────────────────────────────────────────────────────

const Profile = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const user = useSelector((state) => state.user.data);
  const profileLoading = useSelector((state) => state.user.profileLoading);
  const profileError = useSelector((state) => state.user.profileError);

  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({ name: "" });
  const fileInputRef = useRef(null);

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleEnterEdit = () => {
    setFormValues({ name: user?.name || "" });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormValues({ name: "" });
  };

  const handleFieldChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const trimmedName = formValues.name.trim();
    if (!trimmedName || trimmedName === user?.name) {
      setEditMode(false);
      return;
    }
    try {
      await dispatch(updateProfile({ name: trimmedName })).unwrap();
      enqueueSnackbar("Profile updated", { variant: "success" });
      setEditMode(false);
    } catch (err) {
      enqueueSnackbar(err || "Failed to update profile", { variant: "error" });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      enqueueSnackbar("Only JPG and PNG files are allowed", {
        variant: "error",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar("Image must be smaller than 2 MB", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await dispatch(uploadProfilePic(formData)).unwrap();
      enqueueSnackbar("Profile picture updated!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err || "Upload failed", { variant: "error" });
    }
    e.target.value = "";
  };

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 3, md: 1 }} maxWidth={680} mx="auto">
      <Typography variant="h3" mb={2} fontWeight={700}>
        My Profile
      </Typography>

      <Box
        sx={{
          backgroundColor: theme.palette.background.components,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: theme.shadows[2],
        }}
      >
        {/* Banner */}
        <Box
          sx={{
            height: 110,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark || "#1a2991"} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        />

        {/* Avatar + actions */}
        <Box sx={{ px: 4, pb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              mt: "-48px",
              mb: 2,
            }}
          >
            {/* Avatar with camera overlay */}
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <UserAvatar
                size={96}
                sx={{
                  border: `4px solid ${theme.palette.background.components}`,
                }}
              />

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={profileLoading}
                size="small"
                aria-label="Change profile picture"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.background.components}`,
                  width: 28,
                  height: 28,
                  "&:hover": { backgroundColor: theme.palette.action.hover },
                }}
              >
                {profileLoading ? (
                  <CircularProgress size={13} />
                ) : (
                  <CameraAltOutlinedIcon sx={{ fontSize: 13 }} />
                )}
              </IconButton>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </Box>

            {/* Edit / Save / Cancel */}
            <Box display="flex" gap={1}>
              {editMode ? (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloseOutlinedIcon />}
                    onClick={handleCancelEdit}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      profileLoading ? (
                        <CircularProgress size={13} color="inherit" />
                      ) : (
                        <SaveOutlinedIcon />
                      )
                    }
                    onClick={handleSave}
                    disabled={profileLoading}
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={handleEnterEdit}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>

          {/* Name + role badge */}
          <Box mb={0.5}>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.25}>
              <Typography variant="h5" fontWeight={700}>
                {user.name}
              </Typography>
              <RoleChip role={user.role} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          {profileError && (
            <Alert
              severity="error"
              sx={{ mt: 1.5, mb: 0.5, borderRadius: "10px" }}
            >
              {profileError}
            </Alert>
          )}

          <Divider sx={{ my: 2.5 }} />

          {/* Info rows */}
          <Box>
            <InfoRow
              label="Name"
              value={user.name}
              editMode={editMode}
              fieldName="name"
              formValues={formValues}
              onChange={handleFieldChange}
            />
            <Divider />
            <InfoRow label="Email" value={user.email} />
            <Divider />
            <InfoRow label="Role" value={<RoleChip role={user.role} />} />
            <Divider />
            <InfoRow label="Member since" value={formattedDate} />
          </Box>
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mt={2}
        textAlign="center"
      >
        Click the camera icon to update your photo · JPG or PNG · max 2 MB
      </Typography>
    </Box>
  );
};

export default Profile;

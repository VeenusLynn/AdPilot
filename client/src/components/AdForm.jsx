import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { uploadImage } from "../state/api";
import { useSnackbar } from "notistack";

// ─── Validation rules ────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_MB = 5;

const runValidation = (formData, file, hasExistingImage) => {
  const errors = {};

  // Campaign name
  const name = formData.name.trim();
  if (!name) {
    errors.name = "Campaign name is required.";
  } else if (name.length < 3) {
    errors.name = "Campaign name must be at least 3 characters.";
  }

  // ZIP codes
  const badZips = formData.zipCodes.some(
    (z) => !z.trim() || !/^(\d{5})(-\d{4})?$/.test(z.trim()),
  );
  if (badZips) {
    errors.zipCodes = "Enter a valid ZIP code format.";
  }

  // Link URL
  const link = formData.linkUrl.trim();
  if (!link) {
    errors.linkUrl = "Link URL is required.";
  } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(link)) {
    // Basic test: something.something with no spaces
    errors.linkUrl = "Enter a valid URL format (e.g., example.com)";
  }

  // Width
  if (!formData.width && formData.width !== 0) {
    errors.width = "Width is required.";
  } else if (isNaN(Number(formData.width)) || Number(formData.width) <= 0) {
    errors.width = "Width must be a positive number.";
  }

  // Height
  if (!formData.height && formData.height !== 0) {
    errors.height = "Height is required.";
  } else if (isNaN(Number(formData.height)) || Number(formData.height) <= 0) {
    errors.height = "Height must be a positive number.";
  }

  // Image file (required if no existing image)
  if (!file && !hasExistingImage) {
    errors.image = "Image is required.";
  } else if (file) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.image = "Only JPG, PNG, WebP, or GIF files are allowed.";
    } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      errors.image = `Image must be smaller than ${MAX_IMAGE_MB} MB.`;
    }
  }

  return errors;
};

// ─────────────────────────────────────────────────────────────────────────────

const AdForm = ({ initialData = null, onCancel, onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { enqueueSnackbar } = useSnackbar();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  // Validation shake animation
  const [shake, setShake] = useState(false);

  // Per-field validation errors — populated on submit, cleared as user edits
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    zipCodes: [""],
    status: "true",
    imageUrl: "",
    linkUrl: "",
    width: "",
    height: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        zipCodes: initialData.zipCodes?.length ? initialData.zipCodes : [""],
        status: String(initialData.active),
        imageUrl: initialData.imageUrl || "",
        linkUrl: initialData.linkUrl || "",
        width: initialData.size?.width || "",
        height: initialData.size?.height || "",
      });
      setFieldErrors({});
    }
  }, [initialData]);

  // Clear field-level error as soon as the user starts correcting a field
  const clearError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleZipChange = (index, value) => {
    const newZipCodes = [...formData.zipCodes];
    newZipCodes[index] = value;
    handleChange("zipCodes", newZipCodes);
  };

  const addZipCodeField = () => {
    handleChange("zipCodes", [...formData.zipCodes, ""]);
  };

  const removeZipCodeField = (index) => {
    if (formData.zipCodes.length === 1) return;
    const newZipCodes = formData.zipCodes.filter((_, i) => i !== index);
    handleChange("zipCodes", newZipCodes);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    clearError("image");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run all field validations at once
    const hasExistingImage = Boolean(formData.imageUrl && initialData);
    const errors = runValidation(formData, file, hasExistingImage);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // Trigger subtle shake animation
      setShake(true);
      setTimeout(() => setShake(false), 400); // Wait for the animation to end
      return; // No snackbar — let the inline errors guide the user
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrl = formData.imageUrl;

      if (file) {
        const formDataObj = new FormData();
        formDataObj.append("image", file);
        const response = await uploadImage(formDataObj);
        uploadedImageUrl = response.data.imageUrl;
      }

      const data = {
        name: formData.name.trim(),
        zipCodes: formData.zipCodes.map((z) => z.trim()),
        active: formData.status === "true",
        imageUrl: uploadedImageUrl,
        linkUrl: formData.linkUrl.trim(),
        size: {
          width: Number(formData.width),
          height: Number(formData.height),
        },
      };

      await onSubmit(data);
    } catch (error) {
      // Only server/network errors reach here — snackbar is appropriate
      enqueueSnackbar(
        error.message || "Something went wrong. Please try again.",
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sharedSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

  return (
    <Dialog
      open
      onClose={onCancel}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: isMobile ? 0 : theme.shape.borderRadius,
          background: theme.palette.background.components,
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {initialData ? "Edit Campaign" : "Create Campaign"}
          </Typography>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            "@keyframes shake": {
              "0%": { transform: "translateX(0)" },
              "20%": { transform: "translateX(-6px)" },
              "40%": { transform: "translateX(6px)" },
              "60%": { transform: "translateX(-4px)" },
              "80%": { transform: "translateX(4px)" },
              "100%": { transform: "translateX(0)" },
            },
            animation: shake ? "shake 0.4s ease-in-out" : "none",
          }}
        >
          <Stack spacing={2.5}>
            {/* Campaign Name */}
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "13px",
                  color: theme.palette.text.secondary,
                }}
              >
                Campaign Name{" "}
                <span style={{ color: theme.palette.error.main }}>*</span>
              </FormLabel>
              <TextField
                size="small"
                placeholder="Enter campaign name (min. 3 characters)"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => {
                  const hasExistingImage = Boolean(
                    formData.imageUrl && initialData,
                  );
                  const errs = runValidation(formData, file, hasExistingImage);
                  if (errs.name)
                    setFieldErrors((p) => ({ ...p, name: errs.name }));
                }}
                fullWidth
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name || " "}
                sx={sharedSx}
              />
            </FormControl>

            {/* ZIP Codes */}
            <FormControl fullWidth error={Boolean(fieldErrors.zipCodes)}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <FormLabel
                  sx={{ fontSize: "13px", color: theme.palette.text.secondary }}
                  error={Boolean(fieldErrors.zipCodes)}
                >
                  ZIP Codes{" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </FormLabel>
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addZipCodeField}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Add ZIP
                </Button>
              </Box>
              <Stack spacing={1}>
                {formData.zipCodes.map((zip, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={1}>
                    <TextField
                      size="small"
                      placeholder="Enter ZIP code"
                      value={zip}
                      onChange={(e) => handleZipChange(idx, e.target.value)}
                      fullWidth
                      error={Boolean(fieldErrors.zipCodes) && !zip.trim()}
                      sx={sharedSx}
                    />
                    {formData.zipCodes.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeZipCodeField(idx)}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
              {fieldErrors.zipCodes && (
                <FormHelperText>{fieldErrors.zipCodes}</FormHelperText>
              )}
            </FormControl>

            {/* Status */}
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "13px",
                  color: theme.palette.text.secondary,
                }}
              >
                Status
              </FormLabel>
              <Select
                size="small"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                sx={{ borderRadius: "10px" }}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Image Upload */}
            <FormControl fullWidth error={Boolean(fieldErrors.image)}>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "13px",
                  color: theme.palette.text.secondary,
                }}
                error={Boolean(fieldErrors.image)}
              >
                Upload Image
              </FormLabel>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<FileUploadOutlinedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  color={fieldErrors.image ? "error" : "primary"}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    px: 2.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  Choose Image
                </Button>

                <Typography
                  variant="body2"
                  color={
                    fieldErrors.image
                      ? "error"
                      : file
                        ? "text.primary"
                        : "text.secondary"
                  }
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {file
                    ? file.name
                    : formData.imageUrl
                      ? `Current: ${formData.imageUrl.split("/").pop()}`
                      : "No file chosen"}
                </Typography>
              </Box>

              {fieldErrors.image && (
                <FormHelperText>{fieldErrors.image}</FormHelperText>
              )}
            </FormControl>

            {/* Link URL */}
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  fontSize: "13px",
                  color: theme.palette.text.secondary,
                }}
              >
                Link URL{" "}
                <span style={{ color: theme.palette.error.main }}>*</span>
              </FormLabel>
              <TextField
                size="small"
                placeholder="https://example.com"
                value={formData.linkUrl}
                onChange={(e) => handleChange("linkUrl", e.target.value)}
                onBlur={() => {
                  const hasExistingImage = Boolean(
                    formData.imageUrl && initialData,
                  );
                  const errs = runValidation(formData, file, hasExistingImage);
                  if (errs.linkUrl)
                    setFieldErrors((p) => ({ ...p, linkUrl: errs.linkUrl }));
                }}
                fullWidth
                error={Boolean(fieldErrors.linkUrl)}
                helperText={fieldErrors.linkUrl || " "}
                sx={sharedSx}
              />
            </FormControl>

            {/* Dimensions */}
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{
                    mb: 1,
                    fontSize: "13px",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Width (px){" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </FormLabel>
                <TextField
                  size="small"
                  type="number"
                  placeholder="e.g. 300"
                  value={formData.width}
                  onChange={(e) => handleChange("width", e.target.value)}
                  fullWidth
                  error={Boolean(fieldErrors.width)}
                  helperText={fieldErrors.width || " "}
                  inputProps={{ min: 1 }}
                  sx={sharedSx}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel
                  sx={{
                    mb: 1,
                    fontSize: "13px",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Height (px){" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </FormLabel>
                <TextField
                  size="small"
                  type="number"
                  placeholder="e.g. 250"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  fullWidth
                  error={Boolean(fieldErrors.height)}
                  helperText={fieldErrors.height || " "}
                  inputProps={{ min: 1 }}
                  sx={sharedSx}
                />
              </FormControl>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ textTransform: "none", borderRadius: "12px" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            color: theme.palette.common.white,
            borderRadius: "12px",
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Create Campaign"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdForm;

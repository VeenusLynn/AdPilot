import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
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
import { uploadImage } from "../state/api"; // ✅ Make sure this exists

const AdForm = ({ initialData = null, onCancel, onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);

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
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const validateForm = () => {
    const { name, zipCodes, linkUrl, width, height } = formData;
    return (
      name.trim() &&
      zipCodes.every((zip) => zip.trim()) &&
      linkUrl.trim() &&
      width &&
      !isNaN(Number(width)) &&
      height &&
      !isNaN(Number(height))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill all fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrl = formData.imageUrl;

      // Upload image file if a new one is selected
      if (file) {
        const formDataObj = new FormData();
        formDataObj.append("image", file); // matches multer's field name
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
      alert("Something went wrong during submission.", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Campaign Name */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Campaign Name
              </FormLabel>
              <TextField
                size="small"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                fullWidth
                required
              />
            </FormControl>

            {/* ZIP Codes */}
            <FormControl fullWidth>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <FormLabel sx={{ color: theme.palette.text.secondary }}>
                  ZIP Codes
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
                      required
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
            </FormControl>

            {/* Status */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Status
              </FormLabel>
              <Select
                size="small"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Image Upload */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Upload Image
              </FormLabel>
              <TextField
                type="file"
                inputProps={{ accept: "image/*" }}
                size="small"
                fullWidth
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              {formData.imageUrl && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Current: {formData.imageUrl}
                </Typography>
              )}
            </FormControl>

            {/* Link URL */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Link URL
              </FormLabel>
              <TextField
                size="small"
                placeholder="Enter link URL"
                value={formData.linkUrl}
                onChange={(e) => handleChange("linkUrl", e.target.value)}
                fullWidth
                required
              />
            </FormControl>

            {/* Dimensions */}
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Width (px)
                </FormLabel>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Width"
                  value={formData.width}
                  onChange={(e) => handleChange("width", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Height (px)
                </FormLabel>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Height"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
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
          type="submit"
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

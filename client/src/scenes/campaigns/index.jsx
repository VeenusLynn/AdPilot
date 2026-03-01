import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAds, removeAd, editAd, addAd } from "../../state/adSlice";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  SearchOutlined,
  ViewListOutlined,
  GridViewOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";
import AdForm from "../../components/AdForm";
import CampaignCard from "../../components/CampaignCard";
import { useSnackbar } from "notistack";
import useRole from "../../hooks/useRole";

// ── Status badge ────────────────────────────────────────────────────────────

const StatusLabel = ({ active }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const colors = active
    ? {
        text: isDark ? "#B7F0D3" : "#027A48",
        bg: isDark ? "#1B2E2B" : "#ECFDF3",
      }
    : {
        text: isDark ? "#F6B4B0" : "#B42318",
        bg: isDark ? "#2E1C1B" : "#FEF3F2",
      };

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        display: "inline-block",
        borderRadius: "12px",
        fontWeight: 500,
        fontSize: "12px",
        color: colors.text,
        backgroundColor: colors.bg,
      }}
    >
      {active ? "Active" : "Inactive"}
    </Box>
  );
};

// ── Sortable column header using MUI TableSortLabel ──────────────────────────
// Arrow is always mounted (for layout stability) but only visible on hover
// or when the column is active — this matches the Manage Users table behaviour.
const COLUMNS = [
  { id: "name", label: "Campaign", sortable: true },
  { id: "active", label: "Status", sortable: true },
  { id: "createdAt", label: "Created", sortable: true },
  { id: "zipCodes", label: "ZIP Codes", sortable: false },
  { id: "size", label: "Size", sortable: false },
  { id: "actions", label: "", sortable: false },
];

const Campaigns = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin } = useRole();

  const { data: ads, loading } = useSelector((state) => state.ads);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [viewMode, setViewMode] = useState("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAds());
  }, [dispatch]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const openCreateForm = () => {
    setFormInitialData(null);
    setIsFormOpen(true);
  };

  const openEditFormForAd = (ad) => {
    setFormInitialData(ad);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormInitialData(null);
  };
  const handleFormSubmit = async (formData) => {
    try {
      if (formInitialData) {
        await dispatch(
          editAd({ id: formInitialData._id, adData: formData }),
        ).unwrap();
        enqueueSnackbar("Campaign updated successfully", {
          variant: "success",
        });
      } else {
        await dispatch(addAd(formData)).unwrap();
        enqueueSnackbar("Campaign created successfully", {
          variant: "success",
        });
      }
      closeForm();
      dispatch(fetchAds());
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to save campaign", {
        variant: "error",
      });
    }
  };

  const filteredAds = ads
    .filter((ad) => ad.name.toLowerCase().includes(search.toLowerCase()))
    .filter((ad) =>
      statusFilter === "" ? true : String(ad.active) === statusFilter,
    );

  const sortedAds = [...filteredAds].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;

    let valA = a[key];
    let valB = b[key];

    if (key === "createdAt") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (typeof valA === "string") {
      return direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (
      typeof valA === "number" ||
      typeof valA === "boolean" ||
      valA instanceof Date
    ) {
      return direction === "asc" ? valA - valB : valB - valA;
    }

    return 0;
  });

  return (
    <Box p={{ xs: 3, md: 5 }}>
      {/* ── Row 1: Title + Add button ── */}
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h3" fontWeight={800} mb={0.25}>
            Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ads.length} campaign{ads.length === 1 ? "" : "s"} total
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="contained"
            onClick={openCreateForm}
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              color: "#fff",
              textTransform: "none",
              px: 2.5,
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            + Add Campaign
          </Button>
        )}
      </Box>

      {/* ── Row 2: Search + Status filter + View toggle ── */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Search campaigns…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: "1 1 220px",
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: "10px" }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, val) => val && setViewMode(val)}
          size="small"
          sx={{ ml: "auto" }}
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewListOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="card" aria-label="card view">
            <GridViewOutlined fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : viewMode === "card" ? (
        /* ── Card view ── */
        sortedAds.length === 0 ? (
          <Box py={6} display="flex" justifyContent="center">
            <Typography color="text.secondary" fontSize="14px">
              No campaigns match your search
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {sortedAds.map((ad) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ad._id}>
                <CampaignCard ad={ad} />
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        /* ── List / table view ── */
        <Box
          sx={{
            backgroundColor: theme.palette.background.components,
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{ backgroundColor: theme.palette.background.default }}
              >
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.id === "actions" ? "right" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: theme.palette.text.secondary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortConfig.key === col.id}
                        direction={
                          sortConfig.key === col.id
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort(col.id)}
                        sx={{
                          // Text colour animates with the icon
                          color: "inherit",
                          transition: "color 0.2s ease",
                          "&.Mui-active": {
                            color: theme.palette.primary.main,
                          },
                          // Arrow: hidden when inactive, visible on hover or active
                          "& .MuiTableSortLabel-icon": {
                            opacity: sortConfig.key === col.id ? 1 : 0,
                            // Smooth rotation when toggling asc ↔ desc
                            transition:
                              "opacity 0.2s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease",
                            // Inherit colour from active parent so text + arrow move together
                            color: "inherit !important",
                          },
                          "&:hover .MuiTableSortLabel-icon": {
                            opacity: 1,
                          },
                        }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAds.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length}
                    sx={{ py: 5, textAlign: "center" }}
                  >
                    <Typography color="text.secondary" fontSize="14px">
                      No campaigns match your search
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedAds.map((ad) => {
                  const createdAtStr = new Date(ad.createdAt).toLocaleString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  );
                  return (
                    <TableRow
                      key={ad._id}
                      hover
                      sx={{
                        "&:last-child td": { border: 0 },
                        "& td": {
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: "13px" }}>
                        {ad.name}
                      </TableCell>
                      <TableCell>
                        <StatusLabel active={ad.active} />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "12px",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {createdAtStr}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "13px",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {ad.zipCodes?.join(", ") || "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "13px",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {ad.size?.width}x{ad.size?.height}
                      </TableCell>
                      <TableCell align="right">
                        {isAdmin && (
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            gap={0.5}
                          >
                            <Tooltip title="Edit campaign">
                              <IconButton
                                size="small"
                                onClick={() => openEditFormForAd(ad)}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete campaign">
                              <IconButton
                                size="small"
                                sx={{ color: theme.palette.error.main }}
                                onClick={() => {
                                  setAdToDelete(ad._id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <DeleteOutlineOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Modal Form Overlay */}
      {isFormOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
          }}
          onClick={closeForm}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: "8px",
              boxShadow: theme.shadows[5],
              p: 3,
              minWidth: 400,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <AdForm
              initialData={formInitialData}
              onCancel={closeForm}
              onSubmit={handleFormSubmit}
            />
          </Box>
        </Box>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this ad campaign? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await dispatch(removeAd(adToDelete)).unwrap();
                enqueueSnackbar("Campaign deleted successfully", {
                  variant: "success",
                });
                setDeleteDialogOpen(false);
              } catch (error) {
                enqueueSnackbar(error.message || "Failed to delete campaign", {
                  variant: "error",
                });
              }
            }}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Campaigns;

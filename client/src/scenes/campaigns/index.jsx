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
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  useTheme,
  Menu,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { CiMenuKebab } from "react-icons/ci";
import AdForm from "../../components/AdForm";
import { useSnackbar } from "notistack";

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

const SortableHeader = ({ label, sortKey, currentSort, onSort }) => {
  const theme = useTheme();
  const isActive = currentSort.key === sortKey;
  const direction = currentSort.direction;

  return (
    <Box
      onClick={() => onSort(sortKey)}
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        fontWeight: 600,
        color: isActive ? theme.palette.primary.main : "inherit",
      }}
    >
      {label}
      <Box ml={0.5} display="flex" flexDirection="column" alignItems="center">
        <KeyboardArrowUp
          sx={{
            fontSize: 18,
            color:
              isActive && direction === "asc"
                ? theme.palette.primary.main
                : "#bbb",
          }}
        />
        <KeyboardArrowDown
          sx={{
            fontSize: 18,
            mt: "-4px",
            color:
              isActive && direction === "desc"
                ? theme.palette.primary.main
                : "#bbb",
          }}
        />
      </Box>
    </Box>
  );
};

const Campaigns = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { data: ads, loading } = useSelector((state) => state.ads);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdId, setSelectedAdId] = useState(null);

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
        : { key, direction: "asc" }
    );
  };

  const handleMenuOpen = (event, adId) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdId(adId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAdId(null);
  };

  const openCreateForm = () => {
    setFormInitialData(null);
    setIsFormOpen(true);
  };

  const openEditForm = () => {
    const adToEdit = ads.find((ad) => ad._id === selectedAdId);
    if (adToEdit) {
      setFormInitialData(adToEdit);
      setIsFormOpen(true);
    }
    handleMenuClose();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormInitialData(null);
  };
  const handleFormSubmit = async (formData) => {
    try {
      if (formInitialData) {
        await dispatch(
          editAd({ id: formInitialData._id, adData: formData })
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
      statusFilter === "" ? true : String(ad.active) === statusFilter
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
    <Box p={4}>
      <Typography variant="h3" marginBottom="1.5rem">
        Manage All Your Campaigns
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <TextField
          variant="outlined"
          placeholder="Search campaigns"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <Box display="flex" gap={2}>
          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              width: 150,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>

          <Button
            variant="contained"
            sx={{
              borderRadius: "15px",
              fontWeight: 500,
              fontSize: "14px",
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary.main,
              textTransform: "none",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            onClick={openCreateForm}
          >
            + Add Campaign
          </Button>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.divider }}>
                <TableCell />
                <TableCell>
                  <SortableHeader
                    label="Campaign"
                    sortKey="name"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell>
                  <SortableHeader
                    label="Status"
                    sortKey="active"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell>
                  <SortableHeader
                    label="Time of Creation"
                    sortKey="createdAt"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                </TableCell>
                <TableCell>
                  <strong>ZIP Codes</strong>
                </TableCell>
                <TableCell>
                  <strong>Size</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAds.map((ad) => {
                const created = new Date(ad.createdAt);
                const createdAtStr = created.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow
                    key={ad._id}
                    sx={{
                      backgroundColor: theme.palette.background.components,
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => handleMenuOpen(e, ad._id)}
                      >
                        <CiMenuKebab
                          size={20}
                          color={theme.palette.common.gray}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{ad.name}</TableCell>
                    <TableCell>
                      <StatusLabel active={ad.active} />
                    </TableCell>
                    <TableCell>{createdAtStr}</TableCell>
                    <TableCell>{ad.zipCodes?.join(", ") || "N/A"}</TableCell>
                    <TableCell>
                      {ad.size?.width}x{ad.size?.height}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: "8px",
              minWidth: "180px",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        <MenuItem onClick={openEditForm} sx={{ gap: 1 }}>
          <ListItemIcon>
            <ModeEditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Edit Campaign
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAdToDelete(selectedAdId);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ gap: 1, color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Campaign
        </MenuItem>
      </Menu>

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

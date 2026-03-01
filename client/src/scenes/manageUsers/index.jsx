import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import {
  SearchOutlined,
  ViewListOutlined,
  GridViewOutlined,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { getAdminUsers, updateAdminUser } from "../../state/api";
import UsersTableView from "./UsersTableView";
import UsersCardView from "./UsersCardView";
import EditUserDialog from "./EditUserDialog";

const ManageUsers = () => {
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useSelector((state) => state.user.data);

  // Data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & view
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [viewMode, setViewMode] = useState("list"); // "list" | "card"

  // Edit dialog
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch users ────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers();
      setUsers(res.data.users);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load users";
      setError(msg);
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Derived users (filter + sort) ─────────────────────────────────────

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField] ?? "";
      let bVal = b[sortField] ?? "";
      if (sortField === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, roleFilter, sortField, sortDir]);

  // ── Sort toggle ───────────────────────────────────────────────────────

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Save user ─────────────────────────────────────────────────────────

  // keepOpen=true: used by Basic Info zone so dialog stays open for further edits
  const handleSave = async (id, payload, keepOpen = false) => {
    setSaving(true);
    try {
      const res = await updateAdminUser(id, payload);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.user : u)));
      enqueueSnackbar("User updated successfully", { variant: "success" });
      if (!keepOpen) setEditTarget(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to update user", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <Box p={{ xs: 3, md: 5 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800} mb={0.25}>
          Manage Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading
            ? "Loading…"
            : `${users.length} user${users.length === 1 ? "" : "s"} total`}
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search name or email…"
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

        {/* Role filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ borderRadius: "10px" }}
          >
            <MenuItem value="all">All roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
        </FormControl>

        {/* View toggle */}
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

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box py={4}>
          <Typography color="error" fontSize="14px">
            {error}
          </Typography>
        </Box>
      ) : viewMode === "list" ? (
        <UsersTableView
          users={filteredUsers}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={setEditTarget}
          currentUserId={currentUser?._id}
        />
      ) : (
        <UsersCardView
          users={filteredUsers}
          onEdit={setEditTarget}
          currentUserId={currentUser?._id}
        />
      )}

      {/* Edit dialog */}
      <EditUserDialog
        open={Boolean(editTarget)}
        user={editTarget}
        currentUserId={currentUser?._id}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
};

export default ManageUsers;

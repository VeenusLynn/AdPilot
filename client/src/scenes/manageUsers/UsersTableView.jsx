import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Typography,
  useTheme,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RoleChip from "../../components/RoleChip";

const COLUMNS = [
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "role", label: "Role", sortable: true },
  { id: "createdAt", label: "Member Since", sortable: true },
  { id: "actions", label: "", sortable: false },
];

const UsersTableView = ({
  users,
  sortField,
  sortDir,
  onSort,
  onEdit,
  currentUserId,
}) => {
  const theme = useTheme();

  const handleSort = (field) => {
    if (!COLUMNS.find((c) => c.id === field)?.sortable) return;
    onSort(field);
  };

  return (
    <TableContainer
      sx={{
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.components,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
            {COLUMNS.map((col) => (
              <TableCell
                key={col.id}
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
                    active={sortField === col.id}
                    direction={sortField === col.id ? sortDir : "asc"}
                    onClick={() => handleSort(col.id)}
                    sx={{
                      "&.Mui-active": { color: theme.palette.primary.main },
                      "& .MuiTableSortLabel-icon": {
                        color: `${theme.palette.primary.main} !important`,
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
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                sx={{ py: 5, textAlign: "center" }}
              >
                <Typography color="text.secondary" fontSize="14px">
                  No users match your search
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user._id}
                hover
                sx={{
                  "&:last-child td": { border: 0 },
                  "& td": {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {/* Initials avatar */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark || "#1a2991"}, ${theme.palette.primary.main})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                        {user.name}
                        {user._id === currentUserId && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "10px",
                              color: theme.palette.text.secondary,
                              ml: 1,
                            }}
                          >
                            (you)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <RoleChip role={user.role} />
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit user">
                    <IconButton size="small" onClick={() => onEdit(user)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTableView;

import React from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RoleChip from "../../components/RoleChip";

const UsersCardView = ({ users, onEdit, currentUserId }) => {
  const theme = useTheme();

  if (users.length === 0) {
    return (
      <Box py={6} display="flex" justifyContent="center">
        <Typography color="text.secondary" fontSize="14px">
          No users match your search
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} key={user._id}>
          <Box
            sx={{
              backgroundColor: theme.palette.background.components,
              borderRadius: "14px",
              p: 2.5,
              boxShadow: theme.shadows[1],
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              position: "relative",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[3],
              },
            }}
          >
            {/* Edit button */}
            <Tooltip title="Edit user">
              <IconButton
                size="small"
                onClick={() => onEdit(user)}
                sx={{ position: "absolute", top: 10, right: 10 }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Initials + name */}
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${
                    theme.palette.primary.dark || "#1a2991"
                  }, ${theme.palette.primary.main})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}
                >
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </Typography>
              </Box>
              <Box minWidth={0}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                  {user._id === currentUserId && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "10px",
                        color: theme.palette.text.secondary,
                        ml: 0.75,
                      }}
                    >
                      (you)
                    </Typography>
                  )}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: theme.palette.text.secondary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>

            {/* Role + date */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <RoleChip role={user.role} />
              <Typography
                sx={{ fontSize: "11px", color: theme.palette.text.secondary }}
              >
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default UsersCardView;

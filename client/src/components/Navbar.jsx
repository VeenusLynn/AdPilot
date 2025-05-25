import React, { useState, useEffect } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Search,
  NotificationsNoneOutlined,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";
import { useDispatch, useSelector } from "react-redux";
import { setMode } from "../state";

import logo from "../assets/AdPilot.png";
import {
  AppBar,
  useTheme,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Divider,
  ListItemIcon,
  Snackbar,
  Alert,
} from "@mui/material";
import { logout } from "../state/userSlice.js";

const Navbar = ({ user }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();

  // console.log("Current Theme:", theme);
  // console.log("Current Palette:", theme.palette);

  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const logoutStatus = useSelector((state) => state.user.status);

  useEffect(() => {
    if (logoutStatus === "succeeded") {
      setShowLogoutSuccess(true);
    }
  }, [logoutStatus]);

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name || "User"
  )}`;

  return (
    <AppBar
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: theme.palette.background.components,
        boxShadow: "none",
        width: "100%",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
        }}
      >
        {/* left side */}
        <FlexBetween>
          <Box display="flex" alignItems="center" gap="0.5rem" mr="1rem">
            <Box
              component="img"
              src={logo}
              sx={{ height: "25px", width: "25px" }}
            />
            <Typography fontSize="25px" fontWeight="bold">
              AdPilot
            </Typography>
          </Box>

          <FlexBetween
            backgroundColor={theme.palette.divider}
            borderRadius="8px"
            gap="3rem"
            p="0.2 rem 1.5 rem"
          >
            <InputBase
              placeholder="Search..."
              sx={{ padding: "0.2rem 1rem" }}
            />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        {/* right side */}
        <FlexBetween gap="1.5rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlined sx={{ fontSize: "25px" }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton>
            <NotificationsNoneOutlined sx={{ fontSize: "25px" }} />
          </IconButton>
          {/* User Profile section*/}
          <FlexBetween>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                gap: "1rem",
              }}
            >
              <Avatar
                alt={user.name || "User"}
                src={avatarUrl}
                sx={{ width: 40, height: 40 }}
              />
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.85rem"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {user.name ? user.name : "Name"}
                </Typography>
                <Typography
                  fontSize="0.75rem"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {user.email ? user.email : "Email"}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={isOpen}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate("/profile");
                }}
              >
                <Avatar src={avatarUrl} alt={user.name || "User"} /> My Profile
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate("/settings");
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  dispatch(logout());
                  handleClose();
                  setShowLogoutSuccess(true);
                  setTimeout(() => navigate("/login"), 2500);
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
      <Snackbar
        open={showLogoutSuccess}
        autoHideDuration={2000}
        onClose={() => setShowLogoutSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowLogoutSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Logged out successfully
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Navbar;

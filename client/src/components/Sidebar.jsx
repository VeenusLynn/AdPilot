import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  AccountCircleOutlined,
  SupervisorAccountOutlined,
} from "@mui/icons-material";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { RiMegaphoneLine } from "react-icons/ri";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Nav definitions ────────────────────────────────────────────────────────

const baseNavItems = [
  { text: "Main Menu", icon: null },
  { text: "Dashboard", icon: <LuLayoutDashboard /> },
  { text: "Campaigns", icon: <RiMegaphoneLine /> },
  { text: "Billing", icon: <LiaFileInvoiceDollarSolid /> },
  { text: "Manage My Account", icon: null },
  { text: "Settings", icon: <IoSettingsOutline /> },
  { text: "Profile", icon: <AccountCircleOutlined /> },
];

const adminNavItems = [
  { text: "Admin", icon: null },
  {
    text: "Manage Users",
    icon: <SupervisorAccountOutlined />,
    path: "/manage-users",
  },
];

// ── Sidebar ────────────────────────────────────────────────────────────────

const Sidebar = ({
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const user = useSelector((state) => state.user.data);

  const navItems = [
    ...(user?.role === "admin" ? adminNavItems : []),
    ...baseNavItems,
  ];

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  // Single flag that drives all conditional rendering
  const showText = isSidebarOpen;

  return (
    <Box component="nav">
      <Drawer
        open
        variant={isNonMobile ? "permanent" : "temporary"}
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.components,
            color: theme.palette.text.primary,
            borderRight: "none",
            marginTop: isNonMobile ? "64px" : "56px",
            height: isNonMobile ? "calc(100vh - 64px)" : "calc(100vh - 56px)",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Box width="100%" height="100%">
          {/* Collapse toggle */}
          <Box
            display="flex"
            justifyContent={showText ? "flex-end" : "center"}
            sx={{
              m: "0 1rem",
              pt: isNonMobile ? 0 : "0.5rem",
              pb: isNonMobile ? 0 : "0.5rem",
            }}
          >
            <IconButton
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": { backgroundColor: theme.palette.action.hover },
              }}
            >
              {showText ? <ChevronLeft /> : <ChevronRightOutlined />}
            </IconButton>
          </Box>

          {/* Unified nav list — one branch, driven by showText */}
          <List sx={{ px: 0 }}>
            {navItems.map(({ text, icon, path: itemPath }) => {
              // ── Section heading (no icon) ───────────────────────────────
              if (!icon) {
                return (
                  <Box
                    key={text}
                    sx={{
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      px: "1.5rem",
                    }}
                  >
                    {showText ? (
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          color: theme.palette.text.secondary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "100%",
                        }}
                      >
                        {text}
                      </Typography>
                    ) : (
                      <Divider
                        sx={{
                          width: "100%",
                          borderColor: theme.palette.divider,
                        }}
                      />
                    )}
                  </Box>
                );
              }

              // ── Nav item (has icon) ──────────────────────────────────────
              const navPath = itemPath || `/${text.toLowerCase()}`;
              const activeKey = navPath.replace(/^\//, "");
              const isActive = active === activeKey;

              const button = (
                <ListItem key={text} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(navPath);
                      setActive(activeKey);
                    }}
                    sx={{
                      mx: "8px",
                      my: showText ? "4px" : "6px",
                      borderRadius: "12px",
                      justifyContent: showText ? "flex-start" : "center",
                      minHeight: 44,
                      backgroundColor: isActive
                        ? theme.palette.primary.main
                        : "transparent",
                      color: isActive
                        ? theme.palette.common.white
                        : theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor: isActive
                          ? theme.palette.action.hoverButton
                          : theme.palette.action.hover,
                        color: isActive
                          ? theme.palette.common.gray
                          : theme.palette.text.secondary,
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: showText ? "36px" : "auto",
                        ml: showText ? "0.5rem" : 0,
                        mr: 0,
                        fontSize: "20px",
                        justifyContent: "center",
                        color: isActive
                          ? theme.palette.common.white
                          : theme.palette.text.secondary,
                      }}
                    >
                      {icon}
                    </ListItemIcon>

                    {showText && (
                      <ListItemText
                        primary={text}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "15px",
                          letterSpacing: "0.03rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );

              // Wrap with Tooltip showing item name when collapsed
              return showText ? (
                button
              ) : (
                <Tooltip key={text} title={text} placement="right" arrow>
                  {button}
                </Tooltip>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;

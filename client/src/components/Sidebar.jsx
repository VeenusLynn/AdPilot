import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { RiMegaphoneLine } from "react-icons/ri";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    text: "Main Menu",
    icon: null,
  },
  {
    text: "Dashboard",
    icon: <LuLayoutDashboard />,
  },
  {
    text: "Campaigns",
    icon: <RiMegaphoneLine />,
  },
  {
    text: "Billing",
    icon: <LiaFileInvoiceDollarSolid />,
  },
  {
    text: "Manage My Account",
    icon: null,
  },
  {
    text: "Settings",
    icon: <IoSettingsOutline />,
  },
  {
    text: "My Profile",
    icon: <AccountCircleOutlined />,
  },
];

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

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      <Drawer
        open={true}
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
          <Box
            m="0 1rem"
            display="flex"
            justifyContent={isSidebarOpen ? "flex-end" : "center"}
            sx={{
              paddingTop: isNonMobile ? "0" : "0.5rem",
              paddingBottom: isNonMobile ? "0" : "0.5rem",
            }}
          >
            <IconButton
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {isSidebarOpen ? <ChevronLeft /> : <ChevronRightOutlined />}
            </IconButton>
          </Box>

          {isSidebarOpen ? (
            <>
              <List>
                {navItems.map(({ text, icon }) => {
                  if (!icon) {
                    return (
                      <Typography
                        key={text}
                        sx={{
                          m: "0.25rem 0 0.75rem 1.5rem",
                          fontWeight: 700,
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {text}
                      </Typography>
                    );
                  }
                  const lcText = text.toLowerCase();
                  return (
                    <ListItem key={text} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          navigate(`/${lcText}`);
                          setActive(lcText);
                        }}
                        sx={{
                          marginX: "8px",
                          marginY: "4px",
                          borderRadius: "12px",
                          backgroundColor:
                            active === lcText
                              ? theme.palette.primary.main
                              : "transparent",
                          color:
                            active === lcText
                              ? theme.palette.common.white
                              : theme.palette.text.secondary,
                          "&:hover": {
                            backgroundColor:
                              active === lcText
                                ? theme.palette.action.hoverButton
                                : theme.palette.action.hover,
                            color:
                              active === lcText
                                ? theme.palette.common.gray
                                : theme.palette.text.secondary,
                          },
                          transition: "all 0.1s ease",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: "36px",
                            ml: "0.5rem",
                            mr: "0",
                            fontSize: "20px",
                            color:
                              active === lcText
                                ? theme.palette.common.white
                                : theme.palette.text.secondary,
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: "15px",
                            letterSpacing: "0.03rem",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </>
          ) : (
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Divider
                      key={text}
                      sx={{
                        my: 1,
                        mx: 2,
                        borderColor: theme.palette.divider,
                      }}
                    />
                  );
                }
                const lcText = text.toLowerCase();
                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${lcText}`);
                        setActive(lcText);
                      }}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginX: "8px",
                        marginY: "6px",
                        borderRadius: "12px",
                        minHeight: "48px",
                        backgroundColor:
                          active === lcText
                            ? theme.palette.primary.main
                            : "transparent",
                        color:
                          active === lcText
                            ? theme.palette.common.white
                            : theme.palette.text.secondary,
                        "&:hover": {
                          backgroundColor:
                            active === lcText
                              ? theme.palette.action.hoverButton
                              : theme.palette.action.hover,
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "auto",
                          justifyContent: "center",
                          color:
                            active === lcText
                              ? theme.palette.common.white
                              : theme.palette.text.secondary,
                          fontSize: "20px",
                        }}
                      >
                        {React.cloneElement(icon, {
                          style: { fontSize: "1.25rem" },
                        })}
                      </ListItemIcon>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;

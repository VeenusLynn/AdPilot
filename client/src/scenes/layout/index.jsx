import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getUser } from "../../state/api";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const userId = useSelector((state) => state.global.userId);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(userId);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <Box width="100%" height="100%">
      <Navbar
        user={user || {}}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      />

      <Box display="flex" width="100%" height="calc(100% - 64px)" mt="64px">
        <Sidebar
          isNonMobile={isNonMobile}
          drawerWidth={isSidebarOpen ? "200px" : "80px"}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Box flexGrow={1} overflow="auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

import React, { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Box width="100%" height="100%">
      <Navbar
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
        <Box
          flexGrow={1}
          overflow="auto"
          sx={{
            transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.6, 1)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

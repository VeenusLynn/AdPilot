import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getCurrentUser } from "../../state/api.js";
import { fetchUser } from "../../state/userSlice.js";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  const dispatch = useDispatch();
  const stateUser = useSelector((state) => state.user.data);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!stateUser) {
          const response = await getCurrentUser(); // fetch from cookie-authenticated endpoint
          const userFromCookie = response.data;
          dispatch(fetchUser.fulfilled(userFromCookie)); // preload it into Redux if you want
          setUser(userFromCookie);
        } else {
          setUser(stateUser);
        }
      } catch (error) {
        console.error("Error loading user from cookies:", error);
      }
    };

    fetchUserData();
  }, [stateUser, dispatch]);

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

import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/AdPilot.png";

const Landing = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 600,
          p: 4,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.components,
        }}
      >
        <Box display="flex" alignItems="center" gap="0.5rem" mb={2}>
          <Box
            component="img"
            src={logo}
            alt="AdPilot Logo"
            sx={{ height: "40px", width: "40px" }}
          />
          <Typography variant="h4" fontWeight="bold">
            AdPilot
          </Typography>
        </Box>

        <Typography
          variant="h5"
          textAlign="center"
          fontWeight={500}
          color={theme.palette.text.primary}
          mb={2}
        >
          Welcome to AdPilot — your smart ad management platform.
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          color={theme.palette.text.secondary}
          mb={4}
        >
          Track, manage, and optimize your ads like a pro. Join us and take
          control of your advertising performance.
        </Typography>

        <Button
          variant="contained"
          onClick={handleGetStarted}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "16px",
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            "&:hover": {
              backgroundColor: theme.palette.action.hoverButton,
            },
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Stack>
  );
};

export default Landing;

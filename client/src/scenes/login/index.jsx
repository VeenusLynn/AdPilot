import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { login } from "../../state/userSlice";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import validator from "validator";
import logo from "../../assets/AdPilot.png";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const validateInputs = () => {
    let isValid = true;

    if (!validator.isEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (
      validator.isEmpty(password) ||
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false,
      })
    ) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, and 1 number."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;

    try {
      const resultAction = await dispatch(login({ email, password }));
      unwrapResult(resultAction);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response?.status === 400 || error.response?.status === 404) {
        setEmailError(true);
        setPasswordError(true);
        setEmailErrorMessage("Invalid email or password.");
        setPasswordErrorMessage("Invalid email or password.");
      } else {
        alert("Server error, try again later.");
      }
    }
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
          width: "100%",
          maxWidth: 400,
          p: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.components,
        }}
      >
        <Box display="flex" alignItems="center" gap="0.5rem" mr="1rem">
          <Box
            component="img"
            src={logo}
            sx={{ height: "35px", width: "35px" }}
          />
          <Typography fontSize="35px" fontWeight="bold">
            AdPilot
          </Typography>
        </Box>
        <Typography
          component="h1"
          sx={{
            width: "100%",
            fontWeight: 500,
            fontSize: "25px",
            mt: 1,
            mb: 2,
          }}
        >
          Sign in
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
          }}
        >
          <FormControl>
            <FormLabel
              htmlFor="email"
              sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}
            >
              Email
            </FormLabel>
            <TextField
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              name="email"
              autoComplete="email"
              variant="outlined"
              error={emailError}
              helperText={emailErrorMessage}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel
              htmlFor="password"
              sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}
            >
              Password
            </FormLabel>
            <TextField
              required
              fullWidth
              name="password"
              placeholder="••••••"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              variant="outlined"
              error={passwordError}
              helperText={passwordErrorMessage}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </FormControl>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  size="small"
                  sx={{
                    color: theme.palette.primary.main,
                    "&.Mui-checked": { color: theme.palette.primary.main },
                  }}
                />
              }
              label={
                <Typography
                  sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}
                >
                  Remember me
                </Typography>
              }
            />
            <Link
              href="#"
              onClick={(e) => e.preventDefault()}
              sx={{
                color: theme.palette.primary.main,
                fontSize: "14px",
                "&:hover": {
                  color: theme.palette.action.hoverButton,
                  cursor: "pointer",
                },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              p: 1,
              fontSize: "16px",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              "&:hover": {
                backgroundColor: theme.palette.action.hoverButton,
              },
            }}
          >
            Sign in
          </Button>
        </Box>

        <Divider
          sx={{ my: 2, width: "100%", borderColor: theme.palette.divider }}
        >
          <Typography
            sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}
          >
            or
          </Typography>
        </Divider>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontSize: "14px",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              sx={{
                color: theme.palette.primary.main,
                fontSize: "14px",
                "&:hover": {
                  color: theme.palette.action.hoverButton,
                  cursor: "pointer",
                },
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};

export default Login;

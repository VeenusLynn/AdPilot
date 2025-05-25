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
import validator from "validator";
import { registerUser } from "../../state/api";
import logo from "../../assets/AdPilot.png";

const SignUp = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const validateInputs = () => {
    let isValid = true;

    if (validator.isEmpty(name)) {
      setNameError(true);
      setNameErrorMessage("Name is required.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

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
      })
    ) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    try {
      const response = await registerUser({ name, email, password });
      console.log("User registered:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed. Please try again.");
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
            color: theme.palette.text.primary,
          }}
        >
          Sign up
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
              htmlFor="name"
              sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}
            >
              Full name
            </FormLabel>
            <TextField
              name="name"
              required
              fullWidth
              id="name"
              placeholder="Jon Snow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              helperText={nameErrorMessage}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailErrorMessage}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordErrorMessage}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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

          <FormControlLabel
            control={
              <Checkbox
                value="allowExtraEmails"
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
                I want to receive updates via email.
              </Typography>
            }
          />

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
            Sign up
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

        <Typography
          sx={{
            textAlign: "center",
            color: theme.palette.text.secondary,
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
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
            Sign in
          </Link>
        </Typography>
      </Box>
    </Stack>
  );
};

export default SignUp;

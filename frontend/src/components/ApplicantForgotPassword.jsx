import React, { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import {
  Snackbar,
  Alert,
  Box,
  Container,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Email } from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";
import { SettingsContext } from "../App";
import Logo from "../assets/Logo.png";
import "../styles/Container.css"; // ✅ same styling as registrar

// Connect socket
const socket = io("http://localhost:5000");

const ApplicantForgotPassword = () => {
  const settings = useContext(SettingsContext);
  const [capVal, setCapVal] = useState(null);
  const [email, setEmail] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    // ✅ Manila time year
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const year = new Date(now).getFullYear();
    setCurrentYear(year);
  }, []);

  const handleReset = () => {
    if (!email) {
      setSnack({ open: true, message: "Please enter your email.", severity: "warning" });
      return;
    }
    if (!capVal) {
      setSnack({
        open: true,
        message: "Please verify you're not a robot.",
        severity: "warning",
      });
      return;
    }
    socket.emit("forgot-password-applicant", email);
  };

  useEffect(() => {
    const listener = (data) => {
      setSnack({
        open: true,
        message: data.message,
        severity: data.success ? "success" : "error",
      });
    };
    socket.on("password-reset-result-applicant", listener);
    return () => socket.off("password-reset-result-applicant", listener);
  }, []);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  // ✅ Dynamic background and logo (same as registrar)
  const backgroundImage = settings?.bg_image
    ? `url(http://localhost:5000${settings.bg_image})`
    : "url(/default-bg.jpg)";
  const logoSrc = settings?.logo_url
    ? `http://localhost:5000${settings.logo_url}`
    : Logo;

   // 🔒 Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // 🔒 Block DevTools shortcuts + Ctrl+P silently
  document.addEventListener('keydown', (e) => {
    const isBlockedKey =
      e.key === 'F12' || // DevTools
      e.key === 'F11' || // Fullscreen
      (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j')) || // Ctrl+Shift+I/J
      (e.ctrlKey && e.key.toLowerCase() === 'u') || // Ctrl+U (View Source)
      (e.ctrlKey && e.key.toLowerCase() === 'p');   // Ctrl+P (Print)

    if (isBlockedKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  const isButtonDisabled = !email || !capVal;

  return (
    <Box
      sx={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        maxWidth={false}
      >
        <div style={{ border: "5px solid black" }} className="Container">
          {/* Header */}
          <div className="Header">
            <div className="HeaderTitle">
              <div className="CircleCon">
                <img src={logoSrc} alt="Logo" />
              </div>
            </div>
            <div className="HeaderBody">
              <strong>{settings?.company_name || "EARIST"}</strong>
              <p>Student Information System</p>
            </div>
          </div>

          {/* Body */}
          <div className="Body">
            <label htmlFor="email">Email Address:</label>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your Email Address (e.g., username@gmail.com)"
              variant="outlined"
              style={{ border: "2px solid maroon", borderRadius: "5px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
                sx: {
                  height: "50px",
                  "& input": {
                    height: "50px",
                    padding: "0 10px",
                    boxSizing: "border-box",
                  },
                },
              }}
            />

            {/* CAPTCHA */}
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ReCAPTCHA
                sitekey="6Lfem44rAAAAAEeAexdQxvN0Lpm1V4KPu1bBxaGy"
                onChange={(val) => setCapVal(val)}
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleReset}
                variant="contained"
                disabled={isButtonDisabled}
                sx={{
                  width: "100%",
                  py: 1.5,
                  backgroundColor: "#6D2323",
                  color: "white",
                  "&:hover": { backgroundColor: "#6D2323" },
                }}
              >
                Reset Password
              </Button>
            </Box>

            {/* Back to login */}
            <div className="LinkContainer" style={{ marginTop: "1rem" }}>
              <p>To go to login page,</p>
              <span>
                <Link to="/login_applicant" style={{ textDecoration: "underline" }}>
                  Click here
                </Link>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="Footer">
            <div className="FooterText">
              © {currentYear} {settings?.company_name || "EARIST"} Student Information System. All
              rights reserved.
            </div>
          </div>
        </div>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={handleClose} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicantForgotPassword;

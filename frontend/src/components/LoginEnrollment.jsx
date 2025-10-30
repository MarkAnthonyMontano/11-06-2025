import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Modal, TextField } from "@mui/material";
import {
  Container,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import "../styles/Container.css";
import CloseIcon from "@mui/icons-material/Close";
import Logo from "../assets/Logo.png";
import { SettingsContext } from "../App";

const LoginEnrollment = ({ setIsAuthenticated }) => {
  const settings = useContext(SettingsContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [tempLoginData, setTempLoginData] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lockout, setLockout] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [currentYear, setCurrentYear] = useState("");
  const [loginType, setLoginType] = useState("user"); // ✅ Added for dropdown
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  useEffect(() => {
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const year = new Date(now).getFullYear();
    setCurrentYear(year);
  }, []);

  const backgroundImage = settings?.bg_image
    ? `url(http://localhost:5000${settings.bg_image})`
    : "linear-gradient(to right, #f5f5f5, #fafafa)";
  const logoSrc = settings?.logo_url
    ? `http://localhost:5000${settings.logo_url}`
    : Logo;

  const handleLogin = async () => {
    if (isLoggingIn || lockoutTimer > 0) return;
    setIsLoggingIn(true);

    if (!email || !password) {
      setSnack({
        open: true,
        message: "Please fill in all fields",
        severity: "warning",
      });
      setIsLoggingIn(false);
      return;
    }

    try {
      const apiUrl =
        loginType === "applicant"
          ? "http://localhost:5000/login_applicant"
          : "http://localhost:5000/login";

      const res = await axios.post(apiUrl, { email, password });
      setTempLoginData(res.data);

      if (loginType === "applicant") {
        // Applicant direct login (no OTP)
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("person_id", res.data.person_id);
        setIsAuthenticated(true);
        navigate("/applicant_dashboard");
        return;
      }

      // User OTP login
      setShowOtpModal(true);
      startResendTimer();
      setSnack({
        open: true,
        message: "OTP sent to your email",
        severity: "success",
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", {
        email: tempLoginData.email,
        otp,
      });

      localStorage.setItem("token", tempLoginData.token);
      localStorage.setItem("email", tempLoginData.email);
      localStorage.setItem("role", tempLoginData.role);
      localStorage.setItem("person_id", tempLoginData.person_id);
      localStorage.setItem("department", tempLoginData.department || "");

      setIsAuthenticated(true);
      setShowOtpModal(false);

      navigate(
        tempLoginData.role === "registrar"
          ? "/registrar_dashboard"
          : tempLoginData.role === "faculty"
            ? "/faculty_dashboard"
            : "/student_dashboard"
      );
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || "Invalid OTP",
        severity: "error",
      });
    }
  };

  const startResendTimer = () => {
    setResendTimer(300);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    try {
      await axios.post("http://localhost:5000/request-otp", {
        email: tempLoginData.email,
      });
      setSnack({
        open: true,
        message: "OTP resent to your email",
        severity: "success",
      });
      startResendTimer();
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || "Failed to resend OTP",
        severity: "error",
      });
    }
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (showOtpModal) otpInputRef.current?.focus();
  }, [showOtpModal]);

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
  
  return (
    <>
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
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          maxWidth={false}
        >
          <div style={{ border: "5px solid black" }} className="Container">
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

            <div className="Body">
              {/* ✅ Login Type Dropdown (copied from Login.jsx) */}
              <div className="TextField" style={{ position: "relative" }}>
                <label htmlFor="loginType">Login As</label>
                <select
                  id="loginType"
                  name="loginType"
                  value={loginType}
                  onChange={(e) => {
                    setLoginType(e.target.value);
                    if (e.target.value === "applicant") {
                      navigate("/login_applicant");
                    } else {
                      navigate("/login");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "0.8rem 2.5rem 0.8rem 2.5rem",
                    borderRadius: "6px",
                    border: "2px solid maroon", // warm brown-gray

                    fontSize: "1rem",
                    backgroundColor: "white",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="user">Student / Faculty / Registrar</option>
                  <option value="applicant">Applicant</option>
                </select>
                <PersonIcon
                  style={{
                    position: "absolute",
                    top: "2.5rem",
                    left: "0.7rem",
                    color: "rgba(0,0,0,0.4)",
                  }}
                />
                <ArrowDropDownIcon
                  style={{
                    position: "absolute",
                    top: "2.5rem",
                    right: "0.7rem",
                    color: "rgba(0,0,0,0.4)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!lockout) handleLogin();
                }}
              >
                <div className="TextField" style={{ position: "relative" }}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: "2.5rem", border: "2px solid maroon" }}
                    autoFocus
                  />
                  <EmailIcon
                    style={{
                      position: "absolute",
                      top: "2.5rem",
                      left: "0.7rem",
                      color: "rgba(0,0,0,0.4)",
                    }}
                  />
                </div>

                <div className="TextField" style={{ position: "relative" }}>
                  <label htmlFor="password">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border"
                    style={{ paddingLeft: "2.5rem", border: "2px solid maroon" }}
                  />
                  <LockIcon
                    style={{
                      position: "absolute",
                      top: "2.5rem",
                      left: "0.7rem",
                      color: "rgba(0,0,0,0.4)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      color: "rgba(0,0,0,0.3)",
                      outline: "none",
                      position: "absolute",
                      top: "2.5rem",
                      right: "1rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </button>
                </div>

                <div className="Button" style={{ cursor: lockout ? "not-allowed" : "pointer" }}>
                  <button
                    type="submit"
                    disabled={lockout || isLoggingIn}
                    style={{
                      width: "100%",
                      backgroundColor: "#6D2323",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 0",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: lockout || isLoggingIn ? "not-allowed" : "pointer",
                    }}
                  >
                    {lockout
                      ? `Locked (${lockoutTimer}s)`
                      : isLoggingIn
                        ? "Logging in..."
                        : "Log In"}
                  </button>
                </div>
              </form>

              <div className="LinkContainer">
                <span>
                  <Link to="/forgot_password">Forgot your password</Link>
                </span>
              </div>

              <div
                className="LinkContainer RegistrationLink"
                style={{ margin: "0.1rem 0rem" }}
              >
                <p>Doesn't Have an Account?</p>
                <span>
                  <Link to={"/register"}>Register Here</Link>
                </span>
              </div>
            </div>

            <div className="Footer">
              <div className="FooterText">
                &copy; {currentYear} {settings?.company_name || "EARIST"} Student Information
                System. All rights reserved.
              </div>
            </div>
          </div>
        </Container>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snack.severity} onClose={handleClose} sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        </Snackbar>

        {/* OTP Modal */}
        <Modal open={showOtpModal} onClose={() => setShowOtpModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#fff",
              border: "3px solid black",
              p: 4,
              borderRadius: "12px",
              width: 350,
              boxShadow: 24,
              textAlign: "center",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowOtpModal(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                backgroundColor: "#6D2323",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              <CloseIcon fontSize="small" />
            </button>

            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                fontSize: "20px",
                color: "#6D2323",
              }}
            >
              Enter the 6-digit OTP
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
              We sent a verification code to your Gmail address.
            </Typography>

            <TextField
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              inputRef={otpInputRef}
              inputProps={{
                maxLength: 6,
                style: { textAlign: "center", fontSize: "18px" },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") verifyOtp();
              }}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              onClick={verifyOtp}
              sx={{
                width: "100%",
                backgroundColor: "#6D2323",
                "&:hover": { backgroundColor: "#6D2323" },
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "16px",
                py: 1,
              }}
            >
              Verify OTP
            </Button>

            <Button
              variant="outlined"
              onClick={resendOtp}
              disabled={resendTimer > 0}
              sx={{ mt: 2, width: "100%", textTransform: "none" }}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </Button>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default LoginEnrollment;

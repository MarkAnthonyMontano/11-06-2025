import React, { useState, useContext } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Container.css';
import Logo from '../assets/Logo.png';
import {
  Container,
  Box,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";
import { SettingsContext } from "../App"; // ✅ Access settings from context

const Register = () => {
  const settings = useContext(SettingsContext); // ✅ Get settings data (bg_image, logo_url)
  const [capVal, setCapVal] = useState(null);
  const [usersData, setUserData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnack(prev => ({ ...prev, open: false }));
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", usersData);
      setUserData({ email: '', password: '' });

      localStorage.setItem('person_id', response.data.person_id);

      setSnack({ open: true, message: "Registration Successful", severity: "success" });
      setTimeout(() => navigate('/login_applicant'), 1000);
    } catch (error) {
      console.error("Registration failed:", error);
      setSnack({
        open: true,
        message: error.response?.data?.message || "Registration failed",
        severity: "error"
      });
    }
  };

  // 🔒 Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // 🔒 Block DevTools shortcuts + Ctrl+P silently
  document.addEventListener('keydown', (e) => {
    const isBlockedKey =
      e.key === 'F12' ||
      e.key === 'F11' ||
      (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j')) ||
      (e.ctrlKey && e.key.toLowerCase() === 'u') ||
      (e.ctrlKey && e.key.toLowerCase() === 'p');

    if (isBlockedKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // ✅ Use background from settings or fallback image
  const backgroundImage = settings?.bg_image
    ? `url(http://localhost:5000${settings.bg_image})`
    : "url(/default-bg.jpg)";

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
                  <img
                    src={
                      settings?.logo_url
                        ? `http://localhost:5000${settings.logo_url}`
                        : Logo
                    }
                    alt="Logo"
                  />
                </div>
              </div>
              <div className="HeaderBody">
                <strong>{settings?.company_name || "EARIST"}</strong>
                <p>Student Information System</p>
              </div>
            </div>

            <div className="Body">
              <div className="TextField" style={{ position: "relative" }}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="text"
                  className="border"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={usersData.email}
                  onChange={handleChanges}
                  style={{ paddingLeft: "2.5rem", border: "2px solid maroon" }}
                />
                <EmailIcon
                  style={{
                    position: "absolute",
                    top: "2.5rem",
                    left: "0.7rem",
                    color: "rgba(0,0,0,0.4)"
                  }}
                />
              </div>

              <div className="TextField" style={{ position: "relative" }}>
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="border"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={usersData.password}
                  onChange={handleChanges}
                  required
                  style={{ paddingLeft: "2.5rem", border: "2px solid maroon" }}
                />
                <LockIcon
                  style={{
                    position: "absolute",
                    top: "2.5rem",
                    left: "0.7rem",
                    color: "rgba(0,0,0,0.4)"
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
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </button>
              </div>

              {/* CAPTCHA */}
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <ReCAPTCHA
                  sitekey="6Lfem44rAAAAAEeAexdQxvN0Lpm1V4KPu1bBxaGy"
                  onChange={(val) => setCapVal(val)}
                />
              </Box>

              {/* Register Button — disabled until CAPTCHA is solved */}
              <div
                className="Button"
                onClick={capVal ? handleRegister : null}
                style={{
                  pointerEvents: capVal ? "auto" : "none",
                  opacity: capVal ? 1 : 0.5,
                  cursor: capVal ? "pointer" : "not-allowed",
                  marginTop: "20px"
                }}
              >
                <span>Register</span>
              </div>

              <div className="LinkContainer RegistrationLink" style={{ margin: '0.1rem 0rem' }}>
                <p>Already Have an Account?</p>
                <span><Link to={'/login_applicant'}>Sign In here</Link></span>
              </div>
            </div>

            <div className="Footer">
              <div className="FooterText">
                &copy; 2025 {settings?.company_name || "EARIST"} Student Information System. All rights reserved.
              </div>
            </div>
          </div>
        </Container>

        {/* Snackbar Notification */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snack.severity} onClose={handleClose} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Register;

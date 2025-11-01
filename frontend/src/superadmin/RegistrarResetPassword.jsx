import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  InputLabel,
  Typography,
  Paper,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  LockReset,
} from "@mui/icons-material";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

const passwordRules = [
  { label: "Minimum of 8 characters", test: (pw) => pw.length >= 8 },
  { label: "At least one lowercase letter (e.g. abc)", test: (pw) => /[a-z]/.test(pw) },
  { label: "At least one uppercase letter (e.g. ABC)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "At least one number (e.g. 123)", test: (pw) => /\d/.test(pw) },
  { label: "At least one special character (! # $ ^ * @)", test: (pw) => /[!#$^*@]/.test(pw) },
];

const RegistrarResetPassword = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validations, setValidations] = useState([]);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const pageId = 79;

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole === "registrar") {
        checkAccess(storedID);
      } else {
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const checkAccess = async (userID) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/page_access/${userID}/${pageId}`
      );
      if (response.data && response.data.page_privilege === 1) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const results = passwordRules.map((rule) => rule.test(newPassword));
    setValidations(results);
  }, [newPassword]);

  const isValid = validations.every(Boolean) && newPassword === confirmPassword;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const person_id = localStorage.getItem("person_id");
      const response = await axios.post(
        "http://localhost:5000/registrar-change-password",
        {
          person_id,
          currentPassword,
          newPassword,
        }
      );

      setSnack({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || "Error updating password.",
        severity: "error",
      });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // 🔒 Disable right-click and DevTools
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const blockKeys = (e) => {
      const isBlockedKey =
        e.key === "F12" ||
        e.key === "F11" ||
        (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === "i" || e.key.toLowerCase() === "j")) ||
        (e.ctrlKey && e.key.toLowerCase() === "u") ||
        (e.ctrlKey && e.key.toLowerCase() === "p");
      if (isBlockedKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  // 🔄 Access and loading handling
  if (loading || hasAccess === null) {
    return <LoadingOverlay open={loading} message="Checking Access..." />;
  }

  if (!hasAccess) {
    return <Unauthorized />;
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        backgroundColor: "transparent",
      }}
    >
      {/* 🔝 Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "maroon",
            fontSize: "36px",
          }}
        >
          REGISTRAR RESET PASSWORD
        </Typography>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      {/* 🔒 Password Form Section */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Paper
          elevation={6}
          sx={{
            p: 3,
            width: "40%",
            maxWidth: "540px",
            borderRadius: 4,
            backgroundColor: "#fff",
            border: "2px solid maroon",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
            mb: 12,
          }}
        >
          {/* Lock Icon Header */}
          <Box textAlign="center" mb={2}>
            <LockReset
              sx={{
                fontSize: 80,
                color: "#800000",
                backgroundColor: "#f0f0f0",
                borderRadius: "50%",
                p: 1,
              }}
            />
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, color: "#800000" }}>
              Reset Your Password
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Update your password to keep your account secure.
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Form */}
          <form onSubmit={handleUpdate}>
            <Box mb={2}>
              <InputLabel>Current Password</InputLabel>
              <TextField
                fullWidth
                type={showPassword.current ? "text" : "password"}
                size="small"
                variant="outlined"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => toggleShowPassword("current")} edge="end">
                        {showPassword.current ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box mb={2}>
              <InputLabel>New Password</InputLabel>
              <TextField
                fullWidth
                type={showPassword.new ? "text" : "password"}
                size="small"
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => toggleShowPassword("new")} edge="end">
                        {showPassword.new ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box mb={2}>
              <InputLabel>Confirm Password</InputLabel>
              <TextField
                fullWidth
                type={showPassword.confirm ? "text" : "password"}
                size="small"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={Boolean(confirmPassword && confirmPassword !== newPassword)}
                helperText={
                  confirmPassword && confirmPassword !== newPassword
                    ? "Passwords do not match"
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => toggleShowPassword("confirm")} edge="end">
                        {showPassword.confirm ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Your new password must include:
            </Typography>

            <List dense disablePadding>
              {passwordRules.map((rule, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    {validations[i] ? (
                      <CheckCircle sx={{ color: "green" }} />
                    ) : (
                      <Cancel sx={{ color: "red" }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={rule.label} />
                </ListItem>
              ))}
            </List>

            <Typography variant="body2" color="warning.main" sx={{ mt: 1, mb: 2 }}>
              Note: You are required to change your password to continue using the system securely.
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isValid}
              sx={{
                py: 1.2,
                borderRadius: 2,
                backgroundColor: "#1976d2",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Update Password
            </Button>
          </form>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrarResetPassword;

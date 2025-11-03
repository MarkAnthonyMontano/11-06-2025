import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    TextField,
    Input,
    InputLabel,
    Typography,
    Paper,
    Box,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

function Settings({ onUpdate }) {
    // User states
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");

    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const pageId = 80;

    // ✅ New state for short term
    const [shortTerm, setShortTerm] = useState("");

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
        try {
            const response = await axios.get(`http://localhost:5000/api/page_access/${userID}/${pageId}`);
            if (response.data && response.data.page_privilege === 1) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setHasAccess(false);
            setLoading(false);
        }
    };

    // Settings states
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [logo, setLogo] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null);
    const [bgImage, setBgImage] = useState(null);
    const [previewBg, setPreviewBg] = useState(null);
    const [headerColor, setHeaderColor] = useState("#ffffff");
    const [footerText, setFooterText] = useState("");
    const [footerColor, setFooterColor] = useState("#ffffff");

    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const handleCloseSnack = (_, reason) => {
        if (reason === "clickaway") return;
        setSnack((prev) => ({ ...prev, open: false }));
    };

    // ✅ Fetch settings (including short_term)
    useEffect(() => {
        axios
            .get("http://localhost:5000/api/settings")
            .then((response) => {
                const {
                    company_name,
                    short_term,
                    address,
                    logo_url,
                    bg_image,
                    header_color,
                    footer_text,
                    footer_color,
                } = response.data;
                setCompanyName(company_name || "");
                setShortTerm(short_term || "");
                setAddress(address || "");
                setPreviewLogo(logo_url ? `http://localhost:5000${logo_url}` : null);
                setPreviewBg(bg_image ? `http://localhost:5000${bg_image}` : null);
                setHeaderColor(header_color || "#ffffff");
                setFooterText(footer_text || "");
                setFooterColor(footer_color || "#ffffff");
            })
            .catch((error) => {
                console.error("Error fetching settings:", error);
                setSnack({
                    open: true,
                    message: "Failed to fetch settings",
                    severity: "error",
                });
            });
    }, []);

    // ✅ Submit form
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("company_name", companyName || "");
        formData.append("short_term", shortTerm || ""); // <-- NEW FIELD
        formData.append("address", address || "");
        if (logo) formData.append("logo", logo);
        if (bgImage) formData.append("bg_image", bgImage);
        formData.append("header_color", headerColor || "#ffffff");
        formData.append("footer_text", footerText || "");
        formData.append("footer_color", footerColor || "#ffffff");

        try {
            await axios.post("http://localhost:5000/api/settings", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (typeof onUpdate === "function") {
                await onUpdate();
            }

            setSnack({
                open: true,
                message: "Settings updated successfully!",
                severity: "success",
            });
        } catch (error) {
            console.error("Error updating settings:", error);
            setSnack({
                open: true,
                message: "Error updating settings",
                severity: "error",
            });
        }
    };

    // Access handling
    if (loading || hasAccess === null) {
        return <LoadingOverlay open={loading} message="Check Access" />;
    }

    if (!hasAccess) {
        return <Unauthorized />;
    }

    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                backgroundColor: "transparent",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "40px 0",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 3,
                    width: "50%",
                    maxWidth: "600px",
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    border: "2px solid maroon",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                    mb: 12,
                }}
            >
                <Box textAlign="center" mb={2}>
                    <SettingsIcon
                        sx={{
                            fontSize: 80,
                            color: "#800000",
                            backgroundColor: "#e3f2fd",
                            borderRadius: "50%",
                            p: 1,
                        }}
                    />
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{ mt: 1, color: "#800000" }}
                    >
                        Customize Your Settings
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <form onSubmit={handleSubmit}>
                    {/* ✅ School Name */}
                    <Box mb={2}>
                        <InputLabel>School Name</InputLabel>
                        <TextField
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    {/* ✅ Short Term (Abbreviation) */}
                    <Box mb={2}>
                        <InputLabel>Short Term</InputLabel>
                        <TextField
                            value={shortTerm}
                            onChange={(e) => setShortTerm(e.target.value)}
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder="School Short Name Called"
                        />
                    </Box>

                    {/* ✅ Address */}
                    <Box mb={2}>
                        <InputLabel>Address</InputLabel>
                        <TextField
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    {/* ✅ Logo Upload */}
                    <Box mb={2}>
                        <InputLabel>Logo</InputLabel>
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setLogo(file);
                                setPreviewLogo(URL.createObjectURL(file));
                            }}
                            fullWidth
                        />
                        {previewLogo && (
                            <Box
                                component="img"
                                src={previewLogo}
                                alt="Logo Preview"
                                sx={{
                                    width: "100px",
                                    height: "100px",
                                    mt: 1,
                                    mx: "auto",
                                    display: "block",
                                    border: "2px solid #1976d2",
                                    borderRadius: "3px",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                    </Box>

                    {/* ✅ Background Image Upload */}
                    <Box mb={2}>
                        <InputLabel>Background Image</InputLabel>
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setBgImage(file);
                                setPreviewBg(URL.createObjectURL(file));
                            }}
                            fullWidth
                        />
                        {previewBg && (
                            <Box
                                component="img"
                                src={previewBg}
                                alt="Background Preview"
                                sx={{
                                    width: "100%",
                                    height: "180px",
                                    mt: 1,
                                    border: "2px solid #1976d2",
                                    borderRadius: "3px",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                    </Box>

                    {/* ✅ Header Color */}
                    <Box mb={2}>
                        <InputLabel>Header Color</InputLabel>
                        <Input
                            type="color"
                            value={headerColor}
                            onChange={(e) => setHeaderColor(e.target.value)}
                            fullWidth
                            sx={{ height: "40px", cursor: "pointer" }}
                        />
                    </Box>

                    {/* ✅ Footer Text */}
                    <Box mb={2}>
                        <InputLabel>Footer Text</InputLabel>
                        <TextField
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            fullWidth
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    {/* ✅ Footer Color */}
                    <Box mb={2}>
                        <InputLabel>Footer Color</InputLabel>
                        <Input
                            type="color"
                            value={footerColor}
                            onChange={(e) => setFooterColor(e.target.value)}
                            fullWidth
                            sx={{ height: "40px", cursor: "pointer" }}
                        />
                    </Box>

                    {/* ✅ Save Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            py: 1.2,
                            borderRadius: 2,
                            backgroundColor: "#1976d2",
                            textTransform: "none",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#1565c0" },
                        }}
                    >
                        Save Settings
                    </Button>
                </form>
            </Paper>

            {/* ✅ Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={handleCloseSnack}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snack.severity}
                    onClose={handleCloseSnack}
                    sx={{ width: "100%" }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Settings;

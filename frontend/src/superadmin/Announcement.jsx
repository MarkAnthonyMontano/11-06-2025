import { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Grid,
    DialogContent,
    DialogActions,
    IconButton,
    Box,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import { Dialog } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Announcement() {
    const [announcements, setAnnouncements] = useState([]);
    const [openImage, setOpenImage] = useState(null);
    const [image, setImage] = useState(null);

    const [form, setForm] = useState({
        title: "",
        content: "",
        valid_days: "7",
        target_role: "",
    });
    const [editingId, setEditingId] = useState(null);

    // Example: current logged-in admin
    const currentUser = {
        id: 1,
        role: "faculty",
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/announcements");
            setAnnouncements(res.data);
        } catch (err) {
            console.error("Error fetching announcements:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("content", form.content);
            formData.append("valid_days", form.valid_days);
            formData.append("target_role", form.target_role);
            formData.append("creator_role", currentUser.role);
            formData.append("creator_id", currentUser.id);

            if (image) formData.append("image", image);

            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/announcements/${editingId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
            } else {
                await axios.post("http://localhost:5000/api/announcements", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            setForm({ title: "", content: "", valid_days: "7", target_role: "" });
            setImage(null);
            setEditingId(null);
            fetchAnnouncements();
        } catch (err) {
            console.error("Error creating/updating announcement:", err);
        }
    };

    const handleEdit = (announcement) => {
        setForm({
            title: announcement.title,
            content: announcement.content,
            valid_days: announcement.valid_days.toString(),
            target_role: announcement.target_role,
        });
        setEditingId(announcement.id);
        setImage(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?"))
            return;

        try {
            await axios.delete(`http://localhost:5000/api/announcements/${id}`);
            fetchAnnouncements();
        } catch (err) {
            console.error("Error deleting announcement:", err);
        }
    };



    return (
        <>
            {/* Header */}
            <Box >
                <Box display="flex" alignItems="center">
                    <CampaignIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h4" fontWeight="bold" color="maroon">
                 ANNOUNCEMENT
                    </Typography>
                </Box>
                <br />
                <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            </Box>

            {/* Main */}
            <Container maxWidth="lg" sx={{ py: 2, height: "calc(100vh - 150px)" }}>
                <Grid container spacing={4} sx={{ height: "100%" }}>
                    {/* Left: Form */}
                    <Grid item xs={12} md={5}>
                        <PaperForm
                            form={form}
                            setForm={setForm}
                            handleSubmit={handleSubmit}
                            editingId={editingId}
                            image={image}
                            setImage={setImage}
                        />
                    </Grid>

                    {/* Right: Active Announcements */}
                    <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", height: "95%" }}>
                        <Box
                            sx={{
                                flexGrow: 1,
                                overflowY: "auto",
                                height: "100%",
                                pr: 1,
                                
                                p: 2,
                                border: "2px solid maroon",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h5" gutterBottom sx={{ color: "maroon" }}>
                                Active Announcements
                            </Typography>

                            {announcements.length === 0 ? (
                                <Typography color="text.secondary">No active announcements.</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {announcements.map((a) => (
                                        <Grid item xs={12} key={a.id}>
                                            <Card elevation={3} sx={{ borderRadius: 2, border: "2px solid maroon" }}>
                                                <CardContent>
                                                    <Typography variant="h6">{a.title}</Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        {a.content}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        For: {a.target_role}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Expires: {new Date(a.expires_at).toLocaleString()}
                                                    </Typography>

                                                    {a.file_path && (
                                                        <>
                                                            <img
                                                                src={`http://localhost:5000/uploads/${a.file_path}`}
                                                                alt={a.title}
                                                                style={{
                                                                    width: "100%",

                                                                    objectFit: "cover",
                                                                    borderRadius: "6px",
                                                                    marginBottom: "6px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() =>
                                                                    setOpenImage(`http://localhost:5000/uploads/${a.file_path}`)
                                                                }
                                                            />

                                                            <Dialog
                                                                open={Boolean(openImage)}
                                                                onClose={() => setOpenImage(null)}
                                                                fullScreen
                                                                PaperProps={{
                                                                    style: {
                                                                        backgroundColor: "transparent",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        position: "relative",
                                                                        boxShadow: "none",
                                                                        cursor: "pointer",
                                                                    },
                                                                }}
                                                            >
                                                                {/* Clicking outside image closes dialog */}
                                                                <Box
                                                                    onClick={() => setOpenImage(null)}
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        zIndex: 1,
                                                                    }}
                                                                />

                                                                {/* Back Button */}
                                                                <IconButton
                                                                    onClick={() => setOpenImage(null)}
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 20,
                                                                        left: 20,
                                                                        backgroundColor: "white",
                                                                        width: 70,
                                                                        height: 70,
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        zIndex: 2,
                                                                        "&:hover": { backgroundColor: "#f5f5f5" },
                                                                    }}
                                                                >
                                                                    <KeyboardBackspaceIcon sx={{ fontSize: 50, color: "black" }} />
                                                                </IconButton>

                                                                {/* Fullscreen Image */}
                                                                <Box
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    sx={{
                                                                        position: "relative",
                                                                        zIndex: 2,
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                        maxWidth: "100%",
                                                                        maxHeight: "100%",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={openImage}
                                                                        alt="Preview"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "90%",
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Dialog>
                                                        </>
                                                    )}
                                                </CardContent>

                                                <CardActions>
                                                    <Button
                                                        size="small"
                                                        style={{
                                                            border: "2px solid black",
                                                            backgroundColor: "green",
                                                            color: "white",
                                                        }}
                                                        onClick={() => handleEdit(a)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        style={{
                                                            border: "2px solid black",
                                                            backgroundColor: "maroon",
                                                            color: "white",
                                                        }}
                                                        onClick={() => handleDelete(a.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}


function PaperForm({ form, setForm, handleSubmit, editingId, image, setImage }) {
    // Local state for modal preview
    const [openModal, setOpenModal] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    // File input handler → store in tempImage first
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTempImage(file);
            setOpenModal(true); // open preview modal
        }
    };

    // Confirm upload → move tempImage to actual image
    // Confirm upload → move tempImage to actual image
    const handleConfirm = () => {
        setImage(tempImage);
        setOpenModal(false);
        setTempImage(null);
    };

    // Cancel upload → discard tempImage
    const handleCancel = () => {
        setTempImage(null);
        setOpenModal(false);
    };

    // Remove currently selected image
    const handleRemoveImage = () => {
        setImage(null);
    };


    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: 2,
                color: "#800000",
                border: "2px solid maroon",
            }}
        >
            <Typography variant="h6" gutterBottom>
                {editingId ? "Edit Announcement" : "Create New Announcement"}
            </Typography>

            <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
            />

            <TextField
                label="Content"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Valid For</InputLabel>
                <Select
                    value={form.valid_days}
                    label="Valid For"
                    onChange={(e) => setForm({ ...form, valid_days: e.target.value })}
                >
                    <MenuItem value="1">1 Day</MenuItem>
                    <MenuItem value="3">3 Days</MenuItem>
                    <MenuItem value="7">7 Days</MenuItem>
                    <MenuItem value="14">14 Days</MenuItem>
                    <MenuItem value="30">30 Days</MenuItem>
                    <MenuItem value="60">60 Days</MenuItem>
                    <MenuItem value="90">90 Days</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Target Role</InputLabel>
                <Select
                    value={form.target_role}
                    label="Target Role"
                    onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                    required
                >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="faculty">Faculty</MenuItem>
                    <MenuItem value="applicant">Applicant</MenuItem>
                </Select>
            </FormControl>

            {/* Upload Section */}
            {/* Upload Section */}
            <Box mt={2}>
                <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{
                        border: "2px dashed maroon",
                        bgcolor: "maroon",
                        color: "white",
                        "&:hover": { bgcolor: "#800000" },
                        py: 1.5,
                        fontWeight: "bold",
                        textTransform: "none",
                    }}
                >
                    Upload Announcement Image
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>

                {/* Replace the current image preview section with this */}
                {image && (
                    <Box
                        sx={{
                            position: "relative",
                            mt: 2,
                            p: 2,
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            bgcolor: "#f5f5f5",
                            display: "flex",
                            height: "50px",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography noWrap sx={{ mr: 2 }}>
                            {image.name} {/* Show the file name instead of image */}
                        </Typography>
                        <IconButton
                            onClick={handleRemoveImage}
                            sx={{
                                width: "20px",
                                height: "20px",
                                backgroundColor: "rgba(255,255,255,0.8)",
                                "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                            }}
                        >
                            ✕
                        </IconButton>
                    </Box>
                )}

            </Box>

            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
                {editingId ? "Update Announcement" : "Create Announcement"}
            </Button>

            {/* Image Preview Modal */}
            <Dialog open={openModal} onClose={handleCancel} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: "center" }}>
                    {tempImage && (
                        <img
                            src={URL.createObjectURL(tempImage)}
                            alt="Preview"
                            style={{ maxWidth: "100%", borderRadius: "8px" }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button variant="contained" onClick={handleConfirm} sx={{ bgcolor: "maroon" }}>
                        Confirm
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} color="error">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Announcement;
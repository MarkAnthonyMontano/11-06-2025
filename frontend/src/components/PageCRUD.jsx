import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slide,
    Tooltip,
    Snackbar,
    Alert,
} from "@mui/material";
import { IoMdAddCircle } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const PageCRUD = () => {
    const [pages, setPages] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentPageId, setCurrentPageId] = useState(null);
    const [pageDescription, setPageDescription] = useState("");
    const [pageGroup, setPageGroup] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

    const mainColor = "#7E0000";

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/pages");
            setPages(response.data);
        } catch (error) {
            console.error("Error fetching pages:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { page_description: pageDescription, page_group: pageGroup };

        try {
            if (currentPageId) {
                await axios.put(`http://localhost:5000/api/pages/${currentPageId}`, data);
                setSnackbar({ open: true, message: "Page updated successfully!", type: "success" });
            } else {
                await axios.post("http://localhost:5000/api/pages", data);
                setSnackbar({ open: true, message: "Page added successfully!", type: "success" });
            }
            fetchPages();
            handleClose();
        } catch (error) {
            console.error("Error saving page:", error);
            setSnackbar({ open: true, message: "Error saving page", type: "error" });
        }
    };

    const handleEdit = (page) => {
        setCurrentPageId(page.id);
        setPageDescription(page.page_description);
        setPageGroup(page.page_group);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this page?")) {
            try {
                await axios.delete(`http://localhost:5000/api/pages/${id}`);
                fetchPages();
                setSnackbar({ open: true, message: "Page deleted successfully!", type: "success" });
            } catch (error) {
                console.error("Error deleting page:", error);
                setSnackbar({ open: true, message: "Error deleting page", type: "error" });
            }
        }
    };

    const handleOpen = () => {
        resetForm();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setCurrentPageId(null);
        setPageDescription("");
        setPageGroup("");
    };

    useEffect(() => {
        document.addEventListener("contextmenu", (e) => e.preventDefault());
        document.addEventListener("keydown", (e) => {
            const blocked =
                e.key === "F12" ||
                e.key === "F11" ||
                (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && ["u", "p"].includes(e.key.toLowerCase()));
            if (blocked) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }, []);

    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mt: 2,
                    mb: 2,
                    px: 2,
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
                    PAGE MANAGEMENT
                </Typography>
            </Box>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Button
                variant="contained"
                startIcon={<IoMdAddCircle size={20} />}
                onClick={handleOpen}
                sx={{
                    bgcolor: mainColor,
                    "&:hover": { bgcolor: `${mainColor}CC` },
                    borderRadius: "10px",
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    fontSize: "16px",
                }}
            >
                Add New Page
            </Button>

            <div style={{ height: "30px" }}></div>

            {/* Pages Table */}
            <Paper
                elevation={4}
                sx={{
                    border: "2px solid maroon",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: mainColor }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold", border: "2px solid maroon" }}>#</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", border: "2px solid maroon" }}>Page Description</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold", border: "2px solid maroon" }}>Page Group</TableCell>
                                <TableCell align="center" sx={{ color: "white", fontWeight: "bold", border: "2px solid maroon" }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pages.length > 0 ? (
                                pages.map((page, index) => (
                                    <TableRow key={page.id} hover>
                                        <TableCell style={{  border: "2px solid maroon"}}>{index + 1}</TableCell>
                                        <TableCell style={{  border: "2px solid maroon"}}>{page.page_description}</TableCell>
                                        <TableCell style={{  border: "2px solid maroon"}}>{page.page_group}</TableCell>
                                        <TableCell style={{  border: "2px solid maroon"}} align="center">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    backgroundColor: "#4CAF50",
                                                    color: "white",
                                                    marginRight: 1,
                                                    "&:hover": { backgroundColor: "#45A049" },
                                                }}
                                                onClick={() => handleEdit(page)}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    backgroundColor: "#B22222",
                                                    color: "white",
                                                    "&:hover": { backgroundColor: "#8B0000" },
                                                }}
                                                onClick={() => handleDelete(page.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No pages found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                keepMounted
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        bgcolor: mainColor,
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                    }}
                >
                    {currentPageId ? "Edit Page" : "Add New Page"}
                </DialogTitle>
                <DialogContent dividers sx={{ py: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Page Description"
                            variant="outlined"
                            margin="normal"
                            value={pageDescription}
                            onChange={(e) => setPageDescription(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Page Group"
                            variant="outlined"
                            margin="normal"
                            value={pageGroup}
                            onChange={(e) => setPageGroup(e.target.value)}
                            required
                        />
                    </form>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ bgcolor: mainColor, "&:hover": { bgcolor: `${mainColor}CC` } }}
                    >
                        {currentPageId ? "Update Page" : "Add Page"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.type}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PageCRUD;

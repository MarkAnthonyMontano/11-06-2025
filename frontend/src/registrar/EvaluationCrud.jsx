import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, TableContainer, Table, Snackbar, Alert, TableHead, TableBody, TableRow, TableCell, Paper, Divider, Button, FormControl, Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

const EvaluationCRUD = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [schoolYears, setSchoolYears] = useState([]);
    const [schoolSemester, setSchoolSemester] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState('');
    const [selectedActiveSchoolYear, setSelectedActiveSchoolYear] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({
        question: "",
        choice1: "",
        choice2: "",
        choice3: "",
        choice4: "",
        choice5: ""
    });

    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const pageId = 26;

    //
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
            if (error.response && error.response.data.message) {
                console.log(error.response.data.message);
            } else {
                console.log("An unexpected error occurred.");
            }
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get("http://localhost:5000/get_questions");
            setQuestions(response.data);
        } catch (err) {
            console.error("Error fetching questions:", err);
        }
    };

    const maxButtonsToShow = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const totalPages = Math.ceil(questions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/get_school_year/`)
            .then((res) => setSchoolYears(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`http://localhost:5000/get_school_semester/`)
            .then((res) => setSchoolSemester(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {

        axios
            .get(`http://localhost:5000/active_school_year`)
            .then((res) => {
                if (res.data.length > 0) {
                    setSelectedSchoolYear(res.data[0].year_id);
                    setSelectedSchoolSemester(res.data[0].semester_id);
                }
            })
            .catch((err) => console.error(err));

    }, []);

    useEffect(() => {
        if (selectedSchoolYear && selectedSchoolSemester) {
            axios
                .get(`http://localhost:5000/get_selecterd_year/${selectedSchoolYear}/${selectedSchoolSemester}`)
                .then((res) => {
                    if (res.data.length > 0) {
                        setSelectedActiveSchoolYear(res.data[0].school_year_id);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [selectedSchoolYear, selectedSchoolSemester]);


    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [totalPages]);

    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage < maxButtonsToShow - 1) {
        startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    const visiblePages = [];

    for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
    }

    const filteredQuestion = questions
        .filter((s) => {
            const matchesYear =
                selectedSchoolYear === "" || String(s.year_id) === String(selectedSchoolYear);

            const matchesSemester =
                selectedSchoolSemester === "" || String(s.semester_id) === String(selectedSchoolSemester);

            return matchesYear && matchesSemester
        })

    const handleSchoolYearChange = (event) => {
        setSelectedSchoolYear(event.target.value);
    };

    const handleSchoolSemesterChange = (event) => {
        setSelectedSchoolSemester(event.target.value);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSaveQuestion = async () => {
        try {
            if (editMode) {
                const response = await axios.put(
                    `http://localhost:5000/update_question/${selectedId}`,
                    formData
                );
                setSnackbarMessage(response.data.message);
                setOpenSnackbar(true);
            } else {
                const response = await axios.post("http://localhost:5000/insert_question", {
                    ...formData,
                    school_year_id: selectedActiveSchoolYear, // ✅ include this
                });
                setSnackbarMessage(response.data.message);
                setOpenSnackbar(true);
            }
            setFormData({ question: "", choice1: "", choice2: "", choice3: "", choice4: "", choice5: "" });
            setOpenDialog(false);
            setEditMode(false);
            setSelectedId(null);
            fetchQuestions();
        } catch (err) {
            console.error("Error saving question:", err);
            alert("Failed to save question");
        }
    };

    const handleEdit = (question) => {
        setFormData({
            question: question.question_description,
            choice1: question.first_choice,
            choice2: question.second_choice,
            choice3: question.third_choice,
            choice4: question.fourth_choice,
            choice5: question.fifth_choice,
        });
        setSelectedId(question.id);
        setEditMode(true);
        setOpenDialog(true);
    };

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



    // Put this at the very bottom before the return 
    if (loading || hasAccess === null) {
        return <LoadingOverlay open={loading} message="Check Access" />;
    }

    if (!hasAccess) {
        return (
            <Unauthorized />
        );
    }

    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", pr: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >
                <Typography variant="h4" fontWeight="bold" color="maroon">
                    EVALUATION MANAGEMENT
                </Typography>
            </Box>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />
            <TableContainer component={Paper} sx={{ width: '100%' }}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: '#6D2323', color: "white" }}>
                        <TableRow>
                            <TableCell
                                colSpan={10}
                                sx={{
                                    border: "2px solid maroon",
                                    py: 0.5,
                                    backgroundColor: '#6D2323',
                                    color: "white"
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography fontSize="14px" fontWeight="bold" color="white">
                                        QUESTION LISTS
                                    </Typography>

                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                minWidth: 80,
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                },
                                                '&.Mui-disabled': {
                                                    color: "white",
                                                    borderColor: "white",
                                                    backgroundColor: "transparent",
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            First
                                        </Button>

                                        <Button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                minWidth: 80,
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                },
                                                '&.Mui-disabled': {
                                                    color: "white",
                                                    borderColor: "white",
                                                    backgroundColor: "transparent",
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            Prev
                                        </Button>

                                        {/* Page Dropdown */}
                                        <FormControl size="small" sx={{ minWidth: 80 }}>
                                            <Select
                                                value={currentPage}
                                                onChange={(e) => setCurrentPage(Number(e.target.value))}
                                                displayEmpty
                                                sx={{
                                                    fontSize: '12px',
                                                    height: 36,
                                                    color: 'white',
                                                    border: '1px solid white',
                                                    backgroundColor: 'transparent',
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white',
                                                    },
                                                    '& svg': {
                                                        color: 'white',
                                                    }
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            maxHeight: 200,
                                                            backgroundColor: '#fff',
                                                        }
                                                    }
                                                }}
                                            >
                                                {Array.from({ length: totalPages }, (_, i) => (
                                                    <MenuItem key={i + 1} value={i + 1}>
                                                        Page {i + 1}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Typography fontSize="11px" color="white">
                                            of {totalPages} page{totalPages > 1 ? 's' : ''}
                                        </Typography>

                                        <Button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                minWidth: 80,
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                },
                                                '&.Mui-disabled': {
                                                    color: "white",
                                                    borderColor: "white",
                                                    backgroundColor: "transparent",
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            Next
                                        </Button>

                                        <Button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                minWidth: 80,
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                },
                                                '&.Mui-disabled': {
                                                    color: "white",
                                                    borderColor: "white",
                                                    backgroundColor: "transparent",
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            Last
                                        </Button>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
            <TableContainer
                component={Paper}
                sx={{
                    width: "100%",
                    border: "2px solid #800000",
                }}
            >
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        startIcon={<AddIcon />}
                                        variant="contained"
                                        onClick={() => {

                                            setOpenDialog(true);
                                        }}
                                        sx={{
                                            backgroundColor: "default",
                                            color: "white",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            width: "350px",
                                            "&:hover": { backgroundColor: "#6D2323" },
                                        }}
                                    >
                                        Add Evaluation Question
                                    </Button>

                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                        <FormControl sx={{ width: "350px" }} size="small">
                                            <InputLabel>
                                                Filter by School Year
                                            </InputLabel>
                                            <Select
                                                label="Filter by School Year"
                                                value={selectedSchoolYear}
                                                onChange={handleSchoolYearChange}
                                            >
                                                {schoolYears.length > 0 ? (
                                                    schoolYears.map((sy) => (
                                                        <MenuItem value={sy.year_id} key={sy.year_id}>
                                                            {sy.current_year} - {sy.next_year}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>School Year is not found</MenuItem>
                                                )
                                                }
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ width: "350px" }} size="small">
                                            <InputLabel>
                                                Filter by School Semester
                                            </InputLabel>
                                            <Select
                                                label="Filter by School Semester"
                                                value={selectedSchoolSemester}
                                                onChange={handleSchoolSemesterChange}
                                            >
                                                {schoolSemester.length > 0 ? (
                                                    schoolSemester.map((sem) => (
                                                        <MenuItem value={sem.semester_id} key={sem.semester_id}>
                                                            {sem.semester_description}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>School Semester is not found</MenuItem>
                                                )
                                                }
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <TableContainer component={Paper} sx={{ border: "2px solid maroon", marginTop: "2rem" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#6D2323" }}>
                        <TableRow>
                            <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center", border: "2px solid maroon" }} colSpan={7}>QUESTIONS</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center", border: "2px solid maroon" }} rowSpan={2} colSpan={2}>Action</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ color: "white", width: "1rem", textAlign: "center", border: "2px solid maroon" }}>#</TableCell>
                            <TableCell sx={{ color: "white", width: "40rem", textAlign: "center", border: "2px solid maroon" }}>Description</TableCell>
                            <TableCell sx={{ color: "white", width: "9rem", textAlign: "center", border: "2px solid maroon" }}>Choice 1</TableCell>
                            <TableCell sx={{ color: "white", width: "9rem", textAlign: "center", border: "2px solid maroon" }}>Choice 2</TableCell>
                            <TableCell sx={{ color: "white", width: "9rem", textAlign: "center", border: "2px solid maroon" }}>Choice 3</TableCell>
                            <TableCell sx={{ color: "white", width: "9rem", textAlign: "center", border: "2px solid maroon" }}>Choice 4</TableCell>
                            <TableCell sx={{ color: "white", width: "9rem", textAlign: "center", border: "2px solid maroon" }}>Choice 5</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredQuestion.length > 0 ? (
                            filteredQuestion.map((q, index) => (
                                <TableRow key={q.question_id}>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{index + 1}</TableCell>
                                    <TableCell style={{ padding: "0px 20px", border: "2px solid maroon" }}>{q.question_description}</TableCell>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{q.first_choice}</TableCell>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{q.second_choice}</TableCell>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{q.third_choice}</TableCell>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{q.fourth_choice}</TableCell>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{q.fifth_choice}</TableCell>
                                    <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>
                                        <Button style={{ background: "#4CAF50", color: "white", width: "100px" }} onClick={() => handleEdit(q)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No questions found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ color: "maroon", fontWeight: "bold" }}>
                    {editMode ? "Edit Question" : "Add New Question"}
                </DialogTitle>
                <hr style={{ border: "1px solid #ccc", width: "100%" }} />

                <DialogContent sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="Question Description"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField label="Choice 1" name="choice1" value={formData.choice1} onChange={handleChange} fullWidth />
                        <TextField label="Choice 2" name="choice2" value={formData.choice2} onChange={handleChange} fullWidth />
                        <TextField label="Choice 3" name="choice3" value={formData.choice3} onChange={handleChange} fullWidth />
                        <TextField label="Choice 4" name="choice4" value={formData.choice4} onChange={handleChange} fullWidth />
                        <TextField label="Choice 5" name="choice5" value={formData.choice5} onChange={handleChange} fullWidth />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveQuestion}
                        sx={{
                            backgroundColor: "#800000",
                            "&:hover": { backgroundColor: "#6D2323" },
                            fontWeight: "bold",
                        }}
                    >
                        {editMode ? "Save Changes" : "Insert Question"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity="success" sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default EvaluationCRUD;
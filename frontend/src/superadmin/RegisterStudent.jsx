import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    TextField,
    Button,
    Typography,
    Avatar,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    Paper,
    TableHead,
    TableRow,
    Alert,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { FileUpload } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";


const RegisterStudents = () => {

    // Also put it at the very top
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");

    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);


    const pageId = 80;

    //Put this After putting the code of the past code
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

    const [department, setDepartment] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [Students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [file, setFile] = useState(null);
    const [form, setForm] = useState({
        student_number: "",
        last_name: "",
        middle_name: "",
        first_name: "",
        role: "student",
        email: "",
        password: "",
        status: "",
        dprtmnt_id: "",
        profile_picture: null,
        preview: "",

    });
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    useEffect(() => {
        fetchDepartments();
        fetchPrograms();
        fetchStudents();
    }, []);

    // 📥 Fetch Departments
    const fetchDepartments = async () => {
        try {
            const res = await axios.get("http://localhost:5000/get_department");
            setDepartment(res.data);
        } catch (err) {
            console.error("❌ Department fetch error:", err);
            setErrorMessage("Failed to load department list");
        }
    };

    const fetchPrograms = async (dprtmnt_id) => {
        if (!dprtmnt_id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/applied_program/${dprtmnt_id}`);
            setPrograms(res.data);
        } catch (err) {
            console.error("❌ Department fetch error:", err);
            setErrorMessage("Failed to load department list");
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/students");
            setStudents(res.data);
        } catch (err) {
            console.error("❌ Student fetch error:", err);
            setErrorMessage("Failed to load Student accounts");
        }
    };

    // Handle form field changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();

            // ✅ Append all fields properly
            fd.append("student_number", form.student_number);
            fd.append("last_name", form.last_name);
            fd.append("middle_name", form.middle_name);
            fd.append("first_name", form.first_name);
            fd.append("email", form.email);
            fd.append("password", form.password);
            fd.append("status", form.status || 1);
            fd.append("dprtmnt_id", form.dprtmnt_id);
            fd.append("curriculum_id", form.curriculum_id);
            if (form.profile_picture) fd.append("profile_picture", form.profile_picture);

            const url = editData
                ? `http://localhost:5000/update_student/${editData.user_id}`
                : "http://localhost:5000/register_student";

            if (editData) {
                await axios.put(url, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                fetchStudents();
            } else {
                await axios.post(url, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            // ✅ Success flow
            setOpenSnackbar(true);
            setOpenDialog(false);
            setEditData(null);
            setForm({
                student_number: "",
                last_name: "",
                middle_name: "",
                first_name: "",
                role: "student",
                email: "",
                password: "",
                status: 1,
                dprtmnt_id: "",
                curriculum_id: "",
                profile_picture: null,
                preview: "",
            });
            fetchStudents();
        } catch (err) {
            console.error("❌ Submit error:", err);
            setErrorMessage(err.response?.data?.message || "Something went wrong");
        }
    };

    const handleEdit = (r) => {
        setEditData(r);
        setForm({
            student_number: r.student_number || "",
            first_name: r.first_name || "",
            middle_name: r.middle_name || "",
            last_name: r.last_name || "",
            email: r.email || "",
            password: "",
            role: r.role || "student",
            status: r.status,
            dprtmnt_id: r.dprtmnt_id || "",
            curriculum_id: r.curriculum_id || "",
            program_id: r.program_id || "",
        });
        if (r.dprtmnt_id) fetchPrograms(r.dprtmnt_id);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditData(null);
    };

    // Export CSV
    const handleExportCSV = () => {
        if (Students.length === 0) return alert("No data to export!");

        const headers = ["Student Number", "Full Name", "Email", "Department", "Program", "Status"];
        const rows = Students.map((r) => [
            r.student_number,
            `${r.first_name} ${r.middle_name || ""} ${r.last_name}`,
            r.email,
            `${r.dprtmnt_name || "N/A"} (${r.dprtmnt_code})`,
            `${r.program_description || "N/A"} (${r.program_code})`,
            r.status === 1 ? "Active" : "Inactive",
        ]);
        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "Students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportFile = async () => {
        if (!file) {
            alert("Please select an Excel file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:5000/import_xslx_student", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert(res.data.message || "File imported successfully!");
        } catch (err) {
            console.error("❌ Import failed:", err);
            alert("Error importing file");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            await axios.put(`http://localhost:5000/update_student_status/${id}`, { status: newStatus });
            fetchStudents(); // 🔄 refresh list
        } catch (error) {
            console.error("❌ Error toggling status:", error);
            setErrorMessage("Failed to update status");
        }
    };

    const filteredStudent = Students
        .filter((r) =>
            selectedDepartmentFilter
                ? r.dprtmnt_name === selectedDepartmentFilter
                : true
        )
        .sort((a, b) => {
            if (sortOrder === "asc") return a.last_name.localeCompare(b.last_name);
            if (sortOrder === "desc") return b.last_name.localeCompare(a.last_name);
            return 0;
        });

    const totalPages = Math.ceil(filteredStudent.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudent = filteredStudent.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [filteredStudent.length, totalPages]);

    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage < maxButtonsToShow - 1) {
        startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    const visiblePages = [];
    for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
    }


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
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", pr: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {/* Left: Header */}
                <Typography variant="h4" fontWeight="bold" color="maroon">
                    STUDENTS ACCOUNTS
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
                                    {/* Left: Student List Count */}
                                    <Typography fontSize="14px" fontWeight="bold" color="white">
                                        Total Number of Students in List: {filteredStudent.length}
                                    </Typography>

                                    {/* Right: Pagination Controls */}
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
            {/* 🔧 Control Bar Section */}
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
                                    {/* ➕ Left: Add Student Button */}
                                    <Button
                                        startIcon={<AddIcon />}
                                        variant="contained"
                                        onClick={() => {
                                            setForm({
                                                student_number: "",
                                                last_name: "",
                                                middle_name: "",
                                                first_name: "",
                                                role: "Student",
                                                email: "",
                                                password: "",
                                                status: "",
                                                dprtmnt_id: "",
                                            });
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
                                        Add Student
                                    </Button>

                                    {/* ⚙️ Right: Filter, Sort, Export */}
                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                        {/* Department Filter */}
                                        <FormControl sx={{ width: "350px" }} size="small">
                                            <InputLabel id="filter-department-label">
                                                Filter by Department
                                            </InputLabel>
                                            <Select
                                                labelId="filter-department-label"
                                                value={selectedDepartmentFilter}
                                                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                                                label="Filter by Department"
                                            >
                                                <MenuItem value="">All Departments</MenuItem>
                                                {department.map((dep) => (
                                                    <MenuItem
                                                        key={dep.dprtmnt_id}
                                                        value={dep.dprtmnt_name}
                                                    >
                                                        {dep.dprtmnt_name} ({dep.dprtmnt_code})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Sort Order */}
                                        <FormControl size="small" sx={{ width: "200px" }}>
                                            <Select
                                                value={sortOrder}
                                                onChange={(e) => setSortOrder(e.target.value)}
                                                displayEmpty
                                            >
                                                <MenuItem value="">Select Order</MenuItem>
                                                <MenuItem value="asc">Ascending</MenuItem>
                                                <MenuItem value="desc">Descending</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />

                                        <Button
                                            variant="outlined"
                                            startIcon={<FileUpload />}
                                            onClick={handleImportFile}
                                            sx={{
                                                borderColor: "#800000",
                                                color: "#800000",
                                                textTransform: "none",
                                                fontWeight: "bold",
                                                "&:hover": { borderColor: "#a52a2a", color: "white", background: "#a52a2a" },
                                            }}
                                        >
                                            Import XLSX
                                        </Button>

                                        {/* Export CSV */}
                                        <Button
                                            variant="outlined"
                                            startIcon={<FileDownloadIcon />}
                                            onClick={handleExportCSV}
                                            sx={{
                                                borderColor: "#800000",
                                                color: "#800000",
                                                textTransform: "none",
                                                fontWeight: "bold",
                                                "&:hover": { borderColor: "#a52a2a", color: "#a52a2a" },
                                            }}
                                        >
                                            Export CSV
                                        </Button>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ width: "100%", border: "2px solid maroon", mb: 4 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#6D2323" }}>
                        <TableRow>
                            {[
                                "Student Number",
                                "Image",
                                "Full Name",
                                "Email",
                                "Program",
                                "Year Level",
                                "Actions",
                                "Status",


                            ].map((header, idx) => (
                                <TableCell
                                    key={idx}
                                    sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        border: "1px solid maroon"
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredStudent.length > 0 ? (
                            filteredStudent.map((r) => (
                                <TableRow key={r.user_id}>
                                    <TableCell sx={{ textAlign: "center", border: "1px solid maroon" }}>{r.student_number}</TableCell>

                                    <TableCell sx={{ textAlign: "center", border: "1px solid maroon" }}>
                                        {r.profile_picture ? (
                                            <Avatar
                                                src={`http://localhost:5000/uploads/${r.profile_picture}`}
                                                alt={r.first_name}
                                                sx={{ width: 60, height: 60, margin: "auto", border: "1px solid maroon" }}
                                            />
                                        ) : (
                                            <Avatar sx={{ bgcolor: "#6D2323", margin: "auto" }}>
                                                {r.first_name?.[0] || "?"}
                                            </Avatar>
                                        )}
                                    </TableCell>

                                    <TableCell sx={{ textAlign: "center", border: "1px solid maroon" }}>
                                        {`${r.first_name || ""} ${r.middle_name || ""} ${r.last_name || ""}`}
                                    </TableCell>

                                    <TableCell sx={{ textAlign: "center", border: "1px solid maroon" }}>{r.email}</TableCell>

                                    <TableCell sx={{ textAlign: "center", border: "1px solid maroon" }}>
                                        {r.program_description || "N/A"}
                                    </TableCell>

                                    <TableCell sx={{ textAlign: "center", border: "1px solid maroon" }}>
                                        {r.year_level_description || "None"}
                                    </TableCell>



                                    {/* ✅ EDIT BUTTON */}
                                    <TableCell sx={{ border: "1px solid maroon", borderRight: "2px solid maroon" }}>
                                        <Button
                                            onClick={() => handleEdit(r)}
                                            sx={{
                                                backgroundColor: "#eccb22ff",
                                                color: "white",
                                                textTransform: "none",
                                                fontWeight: "bold",

                                            }}
                                            variant="contained"
                                        >
                                            EDIT
                                        </Button>
                                    </TableCell>

                                    {/* ✅ STATUS TOGGLE BUTTON */}
                                    <TableCell sx={{ border: "1px solid maroon" }}>
                                        <Button
                                            onClick={() => handleToggleStatus(r.user_id, r.status)}
                                            sx={{
                                                backgroundColor: r.status === 1 ? "green" : "maroon",
                                                color: "white",
                                                textTransform: "none",
                                                fontWeight: "bold",
                                                "&:hover": {
                                                    backgroundColor: r.status === 1 ? "#4CAF50" : "#a52a2a",
                                                },
                                            }}
                                            variant="contained"
                                        >
                                            {r.status === 1 ? "Active" : "Inactive"}
                                        </Button>
                                    </TableCell>




                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No Student accounts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ➕ / ✏️ Student Modal */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ color: "maroon", fontWeight: "bold" }}>
                    {editData ? "Edit Student" : "Add New Student"}
                </DialogTitle>
                <hr style={{ border: "1px solid #ccc", width: "100%" }} />

                <DialogContent sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                        {/* 🔹 Profile Picture Upload */}
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
                            <Avatar
                                src={
                                    form.preview ||
                                    (editData?.profile_picture
                                        ? `http://localhost:5000/uploads/${editData.profile_picture}`
                                        : "")
                                }
                                alt={form.first_name || "Profile"}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    border: "2px solid maroon",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{
                                    borderColor: "#6D2323",
                                    color: "#6D2323",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    "&:hover": { borderColor: "#800000", color: "#800000" },
                                }}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setForm({
                                                ...form,
                                                profile_picture: file,
                                                preview: URL.createObjectURL(file),
                                            });
                                        }
                                    }}
                                />
                            </Button>
                        </Stack>

                        {/* 🔹 Student Information */}
                        <TextField
                            label="Student Number"
                            name="student_number"
                            value={form.student_number}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Middle Name"
                            name="middle_name"
                            value={form.middle_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="First Name"
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            type="email"
                            fullWidth
                        />
                        <TextField
                            label={editData ? "New Password (optional)" : "Password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            type="password"
                            fullWidth
                        />

                        {/* 🔹 Department Dropdown */}
                        <FormControl fullWidth>
                            <InputLabel id="department-label">Department</InputLabel>
                            <Select
                                labelId="department-label"
                                name="dprtmnt_id"
                                value={form.dprtmnt_id}
                                label="Department"
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setForm({ ...form, dprtmnt_id: selectedId, program_id: "" }); // reset program
                                    if (selectedId) fetchPrograms(selectedId); // fetch related programs
                                }}
                            >
                                <MenuItem value="">Select Department</MenuItem>
                                {department.map((dep) => (
                                    <MenuItem key={dep.dprtmnt_id} value={dep.dprtmnt_id}>
                                        {dep.dprtmnt_name} ({dep.dprtmnt_code})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="program-label">Program</InputLabel>
                            <Select
                                labelId="program-label"
                                name="curriculum_id"
                                value={form.curriculum_id}
                                label="Program"
                                onChange={handleChange}
                            >
                                <MenuItem value="">Select Program</MenuItem>
                                {programs.map((dep) => (
                                    <MenuItem key={dep.curriculum_id} value={dep.curriculum_id}>
                                        {dep.program_description} ({dep.program_code}-{dep.year_description})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* 🔹 Status Dropdown (Active/Inactive) */}

                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                name="status"
                                value={form.status}
                                label="Status"
                                disabled={!!editData}
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={0}>Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            backgroundColor: "#800000",
                            "&:hover": { backgroundColor: "#6D2323" },
                            fontWeight: "bold",
                        }}
                    >
                        {editData ? "Save Changes" : "Register"}
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
                    Student registered successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default RegisterStudents;

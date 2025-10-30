import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    FormControl,
    Select,
    Card,
    TableCell,
    TextField,
    MenuItem,
    InputLabel,
    Checkbox,
    TableBody,
    Dialog,
    DialogTitle,
    DialogContent,
    FormControlLabel,
    DialogActions
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { io } from "socket.io-client";
import { Snackbar, Alert } from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FcPrint } from "react-icons/fc";
import EaristLogo from "../assets/EaristLogo.png";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SchoolIcon from '@mui/icons-material/School';        // For Entrance Examination Scores
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

const socket = io("http://localhost:5000");

const MedicalApplicantList = () => {
    const documentOptions = [
        { label: 'PSA Birth Certificate', key: 'BirthCertificate' },
        { label: 'Form 138 (4th Quarter / No failing Grades)', key: 'Form138' },
        { label: 'Certificate of Good Moral Character', key: 'GoodMoralCharacter' },
        { label: 'Certificate Belonging to Graduating Class', key: 'CertificateOfGraduatingClass' },
        { label: 'Copy of Vaccine Card (1st and 2nd Dose)', key: 'VaccineCard' }
    ];


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryPersonId = (queryParams.get("person_id") || "").trim();

    const handleRowClick = (person_id) => {
        if (!person_id) return;

        sessionStorage.setItem("admin_edit_person_id", String(person_id));
        sessionStorage.setItem("admin_edit_person_id_source", "applicant_list");
        sessionStorage.setItem("admin_edit_person_id_ts", String(Date.now()));

        // ✅ Always pass person_id in the URL
        navigate(`/medical_dashboard1?person_id=${person_id}`);
    };

    const tabs1 = [
        { label: "Medical Applicant List", to: "/medical_applicant_list", icon: <ListAltIcon /> },
        { label: "Applicant Form", to: "/medical_dashboard1", icon: <HowToRegIcon /> },
        { label: "Submitted Documents", to: "/medical_requirements", icon: <UploadFileIcon /> }, // updated icon
        { label: "Medical History", to: "/medical_requirements_form", icon: <PersonIcon /> },
        { label: "Dental Assessment", to: "/dental_assessment", icon: <DescriptionIcon /> },
        { label: "Physical and Neurological Examination", to: "/physical_neuro_exam", icon: <SchoolIcon /> },
    ];

    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [clickedSteps, setClickedSteps] = useState(Array(tabs1.length).fill(false));


    const handleStepClick = (index, to) => {
        setActiveStep(index);
        const pid = sessionStorage.getItem("admin_edit_person_id");

        if (pid && to !== "/applicant_list") {
            navigate(`${to}?person_id=${pid}`);
        } else {
            navigate(to);
        }
    };


    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const pageId = 30;

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

    useEffect(() => {
        if (location.search.includes("person_id")) {
            navigate("/applicant_list", { replace: true });
        }
    }, [location, navigate]);

    const [persons, setPersons] = useState([]);

    const [selectedPerson, setSelectedPerson] = useState(null);
    const [assignedNumber, setAssignedNumber] = useState('');
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [adminData, setAdminData] = useState({ dprtmnt_id: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const loggedInPersonId = localStorage.getItem("person_id");
        const searchedPersonId = sessionStorage.getItem("admin_edit_person_id");

        if (!storedUser || !storedRole || !loggedInPersonId) {
            window.location.href = "/login";
            return;
        }

        setUser(storedUser);
        setUserRole(storedRole);

        const allowedRoles = ["registrar", "applicant", "superadmin"];
        if (allowedRoles.includes(storedRole)) {
            const targetId = queryPersonId || searchedPersonId || loggedInPersonId;
            sessionStorage.setItem("admin_edit_person_id", targetId);
            setUserID(targetId);
            return;
        }

        window.location.href = "/login";
    }, [queryPersonId]);

    const fetchPersonData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin_data/${user}`);
            setAdminData(res.data); // { dprtmnt_id: "..." }
        } catch (err) {
            console.error("Error fetching admin data:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPersonData();
        }
    }, [user]);




    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
    const [person, setPerson] = useState({
        campus: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        gender: "",
        birthOfDate: "",
        document_status: "",
        extension: "",
        generalAverage1: "",
        program: "",
        created_at: "",
        middle_code: "",
    });

    // ⬇️ Add this inside ApplicantList component, before useEffect
    const fetchApplicants = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/all-applicants");
            const data = await res.json();
            setPersons(data);
        } catch (err) {
            console.error("Error fetching applicants:", err);
        }
    };

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // holds which action to confirm
    const [confirmMessage, setConfirmMessage] = useState("");


    const handleSubmittedMedicalChange = async (upload_id, checked) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/submitted-medical/${upload_id}`,
                {
                    submitted_medical: checked ? 1 : 0,
                    user_person_id: localStorage.getItem("person_id"),
                }
            );

            setSnack({
                open: true,
                message: checked ? "Medical submitted ✅" : "Medical unsubmitted ❌",
                severity: checked ? "success" : "warning",
            });

            fetchApplicants(); // refresh the table
        } catch (err) {
            console.error("❌ Failed to update medical status:", err);
        }
    };





    useEffect(() => {
        // Replace this with your actual API endpoint
        fetch("http://localhost:5000/api/all-applicants")
            .then((res) => res.json())
            .then((data) => setPersons(data)) // ✅ Correct

    }, []);

    useEffect(() => {
        socket.on("document_status_updated", () => {
            fetch("http://localhost:5000/api/all-applicants")
                .then((res) => res.json())
                .then((data) => setPersons(data));
        });
        return () => socket.off("document_status_updated");
    }, []);




    const [curriculumOptions, setCurriculumOptions] = useState([]);

    const [selectedApplicantStatus, setSelectedApplicantStatus] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const [selectedRegistrarStatus, setSelectedRegistrarStatus] = useState("");

    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");
    const [selectedProgramFilter, setSelectedProgramFilter] = useState("");
    const [department, setDepartment] = useState([]);
    const [allCurriculums, setAllCurriculums] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [semesters, setSchoolSemester] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState('');

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


    const handleSchoolYearChange = (event) => {
        setSelectedSchoolYear(event.target.value);
    };

    const handleSchoolSemesterChange = (event) => {
        setSelectedSchoolSemester(event.target.value);
    };

    // helper to make string comparisons robust
    const normalize = (s) => (s ?? "").toString().trim().toLowerCase();
    const [showSubmittedOnly, setShowSubmittedOnly] = useState(false);


    const filteredPersons = persons
        .filter((personData) => {
            const fullText = `${personData.first_name} ${personData.middle_name} ${personData.last_name} ${personData.emailAddress ?? ''} ${personData.applicant_number ?? ''}`.toLowerCase();
            const matchesSearch = fullText.includes(searchQuery.toLowerCase());

            const matchesCampus =
                person.campus === "" || // All Campuses
                String(personData.campus) === String(person.campus);

            // ✅ FIX: use document_status and normalize both sides
            const matchesApplicantStatus =
                selectedApplicantStatus === "" ||
                normalize(personData.document_status) === normalize(selectedApplicantStatus);

            // (keep your registrar filter; shown here with the earlier mapping)
            const matchesRegistrarStatus =
                selectedRegistrarStatus === "" ||
                (selectedRegistrarStatus === "Submitted" && personData.registrar_status === 1) ||
                (selectedRegistrarStatus === "Unsubmitted / Incomplete" && personData.registrar_status === 0);

            const programInfo = allCurriculums.find(
                (opt) => opt.curriculum_id?.toString() === personData.program?.toString()
            );

            const matchesProgram =
                selectedProgramFilter === "" ||
                programInfo?.program_code === selectedProgramFilter;

            const matchesDepartment =
                selectedDepartmentFilter === "" ||
                programInfo?.dprtmnt_name === selectedDepartmentFilter;

            const applicantAppliedYear = new Date(personData.created_at).getFullYear();
            const schoolYear = schoolYears.find((sy) => sy.year_id === selectedSchoolYear);

            const matchesSchoolYear =
                selectedSchoolYear === "" || (schoolYear && (String(applicantAppliedYear) === String(schoolYear.current_year)))

            const matchesSemester =
                selectedSchoolSemester === "" ||
                String(personData.middle_code) === String(selectedSchoolSemester);

            // date range (unchanged)
            let matchesDateRange = true;
            if (person.fromDate && person.toDate) {
                const appliedDate = new Date(personData.created_at);
                const from = new Date(person.fromDate);
                const to = new Date(person.toDate);
                matchesDateRange = appliedDate >= from && appliedDate <= to;
            } else if (person.fromDate) {
                const appliedDate = new Date(personData.created_at);
                const from = new Date(person.fromDate);
                matchesDateRange = appliedDate >= from;
            } else if (person.toDate) {
                const appliedDate = new Date(personData.created_at);
                const to = new Date(person.toDate);
                matchesDateRange = appliedDate <= to;
            }

            const matchesSubmittedDocs =
                !showSubmittedOnly || personData.submitted_documents === 1;


            return (
                matchesSearch &&
                matchesCampus &&
                matchesApplicantStatus &&
                matchesRegistrarStatus &&
                matchesSubmittedDocs &&
                matchesDepartment &&
                matchesProgram &&
                matchesSchoolYear &&
                matchesSemester &&
                matchesDateRange
            );
        })
        .sort((a, b) => {
            let fieldA, fieldB;
            if (sortBy === "name") {
                fieldA = `${a.last_name} ${a.first_name} ${a.middle_name || ''}`.toLowerCase();
                fieldB = `${b.last_name} ${b.first_name} ${b.middle_name || ''}`.toLowerCase();
            } else if (sortBy === "id") {
                fieldA = a.applicant_number || "";
                fieldB = b.applicant_number || "";
            } else if (sortBy === "email") {
                fieldA = a.emailAddress?.toLowerCase() || "";
                fieldB = b.emailAddress?.toLowerCase() || "";
            } else {
                return 0;
            }
            if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });



    const [itemsPerPage, setItemsPerPage] = useState(100);

    const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPersons = filteredPersons.slice(indexOfFirstItem, indexOfLastItem);

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

    useEffect(() => {
        fetch("http://localhost:5000/api/all-applicants") // 👈 This is the new endpoint
            .then((res) => res.json())

            .catch((err) => console.error("Error fetching applicants:", err));
    }, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/departments`); // ✅ Update if needed
                setDepartment(response.data);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchDepartments();
    }, []);


    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [filteredPersons.length, totalPages]);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        // Load saved notifications from DB on first load
        axios.get("http://localhost:5000/api/notifications")
            .then(res => {
                setNotifications(res.data.map(n => ({
                    ...n,
                    timestamp: n.timestamp
                })));
            })
            .catch(err => console.error("Failed to load saved notifications:", err));
    }, []);


    useEffect(() => {
        const socket = io("http://localhost:5000");
        socket.on("notification", (data) => {
            setNotifications((prev) => [data, ...prev]);
        });
        return () => socket.disconnect();
    }, []);


    const [openDialog, setOpenDialog] = useState(false);
    const [activePerson, setActivePerson] = useState(null);
    const [selected, setSelected] = useState([]);


    useEffect(() => {
        if (activePerson?.missing_documents) {
            try {
                setSelected(activePerson.missing_documents || []);
            } catch {
                setSelected([]);
            }
        } else {
            setSelected([]);
        }
    }, [activePerson]);

    const handleOpenDialog = (person) => {
        setActivePerson(person);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setActivePerson(null);
        setOpenDialog(false);
    };

    const handleSaveMissingDocs = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/missing-documents/${activePerson.person_id}`,
                {
                    missing_documents: selected,   // this is your array of checked keys

                }
            );

            setSnack({
                open: true,
                message: "Missing documents saved!",
                severity: "success",
            });

            fetchApplicants(); // reload table
            setOpenDialog(false);
        } catch (err) {
            console.error("❌ Error saving missing docs:", err);
            alert("Failed to save missing documents");
        }
    };

    const handleSnackClose = (_, reason) => {
        if (reason === 'clickaway') return;
        setSnack(prev => ({ ...prev, open: false }));
    };

    useEffect(() => {
        axios.get("http://localhost:5000/api/applied_program")
            .then(res => {
                setAllCurriculums(res.data);
                setCurriculumOptions(res.data);
            });
    }, []);

    useEffect(() => {
        if (department.length > 0 && !selectedDepartmentFilter) {
            const firstDept = department[0].dprtmnt_name;
            setSelectedDepartmentFilter(firstDept);
            handleDepartmentChange(firstDept); // if you also want to trigger it
        }
    }, [department, selectedDepartmentFilter]);

    const handleDepartmentChange = (selectedDept) => {
        setSelectedDepartmentFilter(selectedDept);
        if (!selectedDept) {
            setCurriculumOptions(allCurriculums);
        } else {
            setCurriculumOptions(
                allCurriculums.filter(opt => opt.dprtmnt_name === selectedDept)
            );
        }
        setSelectedProgramFilter("");
    };


    const [applicants, setApplicants] = useState([]);
    const divToPrintRef = useRef();



    const printDiv = () => {
        // Pick address based on selected campus
        let campusAddress = "";
        if (person?.campus === "0") {
            campusAddress = "Nagtahan St. Sampaloc, Manila";
        } else if (person?.campus === "1") {
            campusAddress = "Blk. 3 Lot 2, 5 Congressional Rd, General Mariano Alvarez";
        }

        const newWin = window.open("", "Print-Window");
        newWin.document.open();
        newWin.document.write(`
    <html>
      <head>
        <title>Applicant List</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .print-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .print-header {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%;
          }
          .print-header img {
            position: absolute;
            left: 0;
            margin-left: 10px;
            width: 120px;
            height: 120px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
          }
          th, td {
            border: 0.5px solid black;
            padding: 4px 6px;
            font-size: 12px;
            text-align: center;
          }
          th {
            background-color: #800000;
            color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body onload="window.print(); setTimeout(() => window.close(), 100);">
        <div class="print-container">

          <!-- Header -->
          <div class="print-header">
            <img src="${EaristLogo}" alt="Earist Logo" 
                 style="width: 125px; height: 125px;" />
            <div>
              <div>Republic of the Philippines</div>
              <b style="letter-spacing: 1px; font-size: 20px;">
                Eulogio "Amang" Rodriguez
              </b>
              <div style="letter-spacing: 1px; font-size: 20px;">
                <b>Institute of Science and Technology</b>
              </div>
              <div>${campusAddress}</div>
              <div style="margin-top: 30px;">
                <b style="font-size: 24px; letter-spacing: 1px;">
                Medical Records For Applicant
                </b>
              </div>
            </div>
          </div>

          <!-- Table -->
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Applicant Name</th>
                <th>Program</th>
                
                <th>Date Applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPersons.map(person => `
                <tr>
                  <td>${person.student_number ?? "N/A"}</td>
                  <td>${person.last_name}, ${person.first_name} ${person.middle_name ?? ""} ${person.extension ?? ""}</td>
                  <td>${curriculumOptions.find(
            item => item.curriculum_id?.toString() === person.program?.toString()
        )?.program_code ?? "N/A"}</td>
                 
                  <td>${new Date(person.created_at).toLocaleDateString("en-PH")}</td>
                  <td>${person.registrar_status === 1
                ? "Submitted"
                : person.registrar_status === 0
                    ? "Unsubmitted / Incomplete"
                    : ""
            }</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

        </div>
      </body>
    </html>
  `);
        newWin.document.close();
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
        <Box sx={{ height: 'calc(100vh - 150px)', overflowY: 'auto', pr: 1, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" fontWeight="bold" color="maroon">
                    MEDICAL RECORDS
                </Typography>


                <Box>

                    <TextField
                        variant="outlined"
                        placeholder="Search Student Name / Email / Student"
                        size="small"
                        style={{ width: '450px' }}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Corrected
                        }}

                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1 }} />,
                        }}
                    />
                </Box>
            </Box>


            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <div style={{ height: "20px" }}></div>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    mt: 2,
                }}
            >
                {tabs1.map((tab, index) => (
                    <React.Fragment key={index}>
                        {/* Step Card */}
                        <Card
                            onClick={() => handleStepClick(index, tab.to)}
                            sx={{
                                flex: 1,
                                maxWidth: `${100 / tabs1.length}%`, // evenly fit 100%
                                height: 100,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                borderRadius: 2,
                                border: "2px solid #6D2323",

                                backgroundColor: activeStep === index ? "#6D2323" : "#E8C999",
                                color: activeStep === index ? "#fff" : "#000",
                                boxShadow:
                                    activeStep === index
                                        ? "0px 4px 10px rgba(0,0,0,0.3)"
                                        : "0px 2px 6px rgba(0,0,0,0.15)",
                                transition: "0.3s ease",
                                "&:hover": {
                                    backgroundColor: activeStep === index ? "#5a1c1c" : "#f5d98f",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Box sx={{ fontSize: 32, mb: 0.5 }}>{tab.icon}</Box>
                                <Typography
                                    sx={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}
                                >
                                    {tab.label}
                                </Typography>
                            </Box>
                        </Card>

                        {/* Spacer instead of line */}
                        {index < tabs1.length - 1 && (
                            <Box
                                sx={{
                                    flex: 0.1,
                                    mx: 1, // margin to keep spacing
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </Box>

            <div style={{ height: "20px" }}></div>


            <TableContainer component={Paper} sx={{ width: '100%', border: "2px solid maroon", }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#6D2323' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', textAlign: "Center" }}>Application Date</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ width: '100%', border: "2px solid maroon", p: 2 }}>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" rowGap={2}>

                    {/* Left Side: From and To Date */}
                    <Box display="flex" flexDirection="column" gap={2}>

                        {/* From Date + Print Button */}
                        <Box display="flex" alignItems="flex-end" gap={2}>

                            <FormControl size="small" sx={{ width: 200 }}>
                                <InputLabel shrink htmlFor="from-date">From Date</InputLabel>
                                <TextField
                                    id="from-date"
                                    type="date"
                                    size="small"
                                    name="fromDate"
                                    value={person.fromDate || ""}
                                    onChange={(e) => setPerson(prev => ({ ...prev, fromDate: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </FormControl>

                            <button
                                onClick={printDiv}
                                style={{
                                    padding: "5px 20px",
                                    border: "2px solid black",
                                    backgroundColor: "#f0f0f0",
                                    color: "black",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    transition: "background-color 0.3s, transform 0.2s",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    userSelect: "none",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d3d3d3"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                                type="button"
                            >
                                <FcPrint size={20} />
                                Print Student List
                            </button>
                        </Box>

                        {/* To Date */}
                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel shrink htmlFor="to-date">To Date</InputLabel>
                            <TextField
                                id="to-date"
                                type="date"
                                size="small"
                                name="toDate"
                                value={person.toDate || ""}
                                onChange={(e) => setPerson(prev => ({ ...prev, toDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </FormControl>
                    </Box>

                    {/* Right Side: Campus Dropdown */}
                    <Box display="flex" flexDirection="column" gap={1} sx={{ minWidth: 200 }}>
                        <Typography fontSize={13} >Campus:</Typography>
                        <FormControl size="small" sx={{ width: "200px" }}>
                            <InputLabel id="campus-label">Campus</InputLabel>
                            <Select
                                labelId="campus-label"
                                id="campus-select"
                                name="campus"
                                value={person.campus ?? ""}
                                onChange={(e) => {
                                    setPerson(prev => ({ ...prev, campus: e.target.value }));
                                    setCurrentPage(1);
                                }}
                            >
                                <MenuItem value=""><em>All Campuses</em></MenuItem>
                                <MenuItem value="0">MANILA</MenuItem>
                                <MenuItem value="1">CAVITE</MenuItem>
                            </Select>
                        </FormControl>

                    </Box>

                </Box>
            </TableContainer>

            <TableContainer component={Paper} sx={{ width: '100%', }}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: '#6D2323', color: "white" }}>
                        <TableRow>
                            <TableCell colSpan={10} sx={{ border: "2px solid maroon", py: 0.5, backgroundColor: '#6D2323', color: "white" }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    {/* Left: Total Count */}
                                    <Typography fontSize="14px" fontWeight="bold" color="white">
                                        Total Students: {filteredPersons.length}
                                    </Typography>

                                    {/* Right: Pagination Controls */}
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {/* First & Prev */}
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
                                                }
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
                                                }
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
                                                        color: 'white', // dropdown arrow icon color
                                                    }
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            maxHeight: 200,
                                                            backgroundColor: '#fff', // dropdown background
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


                                        {/* Next & Last */}
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
                                                }
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
                                                }
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






            <TableContainer component={Paper} sx={{ width: '100%', border: "2px solid maroon", p: 2 }}>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" rowGap={3} columnGap={5}>

                    {/* LEFT COLUMN: Sorting & Status Filters */}
                    <Box display="flex" flexDirection="column" gap={2}>

                        {/* Sort By */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "10px" }}>Sort By:</Typography>
                            <FormControl size="small" sx={{ width: "200px" }}>
                                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} displayEmpty>
                                    <MenuItem value="">Select Field</MenuItem>
                                    <MenuItem value="name">Applicant's Name</MenuItem>
                                    <MenuItem value="id">Student Number</MenuItem>
                                    <MenuItem value="email">Email Address</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography fontSize={13} sx={{ minWidth: "10px" }}>Sort Order:</Typography>
                            <FormControl size="small" sx={{ width: "200px" }}>
                                <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} displayEmpty>
                                    <MenuItem value="">Select Order</MenuItem>
                                    <MenuItem value="asc">Ascending</MenuItem>
                                    <MenuItem value="desc">Descending</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>


                        {/* Applicant Status */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "140px" }}>Applicant Status:</Typography>
                            <FormControl size="small" sx={{ width: "275px" }}>
                                <Select
                                    value={selectedApplicantStatus}
                                    onChange={(e) => setSelectedApplicantStatus(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">Select status</MenuItem>
                                    <MenuItem value="On process">On process</MenuItem>
                                    <MenuItem value="Documents Verified & ECAT">Documents Verified & ECAT</MenuItem>
                                    <MenuItem value="Disapproved">Disapproved</MenuItem>
                                    <MenuItem value="Program Closed">Program Closed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Registrar Status + Submitted Docs Checkbox */}
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography fontSize={13} sx={{ minWidth: "140px" }}>Registrar Status:</Typography>
                            <FormControl size="small" sx={{ width: "275px" }}>
                                <Select
                                    value={selectedRegistrarStatus}
                                    onChange={(e) => setSelectedRegistrarStatus(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">Select status</MenuItem>
                                    <MenuItem value="Submitted">Submitted</MenuItem>
                                    <MenuItem value="Unsubmitted / Incomplete">Unsubmitted / Incomplete</MenuItem>
                                </Select>
                            </FormControl>

                            {/* ✅ New Checkbox for Submitted Documents */}

                        </Box>
                        <FormControl size="small" sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <Checkbox
                                checked={showSubmittedOnly}
                                onChange={(e) => setShowSubmittedOnly(e.target.checked)}
                                sx={{ color: "maroon", "&.Mui-checked": { color: "maroon" } }}
                            />
                            <Typography fontSize={13}>Show Submitted Only</Typography>
                        </FormControl>
                    </Box>

                    {/* MIDDLE COLUMN: SY & Semester */}
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "100px" }}>School Year:</Typography>
                            <FormControl size="small" sx={{ width: "200px" }}>
                                <InputLabel id="school-year-label">School Years</InputLabel>
                                <Select
                                    labelId="school-year-label"
                                    value={selectedSchoolYear}
                                    onChange={handleSchoolYearChange}
                                    displayEmpty
                                >
                                    {schoolYears.length > 0 ? (
                                        schoolYears.map((sy) => (
                                            <MenuItem value={sy.year_id} key={sy.year_id}>
                                                {sy.current_year} - {sy.next_year}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>School Year is not found</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "100px" }}>Semester:</Typography>
                            <FormControl size="small" sx={{ width: "200px" }}>
                                <InputLabel>School Semester</InputLabel>
                                <Select
                                    label="School Semester"
                                    value={selectedSchoolSemester}
                                    onChange={handleSchoolSemesterChange}
                                    displayEmpty
                                >
                                    {semesters.length > 0 ? (
                                        semesters.map((sem) => (
                                            <MenuItem value={sem.semester_id} key={sem.semester_id}>
                                                {sem.semester_description}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>School Semester is not found</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* RIGHT COLUMN: Department & Program */}
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "100px" }}>Department:</Typography>
                            <FormControl size="small" sx={{ width: "400px" }}>
                                <Select
                                    value={selectedDepartmentFilter}
                                    onChange={(e) => {
                                        const selectedDept = e.target.value;
                                        setSelectedDepartmentFilter(selectedDept);
                                        handleDepartmentChange(selectedDept);
                                    }}
                                    displayEmpty
                                >
                                    {department.map((dep) => (
                                        <MenuItem key={dep.dprtmnt_id} value={dep.dprtmnt_name}>
                                            {dep.dprtmnt_name} ({dep.dprtmnt_code})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "100px" }}>Program:</Typography>
                            <FormControl size="small" sx={{ width: "350px" }}>
                                <Select
                                    value={selectedProgramFilter}
                                    onChange={(e) => setSelectedProgramFilter(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Programs</MenuItem>
                                    {curriculumOptions.map((prog) => (
                                        <MenuItem key={prog.curriculum_id} value={prog.program_code}>
                                            {prog.program_code} - {prog.program_description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Box>
                    </Box>
                </Box>
            </TableContainer>

            <div ref={divToPrintRef}>

            </div>


            <TableContainer component={Paper} sx={{ width: "100%" }}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: "#6D2323", }}>
                        <TableRow>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "2%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                #
                            </TableCell>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "3%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Submitted Medical Documents
                            </TableCell>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "4%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Student Number
                            </TableCell>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "25%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Name
                            </TableCell>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "10%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Program
                            </TableCell>

                            <TableCell sx={{ color: "white", textAlign: "center", width: "8%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Birth Date
                            </TableCell>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "8%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Gender
                            </TableCell>
                            <TableCell sx={{ color: "white", textAlign: "center", width: "8%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Remarks
                            </TableCell>

                            {/*
                            <TableCell sx={{ color: "white", textAlign: "center", width: "8%", py: 0.5, fontSize: "12px", border: "2px solid maroon" }}>
                                Registrar Status
                            </TableCell>
                            */}
                        </TableRow>
                    </TableHead>
                    {/* --- Confirmation Dialog --- */}
                    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogContent>
                            {confirmMessage || "Are you sure you want to update this applicant’s status?"}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmOpen(false)} color="error">
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    if (confirmAction) await confirmAction();
                                    setConfirmOpen(false);
                                    fetchApplicants();
                                }}
                                color="success"
                                variant="contained"
                            >
                                Yes, Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <TableBody>
                        {currentPersons.map((person, index) => (
                            <TableRow key={person.person_id}>
                                {/* # */}
                                <TableCell sx={{ textAlign: "center", border: "2px solid maroon" }}>
                                    {index + 1}
                                </TableCell>

                                {/* ✅ Submitted Checkbox */}
                                <TableCell sx={{ textAlign: "center", border: "2px solid maroon" }}>
                                    <Checkbox
                                        checked={Number(person.submitted_medical) === 1}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setConfirmMessage(
                                                `Are you sure you want to mark this applicant’s Medical as ${checked ? "Submitted" : "Unsubmitted"
                                                }?`
                                            );
                                            setConfirmAction(() => async () => {
                                                // 🧠 Optimistic UI update
                                                setPersons((prev) =>
                                                    prev.map((p) =>
                                                        p.person_id === person.person_id
                                                            ? { ...p, submitted_medical: checked ? 1 : 0 }
                                                            : p
                                                    )
                                                );
                                                // 🔥 Call backend
                                                await handleSubmittedMedicalChange(person.upload_id, checked);
                                            });
                                            setConfirmOpen(true);
                                        }}
                                        sx={{
                                            color: "maroon",
                                            "&.Mui-checked": { color: "maroon" },
                                            transform: "scale(1.1)",
                                            p: 0,
                                        }}
                                    />
                                </TableCell>


                                {/* Applicant Number */}
                                <TableCell
                                    sx={{
                                        textAlign: "center",
                                        border: "2px solid maroon",
                                        color: "blue",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleRowClick(person.person_id)}
                                >
                                    {person.student_number ?? "N/A"}
                                </TableCell>

                                {/* Applicant Name */}
                                <TableCell
                                    sx={{
                                        textAlign: "left",
                                        border: "2px solid maroon",
                                        color: "blue",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleRowClick(person.person_id)}
                                >
                                    {`${person.last_name}, ${person.first_name} ${person.middle_name ?? ""} ${person.extension ?? ""}`}
                                </TableCell>

                                {/* Program */}
                                <TableCell sx={{ textAlign: "center", border: "2px solid maroon" }}>
                                    {curriculumOptions.find(
                                        (item) =>
                                            item.curriculum_id?.toString() === person.program?.toString()
                                    )?.program_code ?? "N/A"}
                                </TableCell>


                                <TableCell sx={{ textAlign: "center", border: "2px solid maroon" }}>
                                    {person.birthOfDate}
                                </TableCell>
                                {/* Created Date */}
                                <TableCell sx={{ textAlign: "center", border: "2px solid maroon" }}>
                                    {person.gender === 0 ? "MALE" : person.gender === 1 ? "FEMALE" : ""}
                                </TableCell>





                                <TableCell
                                    sx={{
                                        border: "2px solid maroon",
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                        p: 0,
                                    }}
                                >
                                    {person.submitted_medical === 1 ? (
                                        <Box
                                            sx={{
                                                background: "#4CAF50", // green background
                                                color: "white",
                                                borderRadius: 1,
                                                p: 0.5,
                                                display: "inline-block",
                                                width: "90%", // optional - to make width uniform
                                                mx: "auto",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: "bold" }}>ON PROCESS</Typography>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                background: "#F44336", // red background
                                                color: "white",
                                                borderRadius: 1,
                                                p: 0.5,
                                                display: "inline-block",
                                                width: "90%",
                                                mx: "auto",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: "bold" }}>NO SUBMITTED DOCUMENTS</Typography>
                                        </Box>
                                    )}
                                </TableCell>




                                {/*
                                <TableCell sx={{ textAlign: "center", border: "2px solid maroon" }}>
                                    {person.registrar_status === 1 ? (
                                        <Box
                                            sx={{
                                                background: "#4CAF50",
                                                color: "white",
                                                borderRadius: 1,
                                                p: 0.5,
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: "bold" }}>Submitted</Typography>
                                        </Box>
                                    ) : person.registrar_status === 0 ? (
                                        <Box
                                            sx={{
                                                background: "#F44336",
                                                color: "white",
                                                borderRadius: 1,
                                                p: 0.5,
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: "bold" }}>
                                                Unsubmitted / Incomplete
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box display="flex" justifyContent="center" gap={1}>
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    setConfirmMessage(
                                                        "Are you sure you want to set Registrar Status to Submitted?"
                                                    );
                                                    setConfirmAction(() => async () => {
                                                        await handleRegistrarStatusChange(person.person_id, 1);
                                                    });
                                                    setConfirmOpen(true);
                                                }}
                                                sx={{ backgroundColor: "green", color: "white" }}
                                            >
                                                Submitted
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    setConfirmMessage(
                                                        "Are you sure you want to set Registrar Status to Unsubmitted?"
                                                    );
                                                    setConfirmAction(() => async () => {
                                                        await handleRegistrarStatusChange(person.person_id, 0);
                                                    });
                                                    setConfirmOpen(true);
                                                }}
                                                sx={{ backgroundColor: "red", color: "white" }}
                                            >
                                                Unsubmitted
                                            </Button>
                                        </Box>
                                    )}
                                </TableCell>
                                */}
                            </TableRow>
                        ))}
                    </TableBody>



                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                        <DialogTitle
                            sx={{
                                fontWeight: "bold",
                                textAlign: "center",
                                color:
                                    Array.isArray(activePerson?.missing_documents) &&
                                        activePerson.missing_documents.length === 0 &&
                                        activePerson?.submitted_documents === 1 &&
                                        activePerson?.registrar_status === 1
                                        ? "#4CAF50"
                                        : "maroon",
                            }}
                        >
                            {Array.isArray(activePerson?.missing_documents) &&
                                activePerson.missing_documents.length === 0 &&
                                activePerson?.submitted_documents === 1 &&
                                activePerson?.registrar_status === 1
                                ? "✅ Completed All Documents"
                                : "Mark Missing Documents"}
                        </DialogTitle>

                        <DialogContent>
                            {documentOptions.map((doc) => {
                                const selectedArray = Array.isArray(activePerson?.missing_documents)
                                    ? activePerson.missing_documents
                                    : [];

                                // 👉 Completed lang kung walang missing docs + naka-submit
                                const isCompleted =
                                    selectedArray.length === 0 &&
                                    activePerson?.submitted_documents === 1 &&
                                    activePerson?.registrar_status === 1;

                                return (
                                    <FormControlLabel
                                        key={doc.key}
                                        control={
                                            <Checkbox
                                                checked={isCompleted ? true : selectedArray.includes(doc.key)}
                                                disabled={isCompleted} // disable only kapag completed talaga
                                                onChange={(e) => {
                                                    if (isCompleted) return; // block changes if completed
                                                    const updated = e.target.checked
                                                        ? [...selectedArray, doc.key]
                                                        : selectedArray.filter((x) => x !== doc.key);

                                                    setActivePerson((prev) =>
                                                        prev ? { ...prev, missing_documents: updated } : prev
                                                    );
                                                }}
                                            />
                                        }
                                        label={doc.label}
                                    />
                                );
                            })}
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            {!(
                                Array.isArray(activePerson?.missing_documents) &&
                                activePerson.missing_documents.length === 0 &&
                                activePerson?.submitted_documents === 1 &&
                                activePerson?.registrar_status === 1
                            ) && (
                                    <Button
                                        variant="contained"
                                        onClick={handleSaveMissingDocs}
                                        sx={{ background: "maroon" }}
                                    >
                                        Save
                                    </Button>
                                )}
                        </DialogActions>
                    </Dialog>



                </Table>
            </TableContainer>

            <Snackbar
                open={snack.open}
                onClose={handleSnackClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default MedicalApplicantList;
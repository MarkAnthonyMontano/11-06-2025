import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Card
} from "@mui/material";
import EaristLogo from "../assets/EaristLogo.png";
import "../styles/Print.css";
import { FcPrint } from "react-icons/fc";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import SchoolIcon from "@mui/icons-material/School";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PeopleIcon from "@mui/icons-material/People";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";
import SearchIcon from "@mui/icons-material/Search";


const ExaminationProfile = ({ personId }) => {
    const settings = useContext(SettingsContext);
    const [fetchedLogo, setFetchedLogo] = useState(null);
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        if (settings) {
            // ✅ load dynamic logo
            if (settings.logo_url) {
                setFetchedLogo(`http://localhost:5000${settings.logo_url}`);
            } else {
                setFetchedLogo(EaristLogo);
            }

            // ✅ load dynamic name + address
            if (settings.company_name) setCompanyName(settings.company_name);
            if (settings.campus_address) setCampusAddress(settings.campus_address);
        }
    }, [settings]);

    const words = companyName.trim().split(" ");
    const middle = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, middle).join(" ");
    const secondLine = words.slice(middle).join(" ");


    const tabs = [
        {
            label: <>Admission Process for <br /> Registrar</>,
            to: "/applicant_list_admin",
            icon: <SchoolIcon fontSize="large" />
        },
        { label: "Applicant Form", to: "/admin_dashboard1", icon: <DashboardIcon fontSize="large" /> },
        { label: "Student Requirements", to: "/student_requirements", icon: <AssignmentIcon fontSize="large" /> },
        { label: "Entrance Exam Room Assignment", to: "/assign_entrance_exam", icon: <MeetingRoomIcon fontSize="large" /> },
        { label: "Entrance Exam Schedule Management", to: "/assign_schedule_applicant", icon: <ScheduleIcon fontSize="large" /> },
        { label: "Examination Profile", to: "/registrar_examination_profile", icon: <PersonSearchIcon fontSize="large" /> },
        { label: "Proctor's Applicant List", to: "/proctor_applicant_list", icon: <PeopleIcon fontSize="large" /> },
        { label: "Entrance Examination Scores", to: "/applicant_scoring", icon: <FactCheckIcon fontSize="large" /> },
    ];

    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(5);
    const [clickedSteps, setClickedSteps] = useState(Array(tabs.length).fill(false));

    const handleStepClick = (index, to) => {
        setActiveStep(index);
        navigate(to);
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [persons, setPersons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [person, setPerson] = useState({
        campus: "",
        profile_img: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        extension: "",
    });

    const [campusAddress, setCampusAddress] = useState("");

    useEffect(() => {
        if (settings && settings.address) {
            setCampusAddress(settings.address);
        }
    }, [settings]);


    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);


    const pageId = 55;

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






    const [curriculumOptions, setCurriculumOptions] = useState([]);
    const [examSchedule, setExamSchedule] = useState(null);
    const [applicantNumber, setApplicantNumber] = useState("");
    const [scheduledBy, setScheduledBy] = useState(""); // ✅ added
    const divToPrintRef = useRef();

    // ✅ Check logged-in user
    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");

        if (storedUser && storedRole && storedID && storedID !== "undefined") {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);

            if (storedRole !== "registrar") {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    // ✅ Fetch persons list
    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/upload_documents");
                setPersons(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching persons:", err);
            }
        };
        fetchPersons();
    }, []);

    // ✅ Fetch single person
    const fetchPersonData = async (personID) => {
        if (!personID || personID === "undefined") return;
        try {
            const res = await axios.get(`http://localhost:5000/api/person/${personID}`);
            setPerson(res.data || {});
        } catch (error) {
            console.error("❌ Failed to fetch person data:", error?.response?.data || error.message);
        }
    };

    // ✅ When a person is selected, fetch data
    useEffect(() => {
        if (selectedPerson?.person_id) {
            fetchPersonData(selectedPerson.person_id);
            if (selectedPerson.applicant_number) {
                setApplicantNumber(selectedPerson.applicant_number);
            }
        }
    }, [selectedPerson]);

    // ✅ Handle search by applicant number or name
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSelectedPerson(null);
            return;
        }

        const match = persons.find((p) => {
            const fullString = `${p.first_name ?? ""} ${p.middle_name ?? ""} ${p.last_name ?? ""} ${p.emailAddress ?? ""}`.toLowerCase();
            const numberMatch = (p.applicant_number || "").toLowerCase() === searchQuery.toLowerCase();
            const textMatch = fullString.includes(searchQuery.toLowerCase());
            return numberMatch || textMatch;
        });

        if (match) {
            setSelectedPerson(match);
            setPerson(match);
        } else {
            axios
                .get(`http://localhost:5000/api/person-by-applicant/${searchQuery}`)
                .then((res) => {
                    if (res.data?.person_id) {
                        setSelectedPerson(res.data);
                        fetchPersonData(res.data.person_id);
                    }
                })
                .catch(() => setSelectedPerson(null));
        }
    }, [searchQuery, persons]);

    // ✅ Fetch curriculum options
    useEffect(() => {
        const fetchCurriculums = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/applied_program");
                setCurriculumOptions(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching curriculum options:", error);
            }
        };
        fetchCurriculums();
    }, []);

    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (selectedPerson?.applicant_number) {
            axios
                .get(`http://localhost:5000/api/exam-schedule/${selectedPerson.applicant_number}`)
                .then((res) => {
                    setExamSchedule(res.data);

                    // ✅ If schedule exists and not empty, mark as verified
                    if (res.data && Object.keys(res.data).length > 0) {
                        setIsVerified(true);
                    } else {
                        setIsVerified(false);
                    }
                })
                .catch((err) => {
                    console.error("Error fetching exam schedule:", err);
                    setExamSchedule(null);
                    setIsVerified(false);
                });
        } else {
            setIsVerified(false);
        }
    }, [selectedPerson]);


    // ✅ Fetch registrar name (Scheduled By)
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/scheduled-by/registrar`)
            .then((res) => {
                if (res.data?.fullName) setScheduledBy(res.data.fullName);
            })
            .catch((err) => console.error("Error fetching registrar name:", err));
    }, []);

    const printDiv = () => {
        const divToPrint = divToPrintRef.current;
        if (!divToPrint) return;
        const newWin = window.open("", "Print-Window");
        newWin.document.open();
        newWin.document.write(`
      <html>
        <head><title>Print</title></head>
        <body onload="window.print(); setTimeout(() => window.close(), 100);">
          ${divToPrint.innerHTML}
        </body>
      </html>
    `);
        newWin.document.close();
    };

    const [showPrintView, setShowPrintView] = useState(false);

    const handlePrintClick = async () => {
        if (!selectedPerson?.person_id) {
            alert("Please select a person first.");
            return;
        }

        // Fetch fresh person data before printing
        await fetchPersonData(selectedPerson.person_id);

        // Show print layout (hidden in normal view)
        setShowPrintView(true);

        // Wait a moment to ensure rendering is complete
        setTimeout(() => {
            printDiv();
            setShowPrintView(false);
        }, 200);
    };



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
        <Box sx={{ height: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: 1, backgroundColor: 'transparent' }}>



            <div className="section">

                {/* Top header: DOCUMENTS SUBMITTED + Search */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',

                        mb: 2,

                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            color: 'maroon',
                            fontSize: '36px',
                        }}
                    >
                        EXAMINATION PROFILE
                    </Typography>

                    <TextField
                        variant="outlined"
                        placeholder="Search Applicant Name / Email / Applicant ID"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            width: 450,
                            backgroundColor: "#fff",
                            borderRadius: 1,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                            },
                        }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
                        }}
                    />
                </Box>

                <hr style={{ border: "1px solid #ccc", width: "100%" }} />

                <br />


                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "nowrap", // ❌ prevent wrapping
                        width: "100%",
                        mt: 3,
                        gap: 2,
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Card
                            key={index}
                            onClick={() => handleStepClick(index, tab.to)}
                            sx={{
                                flex: `1 1 ${100 / tabs.length}%`, // evenly divide row
                                height: 120,
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
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Box sx={{ fontSize: 40, mb: 1 }}>{tab.icon}</Box>
                                <Typography sx={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}>
                                    {tab.label}
                                </Typography>
                            </Box>
                        </Card>
                    ))}
                </Box>


                <div style={{ height: "20px" }}></div>
                <TableContainer component={Paper} sx={{ width: '100%', }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#6D2323' }}>
                            <TableRow>
                                {/* Left cell: Applicant ID */}
                                <TableCell sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}>
                                    Applicant ID:&nbsp;
                                    <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                        {selectedPerson?.applicant_number || "N/A"}
                                    </span>
                                </TableCell>

                                {/* Right cell: Applicant Name, right-aligned */}
                                <TableCell
                                    align="right"
                                    sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}
                                >
                                    Applicant Name:&nbsp;
                                    <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                        {selectedPerson?.last_name?.toUpperCase()}, {selectedPerson?.first_name?.toUpperCase()}{" "}
                                        {selectedPerson?.middle_name?.toUpperCase()} {selectedPerson?.extension_name?.toUpperCase() || ""}
                                    </span>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>


                <button
                    onClick={handlePrintClick}
                    style={{
                        marginBottom: "1rem",
                        padding: "10px 20px",
                        border: "2px solid black",
                        backgroundColor: "#f0f0f0",
                        color: "black",
                        borderRadius: "5px",
                        marginTop: "20px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        transition: "background-color 0.3s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#d3d3d3")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                    onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
                    onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FcPrint size={20} />
                        Print Examination Permit
                    </span>
                </button>

                {selectedPerson && (
                    <div ref={divToPrintRef} style={{ position: "relative" }}>
                        {/* ✅ VERIFIED Watermark */}
                        <div
                            style={{
                                position: "absolute",
                                top: "30%",
                                left: "50%",
                                transform: "translate(-50%, -50%) rotate(-30deg)",
                                fontSize: "6.30rem",
                                fontWeight: "900",
                                color: isVerified ? "rgba(0, 128, 0, 0.15)" : "rgba(255, 0, 0, 0.15)", // green if verified, red if not
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                userSelect: "none",
                                zIndex: 0,
                                fontFamily: "'Arial Black', sans-serif",
                                letterSpacing: "0.3rem",
                            }}
                        >
                            {isVerified ? "VERIFIED" : "NOT VERIFIED"}
                        </div>


                        <div className="section">
                            <table
                                className="student-table"
                                style={{
                                    borderCollapse: "collapse",
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                    width: "8in",
                                    margin: "0 auto", // Center the table inside the form
                                    textAlign: "center",
                                    tableLayout: "fixed",
                                }}
                            >
                                <style>{`
          .certificate-wrapper {
            position: relative;
          }

          .certificate-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 8rem;
            font-weight: 900;
            color: rgba(0, 128, 0, 0.15); /* light green tint */
            text-transform: uppercase;
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
            z-index: 9999;
            font-family: 'Arial Black', sans-serif;
            letter-spacing: 0.3rem;
          }

          @media print {
            .certificate-watermark {
              color: rgba(0, 128, 0, 0.25); /* darker green for printing */
            }
            button {
              display: none;
            }
          }
        `}</style>



                                <tbody>
                                    <tr>
                                        <td colSpan={2} style={{ height: "0.1in", fontSize: "72.5%" }}>
                                            <b>

                                            </b>
                                        </td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                        <td colSpan={1} style={{ height: "0.1in", fontSize: "72.5%" }}></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} style={{ height: "0.1in", fontSize: "62.5%" }}>

                                        </td>
                                    </tr>
                                    <tr>

                                        <td colSpan={40} style={{ height: "0.5in", textAlign: "center" }}>
                                            {/* Header */}
                                            <table width="100%" style={{ borderCollapse: "collapse", marginTop: "-30px", fontFamily: "Arial" }}>
                                                <tbody>
                                                    <tr>


                                                        <td style={{ width: "20%", textAlign: "center" }}>
                                                            <img
                                                                src={fetchedLogo}
                                                                alt="School Logo"
                                                                style={{
                                                                    marginLeft: "-10px",
                                                                    width: "140px",
                                                                    height: "140px",

                                                                    borderRadius: "50%", // ✅ perfectly circular
                                                                    objectFit: "cover",

                                                                }}
                                                            />
                                                        </td>

                                                        {/* Center Column - School Information */}
                                                        <td style={{ width: "60%", textAlign: "center", lineHeight: "1", }}>
                                                            <div>Republic of the Philippines</div>
                                                            <div
                                                                style={{
                                                                    letterSpacing: "1px",
                                                                    fontSize: "20px",
                                                                    fontFamily: "Times new roman",
                                                                }}
                                                            >
                                                                {firstLine}
                                                            </div>
                                                            {secondLine && (
                                                                <div
                                                                    style={{
                                                                        letterSpacing: "1px",
                                                                        fontSize: "20px",
                                                                        fontFamily: "Times new roman",
                                                                    }}
                                                                >
                                                                    <b>{secondLine}</b>
                                                                </div>
                                                            )}
                                                            {campusAddress && (
                                                                <div style={{ fontSize: "16px", letterSpacing: "1px", fontFamily: "Arial" }}>
                                                                    {campusAddress}
                                                                </div>
                                                            )}

                                                            {/* Add spacing here */}
                                                            <div style={{ marginTop: "30px" }}>
                                                                <b style={{ fontSize: "24px", letterSpacing: '1px', fontWeight: "bold" }}>
                                                                    EXAMINATION PERMIT
                                                                </b>
                                                            </div>
                                                        </td>

                                                        <td
                                                            colSpan={4}
                                                            rowSpan={6}
                                                            style={{
                                                                textAlign: "center",
                                                                position: "relative",
                                                                width: "4.5cm",
                                                                height: "4.5cm",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: "4.70cm",
                                                                    height: "4.70cm",
                                                                    marginRight: "10px",
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    position: "relative",
                                                                    border: "2px solid black",
                                                                    overflow: "hidden",
                                                                    borderRadius: "4px",
                                                                }}
                                                            >
                                                                {person.profile_img ? (
                                                                    <img
                                                                        src={`http://localhost:5000/uploads/${person.profile_img}`}
                                                                        alt="Profile"
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover",

                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: "12px", color: "#888" }}>No Image</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>

                                    </tr>


                                </tbody>
                            </table>
                            <div style={{ height: "30px" }}></div>
                            <table
                                className="student-table"
                                style={{
                                    borderCollapse: "collapse",
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                    width: "8in",
                                    margin: "0 auto",


                                    textAlign: "center",
                                    tableLayout: "fixed",
                                }}
                            >

                                <tbody>
                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={40}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    width: "100%",
                                                    gap: "10px",
                                                }}
                                            >
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                                    Applicant No.:
                                                </label>
                                                <div
                                                    style={{
                                                        borderBottom: "1px solid black",
                                                        fontFamily: "Arial",
                                                        fontWeight: "normal",
                                                        fontSize: "15px",
                                                        minWidth: "278px",
                                                        height: "1.2em",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {selectedPerson?.applicant_number}
                                                </div>
                                            </div>
                                        </td>


                                    </tr>

                                    {/* Email & Applicant ID */}
                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={20}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-start",
                                                    width: "100%",
                                                    gap: "10px",
                                                }}
                                            >
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                                    Name:
                                                </label>
                                                <div
                                                    style={{
                                                        borderBottom: "1px solid black",
                                                        fontFamily: "Arial",
                                                        fontWeight: "normal",
                                                        fontSize: "15px",
                                                        minWidth: "328px",
                                                        height: "1.2em",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {selectedPerson?.last_name?.toUpperCase()}, {selectedPerson?.first_name?.toUpperCase()}{" "}
                                                    {selectedPerson?.middle_name?.toUpperCase() || ""}{" "}
                                                    {selectedPerson?.extension?.toUpperCase() || ""}
                                                </div>
                                            </div>
                                        </td>


                                        <td colSpan={20}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: "10px" }}>Permit No.:</label>
                                                <span style={{ flexGrow: 1, borderBottom: "1px solid black", height: "1.2em", textAlign: "left", fontFamily: "Arial" }}>{selectedPerson?.applicant_number}</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={20}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "100%",
                                                    gap: "10px",
                                                }}
                                            >
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                                    Course Applied:
                                                </label>
                                                <div
                                                    style={{
                                                        borderBottom: "1px solid black",
                                                        fontFamily: "Arial",
                                                        fontWeight: "normal",
                                                        fontSize: "15px",
                                                        minWidth: "265px",
                                                        width: "100%", // make it extend to available space
                                                        display: "flex",
                                                        alignItems: "center",
                                                        paddingRight: "5px",
                                                        overflowWrap: "break-word", // allows long course names to wrap
                                                    }}
                                                >
                                                    {curriculumOptions.length > 0
                                                        ? curriculumOptions.find(
                                                            (item) =>
                                                                item?.curriculum_id?.toString() === (person?.program ?? "").toString()
                                                        )?.program_description || (person?.program ?? "")
                                                        : "Loading..."}
                                                </div>
                                            </div>
                                        </td>

                                        <td colSpan={20}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "100%",
                                                    gap: "10px",
                                                }}
                                            >
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>Major:</label>
                                                <div
                                                    style={{
                                                        borderBottom: "1px solid black",
                                                        fontFamily: "Arial",
                                                        fontWeight: "normal",
                                                        fontSize: "15px",
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        paddingRight: "5px",
                                                        overflowWrap: "break-word", // allows long major names to wrap
                                                    }}
                                                >
                                                    {curriculumOptions.length > 0
                                                        ? curriculumOptions.find(
                                                            (item) =>
                                                                item?.curriculum_id?.toString() === (person?.program ?? "").toString()
                                                        )?.major || ""
                                                        : "Loading..."}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>


                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={20}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: "10px" }}>Date of Exam:</label>
                                                <span style={{ flexGrow: 1, borderBottom: "1px solid black", height: "1.2em", fontFamily: "Arial", textAlign: "left" }}>
                                                    {examSchedule?.date_of_exam}
                                                </span>
                                            </div>
                                        </td>
                                        <td colSpan={20}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                <label
                                                    style={{
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                    Time :
                                                </label>
                                                <span
                                                    style={{
                                                        flexGrow: 1,
                                                        borderBottom: "1px solid black",
                                                        height: "1.2em",
                                                        fontFamily: "Arial",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    {examSchedule
                                                        ? new Date(`1970-01-01T${examSchedule.start_time}`).toLocaleTimeString(
                                                            "en-US",
                                                            { hour: "numeric", minute: "2-digit", hour12: true }
                                                        )
                                                        : ""}
                                                </span>
                                            </div>
                                        </td>

                                    </tr>

                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={20}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%", marginTop: "-85px" }}>
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: "10px" }}>
                                                    Bldg. :
                                                </label>
                                                <span
                                                    style={{
                                                        flexGrow: 1,
                                                        borderBottom: "1px solid black",
                                                        height: "1.2em",
                                                        fontFamily: "Arial",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    {examSchedule?.building_description || ""}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Room No. + QR side by side */}
                                        <td colSpan={20}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "100%",
                                                    justifyContent: "space-between", // space text & QR
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", marginTop: "-148px" }}>
                                                    <label
                                                        style={{
                                                            fontWeight: "bold",
                                                            whiteSpace: "nowrap",
                                                            marginRight: "10px",
                                                        }}
                                                    >
                                                        Room No. :
                                                    </label>
                                                    <span
                                                        style={{
                                                            flexGrow: 1,
                                                            borderBottom: "1px solid black",
                                                            height: "1.2em",
                                                            fontFamily: "Arial",
                                                            marginRight: "20px",
                                                            width: "140px",
                                                            textAlign: "left"
                                                        }}
                                                    >
                                                        {examSchedule?.room_description || ""}
                                                    </span>
                                                </div>

                                                {selectedPerson?.applicant_number && (
                                                    <div
                                                        style={{
                                                            width: "4.5cm",
                                                            height: "4.5cm",
                                                            borderRadius: "4px",
                                                            background: "#fff",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            position: "relative",
                                                            overflow: "hidden",
                                                            marginLeft: "10px"
                                                        }}
                                                    >
                                                        <QRCodeSVG
                                                            value={`http://localhost:5173/examination_profile/${selectedPerson.applicant_number}`}
                                                            size={150}
                                                            level="H"
                                                        />
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                                color: "maroon",
                                                                background: "white",
                                                                padding: "2px 4px",
                                                                borderRadius: "2px",
                                                            }}
                                                        >
                                                            {selectedPerson.applicant_number}
                                                        </div>
                                                    </div>
                                                )}


                                            </div>
                                        </td>
                                    </tr>



                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={20}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%", marginTop: "-148px" }}>
                                                <label
                                                    style={{
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        marginRight: "10px",
                                                    }}
                                                >
                                                    Date:
                                                </label>
                                                <span
                                                    style={{
                                                        flexGrow: 1,
                                                        borderBottom: "1px solid black",
                                                        height: "1.2em",
                                                        fontFamily: "Arial",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    {examSchedule?.schedule_created_at
                                                        ? new Date(examSchedule.schedule_created_at).toLocaleDateString("en-US", {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })
                                                        : ""}
                                                </span>
                                            </div>
                                        </td>

                                    </tr>

                                    <tr style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                        <td colSpan={20}>
                                            <div style={{ display: "flex", alignItems: "center", width: "100%", marginTop: "-128px" }}>
                                                <label style={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: "10px" }}>Scheduled by:</label>
                                                <span
                                                    style={{
                                                        flexGrow: 1,
                                                        borderBottom: "1px solid black",
                                                        fontFamily: "Arial",
                                                    }}
                                                >
                                                    {scheduledBy || "N/A"}
                                                </span>

                                            </div>
                                        </td>
                                    </tr>

                                </tbody>
                            </table>



                            <table
                                className="student-table"
                                style={{

                                    borderCollapse: "collapse",
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                    width: "8in",
                                    margin: "0 auto", // Center the table inside the form
                                    textAlign: "center",
                                    tableLayout: "fixed",
                                    border: "1px solid black"
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td
                                            colSpan={40}
                                            style={{
                                                textAlign: "justify",
                                                color: "black",
                                                padding: "8px",
                                                lineHeight: "1.5",
                                                textAlign: "Center",

                                                fontSize: "14px",
                                                fontFamily: "Arial, Helvetica, sans-serif",

                                                fontWeight: "200px"
                                            }}
                                        >
                                            <strong>
                                                <div>NOTE: Please bring this examination permit on the examination day together with</div>
                                                <div>Two short bond paper, pencil w/ erasers & ballpen. Please come on decent attire</div>
                                                <div>(no sleeveless or shorts) at least 1 hour before the examination</div>
                                            </strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                )}
            </div>



        </Box>
    );
};

export default ExaminationProfile;
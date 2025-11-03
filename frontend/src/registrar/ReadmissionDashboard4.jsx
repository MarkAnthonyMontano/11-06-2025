import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Box, TextField, Container, Typography, Card, TableContainer, Paper, Table, TableHead, TableRow, TableCell, FormHelperText, FormControl, InputLabel, Select, MenuItem, Modal, FormControlLabel, Checkbox, FormGroup, TableBody, } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ExamPermit from "../applicant/ExamPermit";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";


const ReadmissionDashboard4 = () => {
    const navigate = useNavigate();
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [person, setPerson] = useState({
        cough: "", colds: "", fever: "", asthma: "", fainting: "", heartDisease: "", tuberculosis: "",
        frequentHeadaches: "", hernia: "", chronicCough: "", headNeckInjury: "", hiv: "", highBloodPressure: "",
        diabetesMellitus: "", allergies: "", cancer: "", smoking: "", alcoholDrinking: "", hospitalized: "",
        hospitalizationDetails: "", medications: "", hadCovid: "", covidDate: "",
        vaccine1Brand: "", vaccine1Date: "", vaccine2Brand: "", vaccine2Date: "",
        booster1Brand: "", booster1Date: "", booster2Brand: "", booster2Date: "",
        chestXray: "", cbc: "", urinalysis: "", otherworkups: "", symptomsToday: "", remarks: ""
    });


    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);


    const pageId = 48;

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


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryPersonId = queryParams.get("person_id")?.trim() || "";



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

        // Roles that can access
        const allowedRoles = ["registrar", "applicant", "superadmin"];
        if (allowedRoles.includes(storedRole)) {
            // ✅ Always take URL param first
            const targetId = queryPersonId || searchedPersonId || loggedInPersonId;

            // Save it so other pages (ECAT, forms) can use it
            sessionStorage.setItem("admin_edit_person_id", targetId);

            setUserID(targetId);
            fetchByPersonId(targetId);
            return;
        }

        window.location.href = "/login";
    }, [queryPersonId]);

    const [selectedPerson, setSelectedPerson] = useState(null);

    const fetchByPersonId = async (personID) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/person/${personID}`);
            setPerson(res.data);
            setSelectedPerson(res.data);
            if (res.data?.applicant_number) {
                // optional: whatever logic you want
            }
        } catch (err) {
            console.error("❌ person (DB3) fetch failed:", err);
        }
    };


    useEffect(() => {
        let consumedFlag = false;

        const tryLoad = async () => {
            if (queryPersonId) {
                await fetchByPersonId(queryPersonId);
                setExplicitSelection(true);
                consumedFlag = true;
                return;
            }

            // fallback only if it's a fresh selection from Applicant List
            const source = sessionStorage.getItem("admin_edit_person_id_source");
            const tsStr = sessionStorage.getItem("admin_edit_person_id_ts");
            const id = sessionStorage.getItem("admin_edit_person_id");
            const ts = tsStr ? parseInt(tsStr, 10) : 0;
            const isFresh = source === "applicant_list" && Date.now() - ts < 5 * 60 * 1000;

            if (id && isFresh) {
                await fetchByPersonId(id);
                setExplicitSelection(true);
                consumedFlag = true;
            }
        };

        tryLoad().finally(() => {
            // consume the freshness so it won't auto-load again later
            if (consumedFlag) {
                sessionStorage.removeItem("admin_edit_person_id_source");
                sessionStorage.removeItem("admin_edit_person_id_ts");
            }
        });
    }, [queryPersonId]);






    // 🧠 Updates record in ENROLLMENT.person_table in real time
    const handleUpdate = async (updatedPerson) => {
        try {
            // ✅ force the request to the enrollment route
            await axios.put(`http://localhost:5000/api/enrollment/person/${userID}`, updatedPerson);
            console.log("✅ Auto-saved to ENROLLMENT DB3");
        } catch (error) {
            console.error("❌ Auto-save failed:", error);
        }
    };

    // Real-time save on every character typed
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        const updatedPerson = {
            ...person,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        };
        setPerson(updatedPerson);
        handleUpdate(updatedPerson); // No delay, real-time save
    };



    // 🖱️ Triggered when input loses focus (safety net)
    const handleBlur = async () => {
        try {
            await axios.put(`http://localhost:5000/api/enrollment/person/${userID}`, person);
            console.log("✅ Auto-saved (on blur) to ENROLLMENT DB3");
        } catch (err) {
            console.error("❌ Auto-save failed (on blur):", err);
        }
    };

    const [activeStep, setActiveStep] = useState(3);
    const [clickedSteps, setClickedSteps] = useState([]);

    const steps = [
        { label: "Personal Information", icon: <PersonIcon />, path: "/readmission_dashboard1" },
        { label: "Family Background", icon: <FamilyRestroomIcon />, path: "/readmission_dashboard2" },
        { label: "Educational Attainment", icon: <SchoolIcon />, path: "/readmission_dashboard3" },
        { label: "Health Medical Records", icon: <HealthAndSafetyIcon />, path: "/readmission_dashboard4" },
        { label: "Other Information", icon: <InfoIcon />, path: "/readmission_dashboard5" },
    ];

    const handleStepClick = (index) => {
        setActiveStep(index);
        setClickedSteps((prev) => [...new Set([...prev, index])]);
        navigate(steps[index].path); // Go to the clicked step’s page
    };
    const inputStyle = {
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "6px",
        boxSizing: "border-box",
        backgroundColor: "white",
        color: "black",
    };


    const divToPrintRef = useRef();
    const [showPrintView, setShowPrintView] = useState(false);

    const printDiv = () => {
        const divToPrint = divToPrintRef.current;
        if (divToPrint) {
            const newWin = window.open("", "Print-Window");
            newWin.document.open();
            newWin.document.write(`
        <html>
          <head>
            <title>Examination Permit</title>
            <style>
              @page { size: A4; margin: 0; }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                margin-left: "
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .print-container {
                width: 8.5in;
                min-height: 11in;
                margin: auto;
                background: white;
              }
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 100);">
            <div class="print-container">${divToPrint.innerHTML}</div>
          </body>
        </html>
      `);
            newWin.document.close();
        }
    };


    const [examPermitError, setExamPermitError] = useState("");
    const [examPermitModalOpen, setExamPermitModalOpen] = useState(false);

    const handleCloseExamPermitModal = () => {
        setExamPermitModalOpen(false);
        setExamPermitError("");
    };



    const links = [
        { to: `/admin_ecat_application_form`, label: "ECAT Application Form" },
        { to: `/admission_form_process`, label: "Admission Form Process" },
        { to: `/admin_personal_data_form`, label: "Personal Data Form" },
        { to: `/admin_office_of_the_registrar`, label: "Application For EARIST College Admission" },
        { to: `/admission_services`, label: "Application/Student Satisfactory Survey" },

    ];


    const [canPrintPermit, setCanPrintPermit] = useState(false);

    useEffect(() => {
        if (!userID) return;
        axios.get("http://localhost:5000/api/verified-exam-applicants")
            .then(res => {
                const verified = res.data.some(a => a.person_id === parseInt(userID));
                setCanPrintPermit(verified);
            });
    }, [userID]);



    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState("");
    useEffect(() => {
        const savedPerson = sessionStorage.getItem("admin_edit_person_data");
        if (savedPerson) {
            try {
                const parsed = JSON.parse(savedPerson);
                setPerson(parsed);
            } catch (err) {
                console.error("Failed to parse saved person:", err);
            }
        }
    }, []);


    // Put this at the very bottom before the return 
    if (loading || hasAccess === null) {
        return <LoadingOverlay open={loading} message="Check Access" />;
    }

    if (!hasAccess) {
        return (
            <Unauthorized />
        );
    }


    // dot not alter
    return (
        <Box sx={{ height: "calc(100vh - 140px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>

            {showPrintView && (
                <div ref={divToPrintRef} style={{ display: "block" }}>
                    <ExamPermit personId={userID} />   {/* ✅ pass the searched person_id */}
                </div>
            )}

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
                    READMISSION - HEALTH MEDICAL RECORDS
                </Typography>


            </Box>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <TableContainer component={Paper} sx={{ width: '100%', mb: 1 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#6D2323' }}>
                        <TableRow>
                            {/* Left cell: Student Number */}
                            <TableCell sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}>
                                Student Number:&nbsp;
                                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                    {person?.student_number || "N/A"}
                                </span>
                            </TableCell>

                            {/* Right cell: Student Name */}
                            <TableCell
                                align="right"
                                sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}
                            >
                                Student Name:&nbsp;
                                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                    {person?.last_name?.toUpperCase()}, {person?.first_name?.toUpperCase()}{" "}
                                    {person?.middle_name?.toUpperCase()} {person?.extension?.toUpperCase() || ""}
                                </span>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    mt: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: "10px",
                        backgroundColor: "#fffaf5",
                        border: "1px solid #6D2323",
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                        whiteSpace: "nowrap", // Prevent text wrapping
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#6D2323",
                            borderRadius: "8px",
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                        }}
                    >
                        <ErrorIcon sx={{ color: "white", fontSize: 28 }} />
                    </Box>

                    {/* Text in one row */}
                    <Typography
                        sx={{
                            fontSize: "15px",
                            fontFamily: "Arial",
                            color: "#3e3e3e",
                        }}
                    >
                        <strong style={{ color: "maroon" }}>Notice:</strong> &nbsp;
                        <strong>1.</strong> Kindly type <strong>'NA'</strong> in boxes where there are no possible answers to the information being requested. &nbsp; | &nbsp;
                        <strong>2.</strong> To use the letter <strong>'Ñ'</strong>, press <kbd>ALT</kbd> + <kbd>165</kbd>; for <strong>'ñ'</strong>, press <kbd>ALT</kbd> + <kbd>164</kbd>. &nbsp; | &nbsp;
                        <strong>3.</strong> This is the list of all printable files.
                    </Typography>
                </Box>
            </Box>

            {/* Cards Section */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mt: 2,
                    pb: 1,
                    justifyContent: "center", // Centers all cards horizontally
                }}
            >
                {links.map((lnk, i) => (
                    <motion.div
                        key={i}
                        style={{ flex: "0 0 calc(30% - 16px)" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                        <Card
                            sx={{
                                minHeight: 60,
                                borderRadius: 2,
                                border: "2px solid #6D2323",
                                backgroundColor: "#fff",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                p: 1.5,
                                cursor: "pointer",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#6D2323", // ✅ background becomes maroon
                                    "& .card-text": {
                                        color: "#fff", // ✅ text becomes white
                                    },
                                    "& .card-icon": {
                                        color: "#fff", // ✅ icon becomes white
                                    },
                                },
                            }}
                            onClick={() => {
                                if (lnk.onClick) {
                                    lnk.onClick(); // run handler
                                } else if (lnk.to) {
                                    navigate(lnk.to); // navigate if it has a `to`
                                }
                            }}
                        >
                            {/* Icon */}
                            <PictureAsPdfIcon
                                className="card-icon"
                                sx={{ fontSize: 35, color: "#6D2323", mr: 1.5 }}
                            />

                            {/* Label */}
                            <Typography
                                className="card-text"
                                sx={{
                                    color: "#6D2323",
                                    fontFamily: "Arial",
                                    fontWeight: "bold",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {lnk.label}
                            </Typography>
                        </Card>
                    </motion.div>
                ))}
            </Box>




            <Container>


                <Container>
                    <h1 style={{ fontSize: "50px", fontWeight: "bold", textAlign: "center", color: "maroon", marginTop: "25px" }}>APPLICANT FORM</h1>
                    <div style={{ textAlign: "center" }}>Complete the applicant form to secure your place for the upcoming academic year at EARIST.</div>
                </Container>
                <br />

                <Box sx={{ display: "flex", justifyContent: "center", width: "100%", px: 4 }}>
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleStepClick(index)}
                            >
                                <Box
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: "50%",
                                        backgroundColor: activeStep === index ? "#6D2323" : "#E8C999",
                                        color: activeStep === index ? "#fff" : "#000",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {step.icon}
                                </Box>
                                <Typography
                                    sx={{
                                        mt: 1,
                                        color: activeStep === index ? "#6D2323" : "#000",
                                        fontWeight: activeStep === index ? "bold" : "normal",
                                        fontSize: 14,
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </Box>
                            {index < steps.length - 1 && (
                                <Box
                                    sx={{
                                        height: "2px",
                                        backgroundColor: "#6D2323",
                                        flex: 1,
                                        alignSelf: "center",
                                        mx: 2,
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </Box>

                <br />

                <form>
                    <Container
                        maxWidth="100%"
                        sx={{
                            backgroundColor: "#6D2323",
                            border: "2px solid black",
                            maxHeight: "500px",
                            overflowY: "auto",
                            color: "white",
                            borderRadius: 2,
                            boxShadow: 3,
                            padding: "4px",
                        }}
                    >
                        <Box sx={{ width: "100%" }}>
                            <Typography style={{ fontSize: "20px", padding: "10px", fontFamily: "Arial Black" }}>Step 4: Health and Medical Records</Typography>
                        </Box>
                    </Container>

                    <Container maxWidth="100%" sx={{ backgroundColor: "#f1f1f1", border: "2px solid black", padding: 4, borderRadius: 2, boxShadow: 3 }}>
                        <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Health and Mecidal Record:</Typography>
                        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                        <br />


                        <Typography variant="subtitle1" mb={1}>
                            <div style={{ fontWeight: "bold" }}>I. Do you have any of the following symptoms today?</div>
                        </Typography>

                        <FormGroup row sx={{ ml: 2 }}>
                            {["cough", "colds", "fever"].map((symptom) => (
                                <FormControlLabel
                                disabled
                                    key={symptom}
                                    control={
                                        <Checkbox
                                            name={symptom}
                                            checked={person[symptom] === 1}
                                            onChange={(e) => {
                                                const { name, checked } = e.target;
                                                const updatedPerson = {
                                                    ...person,
                                                    [name]: checked ? 1 : 0,
                                                };
                                                setPerson(updatedPerson);
                                                handleUpdate(updatedPerson);
                                            }}
                                            onBlur={handleBlur}
                                        />
                                    }
                                    label={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                                    sx={{ ml: 5 }}
                                />
                            ))}
                        </FormGroup>

                        <br />

                        <Typography variant="subtitle1" mb={1}>
                            <div style={{ fontWeight: "bold" }}>II. MEDICAL HISTORY: Have you suffered from, or been told you had, any of the following conditions:</div>
                        </Typography>


                        <table
                            style={{
                                width: "100%",
                                border: "1px solid black",
                                borderCollapse: "collapse",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                tableLayout: "fixed",
                            }}
                        >
                            <tbody>
                                {/* Headers */}
                                <tr>
                                    <td colSpan={15} style={{ border: "1px solid black", height: "0.25in" }}></td>
                                    <td colSpan={12} style={{ border: "1px solid black", textAlign: "center" }}>Yes or No</td>
                                    <td colSpan={15} style={{ border: "1px solid black", height: "0.25in" }}></td>
                                    <td colSpan={12} style={{ border: "1px solid black", textAlign: "center" }}>Yes or No</td>
                                    <td colSpan={15} style={{ border: "1px solid black", height: "0.25in" }}></td>
                                    <td colSpan={12} style={{ border: "1px solid black", textAlign: "center" }}>Yes or No</td>
                                </tr>

                                {[
                                    { label: "Asthma", key: "asthma" },
                                    { label: "Fainting Spells and seizures", key: "faintingSpells" },
                                    { label: "Heart Disease", key: "heartDisease" },
                                    { label: "Tuberculosis", key: "tuberculosis" },
                                    { label: "Frequent Headaches", key: "frequentHeadaches" },
                                    { label: "Hernia", key: "hernia" },
                                    { label: "Chronic cough", key: "chronicCough" },
                                    { label: "Head or neck injury", key: "headNeckInjury" },
                                    { label: "H.I.V", key: "hiv" },
                                    { label: "High blood pressure", key: "highBloodPressure" },
                                    { label: "Diabetes Mellitus", key: "diabetesMellitus" },
                                    { label: "Allergies", key: "allergies" },
                                    { label: "Cancer", key: "cancer" },
                                    { label: "Smoking of cigarette/day", key: "smokingCigarette" },
                                    { label: "Alcohol Drinking", key: "alcoholDrinking" },
                                ]
                                    .reduce((rows, item, idx, arr) => {
                                        if (idx % 3 === 0) rows.push(arr.slice(idx, idx + 3));
                                        return rows;
                                    }, [])
                                    .map((rowGroup, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {rowGroup.map(({ label, key }) => (
                                                <React.Fragment key={key}>
                                                    <td colSpan={15} style={{ border: "1px solid black", padding: "4px" }}>{label}</td>
                                                    <td colSpan={12} style={{ border: "1px solid black", padding: "4px" }}>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "10px" }}>
                                                                {/* YES */}
                                                                <div style={{ display: "flex", alignItems: "center", gap: "1px", }}>
                                                                    <Checkbox
                                                                    disabled
                                                                        name={key}
                                                                        checked={person[key] === 1}
                                                                        onChange={() => {
                                                                            const updatedPerson = {
                                                                                ...person,
                                                                                [key]: person[key] === 1 ? null : 1,
                                                                            };
                                                                            setPerson(updatedPerson);
                                                                            handleUpdate(updatedPerson);
                                                                        }}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                    <span style={{ fontSize: "15px", fontFamily: "Arial" }}>Yes</span>
                                                                </div>

                                                                {/* NO */}
                                                                <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                                                                    <Checkbox
                                                                    disabled
                                                                        name={key}
                                                                        checked={person[key] === 0}
                                                                        onChange={() => {
                                                                            const updatedPerson = {
                                                                                ...person,
                                                                                [key]: person[key] === 0 ? null : 0,
                                                                            };
                                                                            setPerson(updatedPerson);
                                                                            handleUpdate(updatedPerson);
                                                                        }}
                                                                        onBlur={handleBlur}
                                                                    />
                                                                    <span style={{ fontSize: "15px", fontFamily: "Arial" }}>No</span>
                                                                </div>
                                                            </div>


                                                        </div>
                                                    </td>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>



                        <Box mt={1} flexDirection="column" display="flex" alignItems="flex-start">
                            <Box mt={1} flexDirection="column" display="flex" alignItems="flex-start">
                                <Box display="flex" alignItems="center" flexWrap="wrap">
                                    <Typography sx={{ marginRight: '16px' }}>
                                        Do you have any previous history of hospitalization or operation?
                                    </Typography>

                                    <Box display="flex" gap="16px" ml={4} alignItems="center">
                                        {/* YES */}
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                disabled
                                                    name="hospitalized"
                                                    checked={person.hospitalized === 1}
                                                    onChange={() => {
                                                        const updatedPerson = {
                                                            ...person,
                                                            hospitalized: person.hospitalized === 1 ? null : 1,
                                                        };
                                                        setPerson(updatedPerson);
                                                        handleUpdate(updatedPerson);
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                            }
                                            label="Yes"
                                        />

                                        {/* NO */}
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                disabled
                                                    name="hospitalized"
                                                    checked={person.hospitalized === 0}
                                                    onChange={() => {
                                                        const updatedPerson = {
                                                            ...person,
                                                            hospitalized: person.hospitalized === 0 ? null : 0,
                                                        };
                                                        setPerson(updatedPerson);
                                                        handleUpdate(updatedPerson);
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                            }
                                            label="No"
                                        />


                                    </Box>
                                </Box>
                            </Box>
                        </Box>




                        <Box width="100%" maxWidth={500} display="flex" alignItems="center">
                            <Typography component="label" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                                IF YES, PLEASE SPECIFY:
                            </Typography>
                            <TextField
                                  InputProps={{ readOnly: true }}

                                fullWidth
                                name="hospitalizationDetails"
                                placeholder=""
                                variant="outlined"
                                size="small"
                                value={person.hospitalizationDetails || ""}
                                onChange={(e) => {
                                    const { name, value } = e.target;
                                    const updatedPerson = {
                                        ...person,
                                        [name]: value,
                                    };
                                    setPerson(updatedPerson);
                                    handleUpdate(updatedPerson);
                                }}
                                onBlur={handleBlur}
                            />
                        </Box>

                        <br />

                        <Typography variant="subtitle1" mb={1}>
                            <div style={{ fontWeight: "bold" }}>III. MEDICATION</div>
                        </Typography>



                        <Box mb={2}>
                            <TextField
                                   InputProps={{ readOnly: true }}

                                fullWidth
                                multiline
                                minRows={3}
                                name="medications"
                                variant="outlined"
                                size="small"
                                value={person.medications || ""}
                                onChange={(e) => {
                                    const { name, value } = e.target;
                                    const updatedPerson = {
                                        ...person,
                                        [name]: value,
                                    };
                                    setPerson(updatedPerson);
                                    handleUpdate(updatedPerson);
                                }}
                                onBlur={handleBlur}
                            />
                        </Box>

                        {/* IV. COVID PROFILE */}
                        <Typography variant="subtitle1" mb={1}>
                            <div style={{ fontWeight: "bold" }}>IV. COVID PROFILE: </div>
                        </Typography>


                        <table
                            style={{
                                border: "1px solid black",
                                borderCollapse: "collapse",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                width: "100%",
                                tableLayout: "fixed",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td
                                        style={{
                                            height: "90px",
                                            fontSize: "100%",
                                            border: "1px solid black",
                                            padding: "8px",
                                        }}
                                    >

                                        <Box display="flex" alignItems="center" gap={2} flexWrap="nowrap">
                                            <Typography>A. Do you have history of COVID-19?</Typography>

                                            {/* YES/NO Checkboxes */}
                                            <Box display="flex" alignItems="center" gap="10px" ml={1}>
                                                {/* YES */}
                                                <Box display="flex" alignItems="center" gap="1px">
                                                    <Checkbox
                                                    disabled
                                                        name="hadCovid"
                                                        checked={person.hadCovid === 1}
                                                        onChange={() => {
                                                            const updatedPerson = {
                                                                ...person,
                                                                hadCovid: person.hadCovid === 1 ? null : 1,
                                                            };
                                                            setPerson(updatedPerson);
                                                            handleUpdate(updatedPerson);
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <span style={{ fontSize: "15px", fontFamily: "Arial" }}>YES</span>
                                                </Box>

                                                {/* NO */}
                                                <Box display="flex" alignItems="center" gap="1px">
                                                    <Checkbox
                                                    disabled
                                                        name="hadCovid"
                                                        checked={person.hadCovid === 0}
                                                        onChange={() => {
                                                            const updatedPerson = {
                                                                ...person,
                                                                hadCovid: person.hadCovid === 0 ? null : 0,
                                                            };
                                                            setPerson(updatedPerson);
                                                            handleUpdate(updatedPerson);
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <span style={{ fontSize: "15px", fontFamily: "Arial" }}>NO</span>


                                                </Box>
                                            </Box>

                                            {/* IF YES, WHEN */}
                                            <span>IF YES, WHEN:</span>
                                            <input
                                            readOnly
                                                type="date"
                                                name="covidDate"
                                                value={person.covidDate || ""}
                                                onChange={(e) => {
                                                    const updatedPerson = {
                                                        ...person,
                                                        covidDate: e.target.value,
                                                    };
                                                    setPerson(updatedPerson);
                                                    handleUpdate(updatedPerson);
                                                }}
                                                onBlur={handleBlur}
                                                style={{
                                                    width: "200px",
                                                    height: "50px",
                                                    fontSize: "16px",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                        </Box>
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        style={{
                                            fontSize: "100%",
                                            border: "1px solid black",
                                            padding: "8px",
                                        }}
                                    >
                                        <div style={{ marginBottom: "8px" }}>
                                            B. COVID Vaccinations:
                                        </div>
                                        <table
                                            style={{
                                                borderCollapse: "collapse",
                                                width: "100%",
                                                fontFamily: "Arial, Helvetica, sans-serif",
                                                tableLayout: "fixed",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: "left", width: "20%" }}></th>
                                                    <th style={{ textAlign: "center" }}>1st Dose</th>
                                                    <th style={{ textAlign: "center" }}>2nd Dose</th>
                                                    <th style={{ textAlign: "center" }}>Booster 1</th>
                                                    <th style={{ textAlign: "center" }}>Booster 2</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* Brand Row */}
                                                <tr>
                                                    <td style={{ padding: "4px 0" }}>Brand</td>

                                                    {["vaccine1Brand", "vaccine2Brand", "booster1Brand", "booster2Brand"].map((field) => (
                                                        <td key={field} style={{ padding: "4px" }}>
                                                            <input
                                                            disabled
                                                                type="text"
                                                                name={field}
                                                                value={person[field] || ""}
                                                                onChange={(e) => {
                                                                    const updatedPerson = {
                                                                        ...person,
                                                                        [field]: e.target.value,
                                                                    };
                                                                    setPerson(updatedPerson);
                                                                    handleUpdate(updatedPerson);
                                                                }}
                                                                onBlur={handleBlur}
                                                                style={inputStyle}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Date Row */}
                                                <tr>
                                                    <td style={{ padding: "4px 0" }}>Date</td>

                                                    {["vaccine1Date", "vaccine2Date", "booster1Date", "booster2Date"].map((field) => (
                                                        <td key={field} style={{ padding: "4px" }}>
                                                            <input
                                                            readOnly
                                                                type="date"
                                                                name={field}
                                                                value={person[field] || ""}
                                                                onChange={(e) => {
                                                                    const updatedPerson = {
                                                                        ...person,
                                                                        [field]: e.target.value,
                                                                    };
                                                                    setPerson(updatedPerson);
                                                                    handleUpdate(updatedPerson);
                                                                }}
                                                                onBlur={handleBlur}
                                                                style={inputStyle}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>

                                    </td>
                                </tr>

                            </tbody>
                        </table>

                        <br />
                        {/* V. Please Indicate Result of the Following (Form Style, Table Layout) */}
                        <Typography variant="subtitle1" mb={1}>
                            <div style={{ fontWeight: "bold" }}>V. Please Indicate Result of the Following:</div>
                        </Typography>


                        <table className="w-full border border-black border-collapse table-fixed">
                            <tbody>
                                {/* Chest X-ray */}
                                <tr>
                                    <td className="border border-black p-2 w-1/3 font-medium">Chest X-ray:</td>
                                    <td className="border border-black p-2 w-2/3">
                                        <input
                                        readOnly
                                            type="text"
                                            name="chestXray"
                                            value={person.chestXray || ""}
                                            onChange={(e) => {
                                                const { name, value } = e.target;
                                                const updatedPerson = { ...person, [name]: value };
                                                setPerson(updatedPerson);
                                                handleUpdate(updatedPerson);
                                            }}
                                            onBlur={handleBlur}
                                            className="w-full border px-3 py-2 rounded"
                                        />
                                    </td>
                                </tr>

                                {/* CBC */}
                                <tr>
                                    <td className="border border-black p-2 font-medium">CBC:</td>
                                    <td className="border border-black p-2">
                                        <input
                                        readOnly
                                            type="text"
                                            name="cbc"
                                            value={person.cbc || ""}
                                            onChange={(e) => {
                                                const { name, value } = e.target;
                                                const updatedPerson = { ...person, [name]: value };
                                                setPerson(updatedPerson);
                                                handleUpdate(updatedPerson);
                                            }}
                                            onBlur={handleBlur}
                                            className="w-full border px-3 py-2 rounded"
                                        />
                                    </td>
                                </tr>

                                {/* Urinalysis */}
                                <tr>
                                    <td className="border border-black p-2 font-medium">Urinalysis:</td>
                                    <td className="border border-black p-2">
                                        <input
                                        readOnly
                                            type="text"
                                            name="urinalysis"
                                            value={person.urinalysis || ""}
                                            onChange={(e) => {
                                                const { name, value } = e.target;
                                                const updatedPerson = { ...person, [name]: value };
                                                setPerson(updatedPerson);
                                                handleUpdate(updatedPerson);
                                            }}
                                            onBlur={handleBlur}
                                            className="w-full border px-3 py-2 rounded"
                                        />
                                    </td>
                                </tr>

                                {/* Other Workups */}
                                <tr>
                                    <td className="border border-black p-2 font-medium">Other Workups:</td>
                                    <td className="border border-black p-2">
                                        <input
                                        readOnly
                                            type="text"
                                            name="otherworkups"
                                            value={person.otherworkups || ""}
                                            onChange={(e) => {
                                                const { name, value } = e.target;
                                                const updatedPerson = { ...person, [name]: value };
                                                setPerson(updatedPerson);
                                                handleUpdate(updatedPerson);
                                            }}
                                            onBlur={handleBlur}
                                            className="w-full border px-3 py-2 rounded"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>



                        <div style={{ marginTop: "16px" }}>
                            <Typography variant="subtitle1" mb={1}>
                                <div style={{ fontWeight: "bold" }}>VI. Diagnosis :</div>
                            </Typography>

                            <table
                                style={{
                                    width: "100%",
                                    border: "1px solid black",
                                    borderCollapse: "collapse",
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                    tableLayout: "fixed",
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                                height: "auto",
                                                fontSize: "100%",
                                                border: "1px solid black",
                                                padding: "8px",
                                            }}
                                        >
                                            {/* Question */}
                                            <Typography sx={{ fontSize: "15px", fontFamily: "Arial", marginBottom: "4px" }}>
                                                Do you have any of the following symptoms today?
                                            </Typography>

                                            {/* Answer checkboxes below (YES/NO) */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px" }}>
                                                {/* Physically Fit (0) */}
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <Checkbox
                                                    disabled
                                                        name="symptomsToday"
                                                        checked={person.symptomsToday === 0}
                                                        onChange={() => {
                                                            const updatedPerson = {
                                                                ...person,
                                                                symptomsToday: person.symptomsToday === 0 ? null : 0,
                                                            };
                                                            setPerson(updatedPerson);
                                                            handleUpdate(updatedPerson);
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <span style={{ fontSize: "15px", fontFamily: "Arial" }}>Physically Fit</span>
                                                </div>

                                                {/* For Compliance (1) */}
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <Checkbox
                                                    disabled
                                                        name="symptomsToday"
                                                        checked={person.symptomsToday === 1}
                                                        onChange={() => {
                                                            const updatedPerson = {
                                                                ...person,
                                                                symptomsToday: person.symptomsToday === 1 ? null : 1,
                                                            };
                                                            setPerson(updatedPerson);
                                                            handleUpdate(updatedPerson);
                                                        }}
                                                        onBlur={handleBlur}
                                                    />
                                                    <span style={{ fontSize: "15px", fontFamily: "Arial" }}>For Compliance</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>


                        {/* VII. Remarks Section */}
                        <div style={{ marginTop: "16px" }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                                VII. Remarks:
                            </Typography>
                            <Table
                                sx={{
                                    width: "100%",
                                    border: "1px solid black",
                                    borderCollapse: "collapse",
                                    tableLayout: "fixed",
                                }}
                            >
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ border: "1px solid black", p: 1 }}>
                                            <TextField
                                           disabled
                                                name="remarks"
                                                multiline
                                                minRows={2}
                                                fullWidth
                                                size="small"
                                                value={person.remarks || ""}
                                                onChange={(e) => {
                                                    const updatedPerson = {
                                                        ...person,
                                                        remarks: e.target.value,
                                                    };
                                                    setPerson(updatedPerson);
                                                    handleUpdate(updatedPerson);
                                                }}
                                                onBlur={handleBlur}
                                                sx={{
                                                    backgroundColor: "white",
                                                    borderRadius: "8px",
                                                    '& .MuiOutlinedInput-root': {
                                                        padding: '4px 8px',
                                                    },
                                                    '& .MuiInputBase-multiline': {
                                                        padding: 0,
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <Modal
                            open={examPermitModalOpen}
                            onClose={handleCloseExamPermitModal}
                            aria-labelledby="exam-permit-error-title"
                            aria-describedby="exam-permit-error-description"
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 400,
                                    bgcolor: "background.paper",
                                    border: "2px solid #6D2323",
                                    boxShadow: 24,
                                    p: 4,
                                    borderRadius: 2,
                                    textAlign: "center",
                                }}
                            >
                                <ErrorIcon sx={{ color: "#6D2323", fontSize: 50, mb: 2 }} />
                                <Typography id="exam-permit-error-title" variant="h6" component="h2" color="maroon">
                                    Exam Permit Notice
                                </Typography>
                                <Typography id="exam-permit-error-description" sx={{ mt: 2 }}>
                                    {examPermitError}
                                </Typography>
                                <Button
                                    onClick={handleCloseExamPermitModal}
                                    variant="contained"
                                    sx={{ mt: 3, backgroundColor: "#6D2323", "&:hover": { backgroundColor: "#8B0000" } }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Modal>







                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
                            {/* Previous Page Button */}
                            <Button
                                variant="contained"
                                component={Link}
                                to="/medical_dashboard3"
                                startIcon={
                                    <ArrowBackIcon
                                        sx={{
                                            color: '#000',
                                            transition: 'color 0.3s',
                                        }}
                                    />
                                }
                                sx={{
                                    backgroundColor: '#E8C999',
                                    color: '#000',
                                    '&:hover': {
                                        backgroundColor: '#6D2323',
                                        color: '#fff',
                                        '& .MuiSvgIcon-root': {
                                            color: '#fff',
                                        },
                                    },
                                }}
                            >
                                Previous Step
                            </Button>

                            {/* Next Step Button */}
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    handleUpdate();
                                    navigate("/medical_dashboard4");

                                }}
                                endIcon={
                                    <ArrowForwardIcon
                                        sx={{
                                            color: '#fff',
                                            transition: 'color 0.3s',
                                        }}
                                    />
                                }
                                sx={{
                                    backgroundColor: '#6D2323',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: '#E8C999',
                                        color: '#000',
                                        '& .MuiSvgIcon-root': {
                                            color: '#000',
                                        },
                                    },
                                }}
                            >
                                Next Step
                            </Button>
                        </Box>



                    </Container>
                </form>
            </Container>
        </Box>
    );
};


export default ReadmissionDashboard4;

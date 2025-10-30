import React, { useState, useEffect, } from "react";
import axios from "axios";
import { Button, Box, TextField, Container, Card, TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, FormControl, FormHelperText, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from '@mui/icons-material/FactCheck';

const StudentDashboard3 = () => {
    const navigate = useNavigate();






    const [explicitSelection, setExplicitSelection] = useState(false);

    const [selectedPerson, setSelectedPerson] = useState(null);
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [person, setPerson] = useState({
        schoolLevel: "",
        schoolLastAttended: "",
        schoolAddress: "",
        courseProgram: "",
        honor: "",
        generalAverage: "",
        yearGraduated: "",
        schoolLevel1: "",
        schoolLastAttended1: "",
        schoolAddress1: "",
        courseProgram1: "",
        honor1: "",
        generalAverage1: "",
        yearGraduated1: "",
        strand: "",
    });
    const location = useLocation();
    const [studentNumber, setStudentNumber] = useState("");
    const queryParams = new URLSearchParams(location.search);
    const queryPersonId = queryParams.get("person_id");

    // Always pull student_number from sessionStorage
    const queryStudentNumber = sessionStorage.getItem("student_number");

    useEffect(() => {
        if (!queryStudentNumber) return;
        const fetchPersonId = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/person_id/${queryStudentNumber}`);
                setUserID(res.data.person_id);
                setStudentNumber(queryStudentNumber);
                setPerson(res.data);
                setSelectedPerson(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch person_id:", err);
            }
        };
        fetchPersonId();
    }, [queryStudentNumber]);


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
const allowedRoles = ["student", "registrar"];
        if (allowedRoles.includes(storedRole)) {
            // ✅ Prefer URL param if admin is editing, otherwise logged-in student
            const targetId = queryPersonId || searchedPersonId || loggedInPersonId;

            // Make sure student_number is in sessionStorage for later steps
            if (studentNumber) {
                sessionStorage.setItem("student_number", studentNumber);
            }

            setUserID(targetId);
            return;
        }

        window.location.href = "/login";
    }, [queryPersonId, studentNumber]);

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
            if (consumedFlag) {
                sessionStorage.removeItem("admin_edit_person_id_source");
                sessionStorage.removeItem("admin_edit_person_id_ts");
            }
        });
    }, [queryPersonId]);

    // Fetch person by ID (when navigating with ?person_id=... or sessionStorage)
    useEffect(() => {
        const fetchPersonById = async () => {
            if (!userID) return;

            try {
                const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${userID}`);
                if (res.data) {
                    setPerson(res.data);
                    setSelectedPerson(res.data);
                } else {
                    console.warn("⚠️ No person found for ID:", userID);
                }
            } catch (err) {
                console.error("❌ Failed to fetch person by ID:", err);
            }
        };

        fetchPersonById();
    }, [userID]);




    const handleUpdate = async (updatedData) => {
        if (!person || !person.person_id) return;

        try {
            await axios.put(
                `http://localhost:5000/api/enrollment_person/${person.person_id}`, // ✅ enrollment DB
                updatedData
            );
            console.log("✅ Auto-saved successfully");
        } catch (error) {
            console.error("❌ Auto-save failed:", error);
        }
    };




    const steps = [
        { label: "Personal Information", icon: <PersonIcon />, path: `/student_dashboard1` },
        { label: "Family Background", icon: <FamilyRestroomIcon />, path: `/student_dashboard2` },
        { label: "Educational Attainment", icon: <SchoolIcon />, path: `/student_dashboard3` },
        { label: "Health Medical Records", icon: <HealthAndSafetyIcon />, path: `/student_dashboard4` },
        { label: "Other Information", icon: <InfoIcon />, path: `/student_dashboard5` },
    ];




    const [errors, setErrors] = useState({});

    const isFormValid = () => {
        const requiredFields = [
            // Original fields
            "schoolLevel", "schoolLastAttended", "schoolAddress", "courseProgram",
            "honor", "generalAverage", "yearGraduated", "strand",

            // Newly added fields
            "schoolLevel1", "schoolLastAttended1", "schoolAddress1", "courseProgram1",
            "honor1", "generalAverage1", "yearGraduated1"
        ];

        let newErrors = {};
        let isValid = true;

        requiredFields.forEach((field) => {
            const value = person[field];
            const stringValue = value?.toString().trim();

            if (!stringValue) {
                newErrors[field] = true;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const [activeStep, setActiveStep] = useState(2);
    const [clickedSteps, setClickedSteps] = useState(Array(steps.length).fill(false));
    const [currentStep, setCurrentStep] = useState(0);

    const handleStepClick = (index, to) => {
        setActiveStep(index);
        navigate(to);
    };


  const links = [
        { to: `/student_ecat_application_form`, label: "ECAT Application Form" },
        { to: `/student_form_process`, label: "Admission Form Process" },
        { to: `/student_personal_data_form`, label: "Personal Data Form" },
        { to: `/student_office_of_the_registrar`, label: "Application For EARIST College Admission" },
        { to: `/student_admission_services`, label: "Admission Services" },

    ];

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




    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>

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
                  EDUCATIONAL ATTAINMENT
                </Typography>




            </Box>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />

            <br />





            <Box sx={{ display: "flex", width: "100%" }}>
                {/* Left side: Notice */}
                <Box sx={{ width: "100%", padding: "10px" }}>
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
                            whiteSpace: "nowrap", // Keep all in one row
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

                        {/* Notice Text */}
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
                            <Link to={step.path} style={{ textDecoration: "none" }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                            onClick={() => handleStepClick(index, step.path)}

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
                            </Link>
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
                            <Typography style={{ fontSize: "20px", padding: "10px", fontFamily: "Arial Black" }}>Step 3: Educational Attainment</Typography>
                        </Box>
                    </Container>

                    <Container maxWidth="100%" sx={{ backgroundColor: "#f1f1f1", border: "2px solid black", padding: 4, borderRadius: 2, boxShadow: 3 }}>
                        <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Junior High School - Background:</Typography>
                        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                        <br />


                        <Box
                            sx={{
                                display: "flex",
                                gap: 2, // space between fields
                                mb: 2,
                            }}
                        >
                            {/* Each Box here is one input container */}
                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    School Level
                                </Typography>
                                <Box sx={{ flex: "1 1 25%" }}>
                                    <FormControl fullWidth size="small" required error={!!errors.schoolLevel}>
                                        <InputLabel id="schoolLevel-label">School Level</InputLabel>
                                        <Select
                                            labelId="schoolLevel-label"
                                            id="schoolLevel"
                                            readOnly
                                            name="schoolLevel"
                                            value={person.schoolLevel ?? ""}
                                            label="School Level"

                                        >
                                            <MenuItem value="">
                                                <em>Select School Level</em>
                                            </MenuItem>
                                            <MenuItem value="High School/Junior High School">High School/Junior High School</MenuItem>
                                            <MenuItem value="Senior High School">Senior High School</MenuItem>
                                            <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                                            <MenuItem value="Graduate">Graduate</MenuItem>
                                            <MenuItem value="ALS">ALS</MenuItem>
                                            <MenuItem value="Vocational/Trade Course">Vocational/Trade Course</MenuItem>
                                        </Select>
                                        {errors.schoolLevel && (
                                            <FormHelperText>This field is required.</FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>

                            </Box>


                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    School Last Attended
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}

                                    required
                                    name="schoolLastAttended"
                                    placeholder="Enter School Last Attended"
                                    value={person.schoolLastAttended}

                                    error={errors.schoolLastAttended}
                                    helperText={errors.schoolLastAttended ? "This field is required." : ""}
                                />
                            </Box>

                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    School Address
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}

                                    required
                                    name="schoolAddress"
                                    value={person.schoolAddress}

                                    placeholder="Enter your School Address"

                                    error={errors.schoolAddress}
                                    helperText={errors.schoolAddress ? "This field is required." : ""}
                                />
                            </Box>

                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    Course Program
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}

                                    name="courseProgram"
                                    required
                                    value={person.courseProgram}
                                    placeholder="Enter your Course Program"

                                    error={errors.courseProgram}
                                    helperText={errors.courseProgram ? "This field is required." : ""}
                                />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            <Box sx={{ flex: "1 1 33%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    Honor
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}

                                    name="honor"
                                    required
                                    value={person.honor}
                                    placeholder="Enter your Honor"

                                    error={errors.honor}
                                    helperText={errors.honor ? "This field is required." : ""}
                                />
                            </Box>

                            <Box sx={{ flex: "1 1 33%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    General Average
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    InputProps={{ readOnly: true }}

                                    required
                                    name="generalAverage"
                                    value={person.generalAverage}
                                    placeholder="Enter your General Average"

                                    error={errors.generalAverage}
                                    helperText={errors.generalAverage ? "This field is required." : ""}
                                />
                            </Box>

                            <Box sx={{ flex: "1 1 33%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    Year Graduated
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    InputProps={{ readOnly: true }}

                                    name="yearGraduated"
                                    placeholder="Enter your Year Graduated"
                                    value={person.yearGraduated}

                                    error={errors.yearGraduated}
                                    helperText={errors.yearGraduated ? "This field is required." : ""}
                                />
                            </Box>
                        </Box>





                        <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Senior High School - Background:</Typography>
                        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                        <br />

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            {/* School Level 1 */}
                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    School Level
                                </Typography>
                                <FormControl fullWidth size="small" required error={!!errors.schoolLevel1}>
                                    <InputLabel id="schoolLevel1-label">School Level</InputLabel>
                                    <Select
                                        labelId="schoolLevel1-label"
                                        id="schoolLevel1"
                                        readOnly
                                        name="schoolLevel1"
                                        value={person.schoolLevel1 ?? ""}
                                        label="School Level"

                                    >
                                        <MenuItem value=""><em>Select School Level</em></MenuItem>
                                        <MenuItem value="High School/Junior High School">High School/Junior High School</MenuItem>
                                        <MenuItem value="Senior High School">Senior High School</MenuItem>
                                        <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                                        <MenuItem value="Graduate">Graduate</MenuItem>
                                        <MenuItem value="ALS">ALS</MenuItem>
                                        <MenuItem value="Vocational/Trade Course">Vocational/Trade Course</MenuItem>
                                    </Select>
                                    {errors.schoolLevel1 && (
                                        <FormHelperText>This field is required.</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>

                            {/* School Last Attended 1 */}
                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    School Last Attended
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    InputProps={{ readOnly: true }}

                                    name="schoolLastAttended1"
                                    placeholder="Enter School Last Attended"
                                    value={person.schoolLastAttended1}

                                    error={errors.schoolLastAttended1}
                                    helperText={errors.schoolLastAttended1 ? "This field is required." : ""}
                                />
                            </Box>

                            {/* School Address 1 */}
                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    School Address
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    name="schoolAddress1"
                                    InputProps={{ readOnly: true }}

                                    placeholder="Enter your School Address"
                                    value={person.schoolAddress1}

                                    error={errors.schoolAddress1}
                                    helperText={errors.schoolAddress1 ? "This field is required." : ""}
                                />
                            </Box>

                            {/* Course Program 1 */}
                            <Box sx={{ flex: "1 1 25%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    Course Program
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    InputProps={{ readOnly: true }}

                                    name="courseProgram1"
                                    placeholder="Enter your Course Program"
                                    value={person.courseProgram1}

                                    error={errors.courseProgram1}
                                    helperText={errors.courseProgram1 ? "This field is required." : ""}
                                />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            {/* Honor 1 */}
                            <Box sx={{ flex: "1 1 33%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    Honor
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    name="honor1"
                                    InputProps={{ readOnly: true }}

                                    placeholder="Enter your Honor"
                                    value={person.honor1}

                                    error={errors.honor1}
                                    helperText={errors.honor1 ? "This field is required." : ""}
                                />
                            </Box>

                            {/* General Average 1 */}
                            <Box sx={{ flex: "1 1 33%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    General Average
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    InputProps={{ readOnly: true }}

                                    name="generalAverage1"
                                    placeholder="Enter your General Average"
                                    value={person.generalAverage1}

                                    error={errors.generalAverage1}
                                    helperText={errors.generalAverage1 ? "This field is required." : ""}
                                />
                            </Box>

                            {/* Year Graduated 1 */}
                            <Box sx={{ flex: "1 1 33%" }}>
                                <Typography variant="subtitle1" mb={1}>
                                    Year Graduated
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    required
                                    InputProps={{ readOnly: true }}

                                    name="yearGraduated1"
                                    placeholder="Enter your Year Graduated"
                                    value={person.yearGraduated1}

                                    error={errors.yearGraduated1}
                                    helperText={errors.yearGraduated1 ? "This field is required." : ""}
                                />
                            </Box>
                        </Box>

                        <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>
                            Strand (For Senior High School)
                        </Typography>
                        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                        <br />


                        <FormControl fullWidth size="small" required error={!!errors.strand} className="mb-4">
                            <InputLabel id="strand-label">Strand</InputLabel>
                            <Select
                                labelId="strand-label"
                                id="strand-select"
                                name="strand"
                                readOnly
                                value={person.strand ?? ""}
                                label="Strand"

                            >
                                <MenuItem value="">
                                    <em>Select Strand</em>
                                </MenuItem>
                                <MenuItem value="Accountancy, Business and Management (ABM)">
                                    Accountancy, Business and Management (ABM)
                                </MenuItem>
                                <MenuItem value="Humanities and Social Sciences (HUMSS)">
                                    Humanities and Social Sciences (HUMSS)
                                </MenuItem>
                                <MenuItem value="Science, Technology, Engineering, and Mathematics (STEM)">
                                    Science, Technology, Engineering, and Mathematics (STEM)
                                </MenuItem>
                                <MenuItem value="General Academic (GAS)">General Academic (GAS)</MenuItem>
                                <MenuItem value="Home Economics (HE)">Home Economics (HE)</MenuItem>
                                <MenuItem value="Information and Communications Technology (ICT)">
                                    Information and Communications Technology (ICT)
                                </MenuItem>
                                <MenuItem value="Agri-Fishery Arts (AFA)">Agri-Fishery Arts (AFA)</MenuItem>
                                <MenuItem value="Industrial Arts (IA)">Industrial Arts (IA)</MenuItem>
                                <MenuItem value="Sports Track">Sports Track</MenuItem>
                                <MenuItem value="Design and Arts Track">Design and Arts Track</MenuItem>
                            </Select>
                            {errors.strand && (
                                <FormHelperText>This field is required.</FormHelperText>
                            )}
                        </FormControl>



                        <Box display="flex" justifyContent="space-between" mt={4}>
                            {/* Previous Page Button */}
                            <Button
                                variant="contained"
                                component={Link}
                                to="/student_dashboard2"
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
                                    if (isFormValid()) {
                                        navigate("/student_dashboard4");
                                    } else {
                                        alert("Please complete all required fields before proceeding.");
                                    }
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


export default StudentDashboard3;

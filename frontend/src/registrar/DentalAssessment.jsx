import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormGroup,
    Card,
    FormControlLabel,
    Checkbox,
    TableContainer,
    TableHead,
    TableCell,
    TableRow,
    Container,
    Paper,
    Table,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import SaveIcon from '@mui/icons-material/Save';
import SchoolIcon from '@mui/icons-material/School';
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { motion } from "framer-motion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Unauthorized from "../components/Unauthorized";

const DentalAssessment = () => {
    const [studentNumber, setStudentNumber] = useState("");
    const [person, setPerson] = useState(null);

    const [persons, setPersons] = useState([]);

    const [form, setForm] = useState({
        student_number: "",
        dental_good_hygiene: 0,
        dental_presence_of_calculus_plaque: 0,
        dental_gingivitis: 0,
        dental_denture_wearer_up: 0,
        dental_denture_wearer_down: 0,
        dental_with_braces_up: 0,
        dental_with_braces_down: 0,
        dental_with_oral_hygiene_reliner: 0,
        // Medical history checkboxes
        dental_diabetes: 0,
        dental_hypertension: 0,
        dental_allergies: 0,
        dental_heart_disease: 0,
        dental_epilepsy: 0,
        dental_mental_illness: 0,
        dental_clotting_disorder: 0,
        // Tooth charts
        dental_upper_right: Array(8).fill(""),
        dental_upper_left: Array(8).fill(""),
        dental_lower_right: Array(8).fill(""),
        dental_lower_left: Array(8).fill(""),
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState("");

const [hasAccess, setHasAccess] = useState(null);
const pageId = 24;

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
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.trim() === "") return;

            try {
                const res = await axios.get("http://localhost:5000/api/search-person-student", {
                    params: { query: searchQuery }
                });

                console.log("Search result data:", res.data);
                setPerson(res.data);

                const idToStore = res.data.person_id || res.data.id;
                if (!idToStore) {
                    setSearchError("Invalid search result");
                    return;
                }

                sessionStorage.setItem("admin_edit_person_id", idToStore);
                sessionStorage.setItem("admin_edit_person_data", JSON.stringify(res.data)); // ✅ added
                setUserID(idToStore);
                setSearchError("");
            } catch (err) {
                console.error("Search failed:", err);
                setSearchError("Applicant not found");
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);


    useEffect(() => {
        if (!searchQuery.trim()) {
            // 🔹 If search is empty, clear everything
            setSelectedPerson(null);
            setPerson({
                profile_img: "",
                generalAverage1: "",
                height: "",
                applyingAs: "",
                document_status: "",
                last_name: "",
                first_name: "",
                middle_name: "",
                extension: "",
            });
            return;
        }

        // 🔹 Try to find a matching applicant from the list
        const match = persons.find((p) =>
            `${p.first_name} ${p.middle_name} ${p.last_name} ${p.emailAddress} ${p.applicant_number || ''}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );

        if (match) {
            // ✅ If found, set this as the "selectedPerson"
            setSelectedPerson(match);
        } else {
            // ❌ If not found, clear again
            setSelectedPerson(null);
            setPerson({
                profile_img: "",
                generalAverage1: "",
                height: "",
                applyingAs: "",
                document_status: "",
                last_name: "",
                first_name: "",
                middle_name: "",
                extension: "",
            });
        }
    }, [searchQuery, persons]);


    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(4);

    const tabs1 = [
        { label: "Medical Applicant List", to: "/medical_applicant_list", icon: <ListAltIcon /> },
        { label: "Applicant Form", to: "/medical_dashboard1", icon: <HowToRegIcon /> },
        { label: "Submitted Documents", to: "/medical_requirements", icon: <UploadFileIcon /> }, // updated icon
        { label: "Medical History", to: "/medical_requirements_form", icon: <PersonIcon /> },
        { label: "Dental Assessment", to: "/dental_assessment", icon: <DescriptionIcon /> },
        { label: "Physical and Neurological Examination", to: "/physical_neuro_exam", icon: <SchoolIcon /> },
    ];


    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    };

    const [selectedPerson, setSelectedPerson] = useState(null);
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const queryParams = new URLSearchParams(location.search);
    const queryPersonId = queryParams.get("person_id")?.trim() || "";
    const [explicitSelection, setExplicitSelection] = useState(false);

    // Fetch person by student number or name
    const fetchByStudentNumber = async (number) => {
        if (!number.trim()) return;

        try {
            console.log("🔍 Searching for:", number);
            const res = await axios.get("http://localhost:5000/api/search-person-student", {
                params: { query: number },
            });

            console.log("✅ API response:", res.data);

            if (res.data && res.data.student_number) {
                setPerson(res.data); // ✅ directly set the object
                fetchMedicalData(res.data.student_number);
            } else {
                alert("⚠️ No matching student found.");
                setPerson(null);
            }
        } catch (err) {
            console.error("❌ Error fetching student:", err.response?.data || err.message);
            alert("Student not found or error fetching data.");
            setPerson(null);
        }
    };

    // Handle Enter key
    const handleSearch = async (e) => {
        if (e.key === "Enter") {
            await fetchByStudentNumber(studentNumber);
        }
    };

    // Handle button click
    const handleSearchClick = async () => {
        await fetchByStudentNumber(studentNumber);
    };

    const fetchMedicalData = async (number) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/medical-requirements/${number}`);
            if (res.data) {
                setForm(res.data);
                console.log("✅ Medical data loaded:", res.data);
            }
        } catch (err) {
            console.warn("ℹ️ No medical record yet for this student.");
            setForm({});
        }
    };




    const fetchByPersonId = async (personID) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${personID}`);
            setPerson(res.data);
            setSelectedPerson(res.data);
            if (res.data?.student_number) {
            }
        } catch (err) {
            console.error("❌ person_with_applicant failed:", err);
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
            const isFresh = source === "medical_applicant_list" && Date.now() - ts < 5 * 60 * 1000;

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


    const handleToothChange = (quadrant, index, value) => {
        setForm((prev) => {
            const updated = Array.isArray(prev[quadrant]) ? [...prev[quadrant]] : Array(8).fill("");
            updated[index] = value;
            return { ...prev, [quadrant]: updated };
        });
    };

    const handleSave = async () => {
        if (!studentNumber) return alert("Enter a student number first.");
        try {
            await axios.put("http://localhost:5000/api/dental-assessment", {
                ...form,
                student_number: studentNumber,
            });
            alert("Record saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Save failed.");
        }
    };

    const toothOptions = [
        "Normal",
        "With Caries",
        "Amalgam",
        "Other Resto Mat",
        "Pontic",
        "Missing",
        "RF",
        "Unerrupted",
        "For EO",
        "FT",
        "Abutment",
        "RCT",
        "Impacted",
    ];

    const handleStepClick = (index, path) => {
        setActiveStep(index);
        navigate(path);
    };

    const renderToothRow = (title, quadrant) => {
        // 🧩 Always ensure we have an array
        let teethArray = form[quadrant];
        if (typeof teethArray === "string") {
            try {
                teethArray = JSON.parse(teethArray);
            } catch {
                teethArray = Array(8).fill("");
            }
        } else if (!Array.isArray(teethArray)) {
            teethArray = Array(8).fill("");
        }

        return (
            <Box
                sx={{
                    backgroundColor: "#fff",
                    border: "2px solid #6D2323",
                    borderRadius: 3,
                    boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                    p: 2,
                    textAlign: "center",
                    mb: 2,
                }}
            >
                {/* Title */}
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: "bold",
                        mb: 1,
                        color: "#6D2323",
                        borderBottom: "2px solid #6D2323",
                        display: "inline-block",
                        px: 1.5,
                        borderRadius: "5px",
                        backgroundColor: "#E8C999",
                    }}
                >
                    {title}
                </Typography>

                {/* Tooth Fields */}
                <Grid
                    container
                    spacing={1}
                    justifyContent="center"
                    sx={{ mt: 1 }}
                >
                    {teethArray.map((val, i) => (
                        <Grid
                            item
                            key={i}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                mx: 0.5,
                            }}
                        >
                            <TextField
                                select
                                SelectProps={{ native: true }}
                                size="small"
                                value={val}
                                onChange={(e) => handleToothChange(quadrant, i, e.target.value)}
                                sx={{
                                    width: 90,
                                    borderRadius: 1,
                                    backgroundColor: "#fafafa",
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                    },
                                }}
                            >
                                <option value="">-</option>
                                {toothOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </TextField>

                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 0.5,
                                    color: "#6D2323",
                                    fontWeight: "bold",
                                    backgroundColor: "#F4E4C1",
                                    borderRadius: "4px",
                                    px: 0.8,
                                }}
                            >
                                {i + 1}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    if (hasAccess === null) {
   return "Loading...."
}

  if (!hasAccess) {
    return (
      <Unauthorized />
    );
  }


    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", p: 2 }}>
            {/* 🟥 HEADER SECTION */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                    p: 1,
                }}
            >
                {/* 🦷 Left side: Title */}
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                        color: "#6D2323",
                        fontFamily: "Arial Black",
                        letterSpacing: 1,
                        marginTop: "-10px",
                    }}
                >
                    DENTAL ASSESSMENT
                </Typography>

                {/* 🔍 Right side: Search input + button */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        marginTop: "-5px",
                    }}
                >
                    <TextField
                        variant="outlined"
                        placeholder="Search Student Number..."
                        size="small"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        onKeyDown={handleSearch}
                        sx={{
                            width: 350,
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

                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{
                            bgcolor: "#6D2323",
                            px: 3,
                            py: 0.8,
                            borderRadius: "10px",
                            fontWeight: "bold",
                            textTransform: "none",
                            fontFamily: "Arial",
                            "&:hover": {
                                bgcolor: "#8B2C2C",
                            },
                        }}
                        onClick={handleSearchClick}
                    >
                        Search
                    </Button>
                </Box>
            </Box>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <div style={{ height: "20px" }}></div>

            {/* 🔹 Top Navigation Tabs */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    mb: 3,
                }}
            >
                {tabs1.map((tab, index) => (
                    <Card
                        key={index}
                        onClick={() => handleStepClick(index, tab.to)}
                        sx={{
                            flex: 1,
                            height: 100,
                            mx: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            cursor: "pointer",
                            border: "2px solid #6D2323",
                            backgroundColor: activeStep === index ? "#6D2323" : "#E8C999",
                            color: activeStep === index ? "#fff" : "#000",
                            transition: "0.3s ease",
                            "&:hover": {
                                backgroundColor: activeStep === index ? "#5a1c1c" : "#f5d98f",
                            },
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Box sx={{ fontSize: 32, mb: 0.5 }}>{tab.icon}</Box>
                            <Typography sx={{ fontSize: 13, fontWeight: "bold", textAlign: "center" }}>
                                {tab.label}
                            </Typography>
                        </Box>
                    </Card>
                ))}
            </Box>
            <TableContainer component={Paper} sx={{ width: '100%', }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#6D2323' }}>
                        <TableRow>
                            <TableCell sx={{ color: "white", fontSize: "20px", fontFamily: "Arial Black", border: "none" }}>
                                Student Number:&nbsp;
                                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                    {person?.student_number || "N/A"}
                                </span>
                            </TableCell>

                            <TableCell
                                align="right"
                                sx={{ color: "white", fontSize: "20px", fontFamily: "Arial Black", border: "none" }}
                            >
                                Student Name:&nbsp;
                                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                    {person
                                        ? `${person.last_name?.toUpperCase() || ""}, ${person.first_name?.toUpperCase() || ""} ${person.middle_name?.toUpperCase() || ""} ${person.extension?.toUpperCase() || ""}`
                                        : "N/A"}
                                </span>
                            </TableCell>

                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
            <Container
                maxWidth="100%"
                sx={{
                    backgroundColor: "#f1f1f1",
                    border: "2px solid black",
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,

                        pb: 2,
                        justifyContent: "flex-end", // ✅ aligns to right
                        pr: 1, // optional padding from right edge
                    }}
                >
                    {/* Student Health Record */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card
                            sx={{
                                height: 60,
                                width: 260, // ✅ same fixed width
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
                                    backgroundColor: "#6D2323",
                                    "& .card-text": { color: "#fff" },
                                    "& .card-icon": { color: "#fff" },
                                },
                            }}
                            onClick={() => navigate("/health_record")}
                        >
                            <PictureAsPdfIcon
                                className="card-icon"
                                sx={{ fontSize: 35, color: "#6D2323", mr: 1.5 }}
                            />
                            <Typography
                                className="card-text"
                                sx={{
                                    color: "#6D2323",
                                    fontFamily: "Arial",
                                    fontWeight: "bold",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Student Health Record
                            </Typography>
                        </Card>
                    </motion.div>

                    {/* Medical Certificate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                    >
                        <Card
                            sx={{
                                height: 60,
                                width: 260, // ✅ same fixed width as above
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
                                    backgroundColor: "#6D2323",
                                    "& .card-text": { color: "#fff" },
                                    "& .card-icon": { color: "#fff" },
                                },
                            }}
                            onClick={() => navigate("/medical_certificate")}
                        >
                            <PictureAsPdfIcon
                                className="card-icon"
                                sx={{ fontSize: 35, color: "#6D2323", mr: 1.5 }}
                            />
                            <Typography
                                className="card-text"
                                sx={{
                                    color: "#6D2323",
                                    fontFamily: "Arial",
                                    fontWeight: "bold",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Medical Certificate
                            </Typography>
                        </Card>
                    </motion.div>
                </Box>

                <Grid container spacing={3}>
                    {/* LEFT SIDE - General Condition */}
                    <Grid item xs={12} md={3}>
                        <Typography fontWeight="bold" mb={1}>
                            General Condition
                        </Typography>
                        <FormGroup>
                            {[
                                "dental_good_hygiene",
                                "dental_presence_of_calculus_plaque",
                                "dental_gingivitis",
                                "dental_denture_wearer_up",
                                "dental_denture_wearer_down",
                                "dental_with_braces_up",
                                "dental_with_braces_down",
                                "dental_with_oral_hygiene_reliner",
                            ].map((key) => (
                                <FormControlLabel
                                    key={key}
                                    control={<Checkbox checked={!!form[key]} onChange={handleCheckbox} name={key} />}
                                    label={key.replaceAll("dental_", "").replaceAll("_", " ")}
                                />
                            ))}
                        </FormGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            {/* UPPER */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    justifyContent: "center",
                                    width: "100%",
                                }}
                            >
                                <Box sx={{ flex: 1 }}>{renderToothRow("UPPER RIGHT", "dental_upper_right")}</Box>
                                <Box sx={{ flex: 1 }}>{renderToothRow("UPPER LEFT", "dental_upper_left")}</Box>
                            </Box>

                            {/* Divider line for upper vs lower */}
                            <Box
                                sx={{
                                    width: "80%",
                                    height: "2px",
                                    backgroundColor: "#6D2323",
                                    borderRadius: 1,
                                    my: 1,
                                }}
                            />

                            {/* LOWER */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    justifyContent: "center",
                                    width: "100%",
                                }}
                            >
                                <Box sx={{ flex: 1 }}>{renderToothRow("LOWER RIGHT", "dental_lower_right")}</Box>
                                <Box sx={{ flex: 1 }}>{renderToothRow("LOWER LEFT", "dental_lower_left")}</Box>
                            </Box>
                        </Box>
                    </Grid>


                    {/* RIGHT SIDE - Medical History */}
                    <Grid item xs={12} md={3}>
                        <Typography fontWeight="bold" mb={1}>
                            Medical History
                        </Typography>
                        <FormGroup>
                            {[
                                "dental_diabetes",
                                "dental_hypertension",
                                "dental_allergies",
                                "dental_heart_disease",
                                "dental_epilepsy",
                                "dental_mental_illness",
                                "dental_clotting_disorder",
                            ].map((key) => (
                                <FormControlLabel
                                    key={key}
                                    control={<Checkbox checked={!!form[key]} onChange={handleCheckbox} name={key} />}
                                    label={key.replaceAll("dental_", "").replaceAll("_", " ")}
                                />
                            ))}
                        </FormGroup>
                    </Grid>
                </Grid>

                {/* 💾 Save Button */}

                <Box sx={{ textAlign: "left", pb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#800000', // maroon color
                            '&:hover': {
                                backgroundColor: '#660000', // darker maroon on hover
                            },
                        }}
                    >
                        Save Record
                    </Button>

                </Box>
            </Container>
        </Box>
    );
};

export default DentalAssessment;

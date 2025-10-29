import { Box, Typography, TextField, Snackbar, Alert, Button } from "@mui/material";
import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import EaristLogo from "../assets/EaristLogo.png";
import { Search } from "@mui/icons-material";

const ProgramEvaluation = () => {

    const settings = useContext(SettingsContext);
    const [fetchedLogo, setFetchedLogo] = useState(EaristLogo); // ✅ fallback
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

    const [campusAddress, setCampusAddress] = useState("");

    useEffect(() => {
        if (settings && settings.address) {
            setCampusAddress(settings.address);
        }
    }, [settings]);

    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [studentData, setStudentData] = useState([]);
    const [studentNumber, setStudentNumber] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [studentDetails, setStudentDetails] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);

            if (storedRole !== "faculty") {
                window.location.href = "/login";
            } else {
                console.log("Hello")
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 9) {
            setSelectedStudent(null);
            setStudentData([]);
            return;
        }

        const fetchStudent = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/program_evaluation/${searchQuery}`);
                const data = await res.json();

                if (data) {
                    setSelectedStudent(data);
                    setStudentData(data);

                    const detailsRes = await fetch(`http://localhost:5000/api/program_evaluation/details/${searchQuery}`);
                    const detailsData = await detailsRes.json();
                    if (Array.isArray(detailsData) && detailsData.length > 0) {
                        setStudentDetails(detailsData);
                    } else {
                        setStudentDetails([]);
                        setSnackbarMessage("No enrolled subjects found for this student.");
                        setOpenSnackbar(true);
                    }
                } else {
                    setSelectedStudent(null);
                    setStudentData([]);
                    setStudentDetails([]);
                    setSnackbarMessage("No student data found.");
                    setOpenSnackbar(true);
                }
            } catch (err) {
                console.error("Error fetching student", err);
                setSnackbarMessage("Server error. Please try again.");
                setOpenSnackbar(true);
            }
        };

        fetchStudent();
    }, [searchQuery]);

    const getLevelBySection = (section) => {
        if (!section) return null;
        const yearNumber = parseInt(section[0]);
        switch (yearNumber) {
            case 1: return "First Year";
            case 2: return "Second Year";
            case 3: return "Third Year";
            case 4: return "Fourth Year";
            case 5: return "Fifth Year";
            default: return "unknown";
        }
    }

    const totalLec = (course_unit) => {
        const lec = Number(course_unit) || 0;
        return lec;
    };

    const totalLab = (lab_unit) => {
        const lab = Number(lab_unit) || 0;
        return lab;
    };

    const groupedDetails = {};
    if (Array.isArray(studentDetails)) {
        studentDetails.forEach(item => {
            const key = `${item.school_year}-${item.semester_description}`;
            if (!groupedDetails[key]) {
                groupedDetails[key] = [];
            }
            groupedDetails[key].push(item);
        });
    }

    const divToPrintRef = useRef();

    const printDiv = () => {
        window.print();
    };

    return (
        <Box className="body" sx={{ height: 'calc(100vh - 150px)', overflowY: 'auto', overflowX: 'hidden', pr: 1, p: 2 }}>
            <Box sx={{ background: "white", p: 2 }}>
  {/* Header Row */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    }}
  >
    {/* Title on the left */}
    <Typography
      variant="h4"
      sx={{
        fontWeight: "bold",
        color: "maroon",
        fontSize: "36px",
      }}
    >
      Program Evaluation
    </Typography>

    {/* Right side: Search + Print */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2, // spacing between the search bar and button
      }}
    >
      {/* Search Field */}
      <TextField
        variant="outlined"
        placeholder="Enter Student Number"
        size="small"
        value={studentNumber}
        onChange={(e) => {
          setStudentNumber(e.target.value);
          setSearchQuery(e.target.value);
        }}
        InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
        sx={{
          width: { xs: "220px", sm: "350px" },
          background: "white",
        }}
      />

      {/* Print Button */}
      <Button
        onClick={printDiv}
        variant="contained"
        sx={{
          backgroundColor: "maroon",
          color: "white",
          height: "40px",
          width: "120px",
          fontSize: "16px",
          textTransform: "none",
          "&:hover": { backgroundColor: "#800000" },
        }}
      >
        Print
      </Button>
    </Box>
  </Box>

  {/* Divider Line */}
  <hr style={{ border: "1px solid #ccc", width: "100%", marginTop: "1rem" }} />
</Box>

            <style>
                {`
                @media print {
                    @page {
                        margin: 0; 
                        padding-right: 3rem
                    }
                
                    body * {
                        visibility: hidden;
                        
                    }

                    .body{
                        margin-top: -22rem;
                        margin-left: -27rem;
                        overflow: visible !important;  /* show all content */
                        height: auto !important;       /* expand height */
                        max-height: none !important;   /* no max height limit */
                        
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        scale: 0.8;
                        position: absolute;
                        left:0%;
                        top: -12rem;

                        width: 100%;
                        font-family: "Poppins", sans-serif;
                        margin-top: -4.5rem;
                        padding: 0;
                    }
                    button {
                        display: none !important; /* hide buttons */
                    }
                }
                `}
            </style>
            <Box className="print-container" style={{ paddingRight: "1.5rem", marginTop: "3rem", paddingBottom: "1.5rem", maxWidth: "600px" }} ref={divToPrintRef}>
                <Box style={{ display: "flex", alignItems: "center", width: "70rem", justifyContent: "center" }}>
                    {/* LEFT - Logo */}
                    <Box
                        style={{
                            paddingTop: "1.5rem",
                            paddingRight: "3rem",
                        }}
                    >
                        <img
                            src={fetchedLogo || EaristLogo} // ✅ Use dynamic logo with fallback
                            alt="School Logo"
                            style={{
                                width: "8rem",
                                height: "8rem",
                                display: "block",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                    </Box>

                    {/* CENTER - School Info */}
                    <Box style={{ marginTop: "1.5rem" }}>
                        <td
                            colSpan={15}
                            style={{
                                textAlign: "center",
                                fontFamily: "Arial",
                                fontSize: "10px",
                                lineHeight: "1.5",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "12px",
                                    letterSpacing: "1px",
                                }}
                            >
                                Republic of the Philippines
                            </div>

                            {/* ✅ Dynamically split company name into two lines */}
                            {companyName ? (
                                (() => {
                                    const name = companyName.trim();
                                    const words = name.split(" ");
                                    const middleIndex = Math.ceil(words.length / 2);
                                    const firstLine = words.slice(0, middleIndex).join(" ");
                                    const secondLine = words.slice(middleIndex).join(" ");

                                    return (
                                        <>
                                            <Typography
                                                style={{
                                                    textAlign: "center",
                                                    marginTop: "0rem",
                                                    lineHeight: "1",
                                                    fontSize: "1.6rem",
                                                    letterSpacing: "-1px",
                                                    fontWeight: "600",
                                                    fontFamily: "Times New Roman",
                                                }}
                                            >
                                                {firstLine} <br />
                                                {secondLine}
                                            </Typography>

                                            {/* ✅ Dynamic Campus Address */}
                                            {campusAddress && (
                                                <Typography
                                                    style={{
                                                        mt: 1,
                                                        textAlign: "center",
                                                        fontSize: "12px",
                                                        letterSpacing: "1px",

                                                    }}
                                                >
                                                    {campusAddress}
                                                </Typography>
                                            )}
                                        </>
                                    );
                                })()
                            ) : (
                                <div style={{ height: "24px" }}></div>
                            )}
                        </td>
                    </Box>
                </Box>
                <Typography style={{ marginLeft: "1rem", textAlign: "center", width: "80rem", fontSize: "1.6rem", letterSpacing: "-1px", fontWeight: "500" }}>OFFICE OF THE REGISTRAR</Typography>
                <Typography style={{ marginLeft: "1rem", marginTop: "-0.2rem", width: "80rem", textAlign: "center", fontSize: "1.8rem", letterSpacing: "-1px", fontWeight: "600" }}>ACADEMIC PROGRAM EVALUATION</Typography>
                <Box style={{ display: "flex" }}>
                    <Box>
                        <Box sx={{ padding: "1rem", marginLeft: "1rem", borderBottom: "solid black 1px", width: "80rem" }}>
                            <Box style={{ display: "flex" }}>
                                <Box style={{ display: "flex", width: "38rem" }}>
                                    <Typography style={{ width: "9rem", fontSize: "1.05rem", letterSpacing: "-1px" }}>Student Name:</Typography>
                                    <Typography style={{ fontSize: "1.06rem", fontWeight: "500" }}>{studentData.last_name}, {studentData.first_name} {studentData.middle_name}</Typography>
                                </Box>
                                <Box style={{ display: "flex" }}>
                                    <Typography style={{ width: "6rem", fontSize: "1.05rem", letterSpacing: "-1px" }}>College:</Typography>
                                    <Typography style={{ fontSize: "1.06rem", fontWeight: "500" }}>{studentData.dprtmnt_name}</Typography>
                                </Box>
                            </Box>
                            <Box style={{ display: "flex" }}>
                                <Box style={{ display: "flex", width: "38rem" }}>
                                    <Typography style={{ width: "9rem", marginTop: "0.7rem", fontSize: "1.05rem", letterSpacing: "-1px" }}>Student No. :</Typography>
                                    <Typography style={{ fontSize: "1.06rem", fontWeight: "500", marginTop: "0.7rem" }}>{studentData.student_number}</Typography>
                                </Box>
                                <Box style={{ display: "flex" }}>
                                    <Typography style={{ width: "6rem", marginTop: "0.7rem", fontSize: "1.05rem", letterSpacing: "-1px" }}>Program:</Typography>
                                    <Typography style={{ fontSize: "1.06rem", fontWeight: "500", marginTop: "0.7rem" }}>{studentData.program_description}</Typography>
                                </Box>
                            </Box>
                            <Box style={{ display: "flex" }}>
                                <Typography style={{ width: "9rem", marginTop: "0.7rem", fontSize: "1.05rem", letterSpacing: "-1px" }}>Curriculum:</Typography>
                                <Typography style={{ fontSize: "1.06rem", fontWeight: "500", marginTop: "0.7rem" }}>{studentData.program_code} {studentData.year_description} RP (ORIGINAL)</Typography>
                            </Box>
                        </Box>
                        <Box style={{ display: "flex", flexWrap: "wrap" }}>
                            {Object.entries(groupedDetails).map(([key, courses]) => (
                                <Box style={{ paddingLeft: "1rem", flex: "0 0 50%", marginBottom: "1rem", boxSizing: "border-box" }} key={key}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <td style={{ textAlign: "center" }}>{getLevelBySection(courses[0].section)} - {courses[0].semester_description}</td>
                                            </tr>
                                            <tr style={{ display: "flex", borderBottom: "solid 1px rgba(0,0,0,0.1)" }}>
                                                <td style={{ fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", width: "6rem" }}>
                                                    <span>GRADE</span>
                                                </td>
                                                <td style={{ fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", width: "28rem" }}>
                                                    <span>COURSE CODE / TITLE</span>
                                                </td>
                                                <td>
                                                    <div style={{ margin: "-1px", fontWeight: "700", textAlign: "center", width: "5rem" }}>UNIT</div>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <div style={{ fontWeight: "700", fontSize: "0.9rem", textAlign: "center", width: "50%" }}>
                                                            <span>LEC</span>
                                                        </div>
                                                        <div style={{ textAlign: "center", fontWeight: "700", fontSize: "0.9rem", width: "50%" }}>
                                                            <span>LAB</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((p) => (
                                                <tr style={{ display: "flex", borderBottom: "solid 1px rgba(0,0,0,0.1)" }} key={p.enrolled_id}>
                                                    <td style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "6rem" }}>
                                                        <span>{p.final_grade}</span>
                                                    </td>
                                                    <td style={{ display: "flex", width: "28rem" }}>
                                                        <span style={{ width: "100px" }}>{p.course_code}</span>
                                                        <span style={{ margin: "0", padding: "0" }}>{p.course_description}</span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            <div style={{ fontSize: "0.9rem", width: "2.5rem", textAlign: "center" }}>
                                                                <span>{p.course_unit}</span>
                                                            </div>
                                                            <div style={{ fontSize: "0.9rem", width: "2.5rem", textAlign: "center" }}>
                                                                <span>{p.lab_unit}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr style={{ display: "flex", fontWeight: "700" }}>
                                                <td style={{ width: "6rem" }}></td>
                                                <td style={{ width: "28rem", textAlign: "right", paddingRight: "1rem" }}>
                                                </td>
                                                <td style={{ display: "flex", alignItems: "center" }}>
                                                    <div style={{ fontSize: "0.9rem", width: "2.5rem", textAlign: "center" }}>
                                                        <span>{courses.reduce((sum, p) => sum + totalLec(p.course_unit), 0)}</span>
                                                    </div>
                                                    <div style={{ fontSize: "0.9rem", width: "2.5rem", textAlign: "center" }}>
                                                        <span>{courses.reduce((sum, p) => sum + totalLab(p.lab_unit), 0)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Box>
                            ))}
                        </Box>
                        <Snackbar
                            open={openSnackbar}
                            autoHideDuration={4000}
                            onClose={() => setOpenSnackbar(false)}
                            anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        >
                            <Alert onClose={() => setOpenSnackbar(false)} severity="warning" sx={{ width: "100%" }}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ProgramEvaluation;
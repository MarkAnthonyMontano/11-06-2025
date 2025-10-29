import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { Box, Container, Button, TextField, Typography } from "@mui/material";
import { SettingsContext } from "../App";
import { FcPrint } from "react-icons/fc";
import { useLocation } from "react-router-dom";
import Search from '@mui/icons-material/Search';
import Unauthorized from "../components/Unauthorized";

const MedicalCertificate = () => {
    const settings = useContext(SettingsContext);
    const [fetchedLogo, setFetchedLogo] = useState(null);
    const [companyName, setCompanyName] = useState("");


const [hasAccess, setHasAccess] = useState(null);
const pageId = 35;

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



    const [studentNumber, setStudentNumber] = useState("");
    const [medicalData, setMedicalData] = useState(null);

    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [person, setPerson] = useState({
        profile_img: "",
        campus: "",
        academicProgram: "",
        classifiedAs: "",
        program: "",
        program2: "",
        program3: "",
        yearLevel: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        extension: "",
        nickname: "",
        height: "",
        weight: "",
        lrnNumber: "",
        gender: "",
        pwdType: "",
        pwdId: "",
        birthOfDate: "",
        age: "",
        birthPlace: "",
        languageDialectSpoken: "",
        citizenship: "",
        religion: "",
        civilStatus: "",
        tribeEthnicGroup: "",
        cellphoneNumber: "",
        emailAddress: "",
        telephoneNumber: "",
        facebookAccount: "",
        presentStreet: "",
        presentBarangay: "",
        presentZipCode: "",
        presentRegion: "",
        presentProvince: "",
        presentMunicipality: "",
        presentDswdHouseholdNumber: "",
        permanentStreet: "",
        permanentBarangay: "",
        permanentZipCode: "",
        permanentRegion: "",
        permanentProvince: "",
        permanentMunicipality: "",
        permanentDswdHouseholdNumber: "",
    });



    // ✅ Fetch person data from backend
    const fetchPersonData = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/person/${id}`);
            setPerson(res.data); // make sure backend returns the correct format
        } catch (error) {
            console.error("Failed to fetch person:", error);
        }
    };


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryPersonId = queryParams.get("person_id");

    // do not alter
    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");
        const storedStudentNumber = localStorage.getItem("student_number");

        if (storedUser && storedRole && (storedStudentNumber || storedID)) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedStudentNumber || storedID);

            if (storedRole === "applicant" || storedRole === "registrar") {
                if (storedStudentNumber) {
                    fetchPersonBySearch(storedStudentNumber);
                } else {
                    fetchPersonBySearch(storedID);
                }
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    const [shortDate, setShortDate] = useState("");
    const [longDate, setLongDate] = useState("");

    useEffect(() => {
        const updateDates = () => {
            const now = new Date();

            // Format 1: MM/DD/YYYY
            const formattedShort = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
            setShortDate(formattedShort);

            // Format 2: MM DD, YYYY hh:mm:ss AM/PM
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = now.getFullYear();
            const hours = String(now.getHours() % 12 || 12).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const ampm = now.getHours() >= 12 ? "PM" : "AM";

            const formattedLong = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
            setLongDate(formattedLong);
        };

        updateDates(); // Set initial values
        const interval = setInterval(updateDates, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const divToPrintRef = useRef();
    const printDiv = () => {
        const divToPrint = divToPrintRef.current;
        if (divToPrint) {
            // Clone to preserve React bindings
            const clonedDiv = divToPrint.cloneNode(true);

            // Manually add 'checked' attribute to checked checkboxes
            const checkboxes = clonedDiv.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                    checkbox.setAttribute("checked", "checked");
                } else {
                    checkbox.removeAttribute("checked");
                }
            });

            const newWin = window.open('', 'Print-Window');
            newWin.document.open();
            newWin.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              font-family: Arial, sans-serif;
              overflow: hidden;
            }

            .print-container {
              width: 110%;
              height: 100%;
              box-sizing: border-box;
              transform: scale(0.90);
              transform-origin: top left;
            }

            .student-table {
              margin-top: 20px !important;
            }

            input[type="checkbox"] {
              width: 12px;
              height: 12px;
              transform: scale(1);
              margin: 2px;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            button {
              display: none;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 100);">
          <div class="print-container">
            ${clonedDiv.innerHTML}
          </div>
        </body>
      </html>
    `);
            newWin.document.close();
        } else {
            console.error("divToPrintRef is not set.");
        }
    };


    const [curriculumOptions, setCurriculumOptions] = useState([]);

    useEffect(() => {
        const fetchCurriculums = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/applied_program");
                setCurriculumOptions(response.data);
            } catch (error) {
                console.error("Error fetching curriculum options:", error);
            }
        };

        fetchCurriculums();
    }, []);

    console.log("person.program:", person.program);
    console.log("curriculumOptions:", curriculumOptions);

    {
        curriculumOptions.find(
            (item) =>
                item?.curriculum_id?.toString() === (person?.program ?? "").toString()
        )?.program_description || (person?.program ?? "")

    }

    const [searchQuery, setSearchQuery] = useState("");
    const [personResults, setPersonResults] = useState([]);
    const [searchError, setSearchError] = useState("");

    const fetchPersonBySearch = async (query) => {
        try {
            const res = await axios.get("http://localhost:5000/api/search-person-student", {
                params: { query }
            });

            setPersonResults(res.data);
            if (res.data.length === 1) {
                setPerson(res.data[0]);
                fetchMedicalData(res.data[0].student_number);
            }
            console.log("✅ Person search results:", res.data);
        } catch (error) {
            console.error("❌ Failed to search person:", error);
            setPersonResults([]);
        }
    };

    const fetchMedicalData = async (studentNumber) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/medical-requirements/${studentNumber}`);
            setMedicalData(res.data);
            console.log("✅ Loaded medical data for:", studentNumber, res.data);
        } catch (err) {
            if (err.response?.status === 404) {
                console.warn(`ℹ️ No medical record found for ${studentNumber}`);
                setMedicalData(null);
            } else {
                console.error("❌ Failed to load medical data:", err);
            }
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
                sessionStorage.setItem("admin_edit_person_data", JSON.stringify(res.data));
                setUserID(idToStore);
                setSearchError("");
            } catch (err) {
                console.error("Search failed:", err);
                setSearchError("Applicant not found");
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    if (hasAccess === null) {
   return "Loading...."
}

  if (!hasAccess) {
    return (
      <Unauthorized />
    );
  } 

    return (
        <Box sx={{ height: 'calc(95vh - 80px)', overflowY: 'auto', paddingRight: 1, backgroundColor: 'transparent' }}>
            <Container>
                <Container
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "25px"
                    }}
                >
                    <h1
                        style={{
                            fontSize: "40px",
                            fontWeight: "bold",
                            textAlign: "left",
                            color: "maroon",
                        }}
                    >
                        MEDICAL CERTIFICATE
                    </h1>

                    {/* ✅ Search Bar */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search by Student Number or Name or Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") fetchPersonBySearch(searchQuery);
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#800000",
                                "&:hover": { backgroundColor: "#600000" },
                            }}
                            onClick={() => fetchPersonBySearch(searchQuery)}
                        >
                            Search
                        </Button>
                    </Box>
                </Container>


                <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                <button
                    onClick={printDiv}
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
                        Print Medical Certificate
                    </span>
                </button>

            </Container>
            <Container>
                <div ref={divToPrintRef}>
                    <div>
                        <style>
                            {`
          @media print {
            button {
              display: none;
            }
          }
        `}
                        </style>


                    </div>

                    <Container>

                        <div
                            className="student-table"
                            style={{

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center", // Center horizontally
                                padding: "10px 20px",
                                width: "100%",

                                boxSizing: "border-box"
                            }}>
                            {/* Wrapper to contain logo and text side by side without stretching */}
                            <div style={{
                                display: "flex",

                                alignItems: "center"
                            }}>
                                {/* Logo */}
                                <div style={{ flexShrink: 0, marginRight: "20px" }}>
                                    <img
                                        src={fetchedLogo}
                                        alt="School Logo"
                                        style={{
                                            width: "120px",   // ✅ hardcoded width
                                            height: "120px",  // ✅ hardcoded height
                                            borderRadius: "50%", // optional (use for circular look)
                                            objectFit: "cover",
                                            marginTop: "-30px",
                                        }}
                                    />
                                </div>

                                <div style={{ height: "20px" }}></div>
                                <div>
                                    {/* Top Line: Republic */}
                                    <div style={{
                                        fontSize: "14px",
                                        fontFamily: "Arial, sans-serif",
                                        textAlign: "left",
                                        marginBottom: "5px"
                                    }}>
                                        Republic of the Philippines
                                    </div>

                                    {/* Institute Name */}
                                    <div
                                        style={{
                                            fontSize: "25px",
                                            fontWeight: "bold",
                                            color: "black",
                                            fontFamily: "Times New Roman",
                                            marginBottom: "5px",
                                        }}
                                    >
                                        {companyName}
                                    </div>

                                    {/* Horizontal Line */}
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
                                        <hr style={{ width: "100%", maxWidth: "700px", border: "1px solid #000", margin: 0 }} />
                                    </div>
                                    <br />
                                    {/* Office Name */}
                                    <div style={{
                                        textAlign: "center",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        fontFamily: "Times, New Roman",
                                        marginLeft: "-10px",
                                        marginTop: "-20px"
                                    }}>
                                        HEALTH SERVICE DIVISION

                                    </div>

                                    <div style={{
                                        textAlign: "center",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        fontFamily: "Times, New Roman",
                                        marginLeft: "-10px",

                                        marginTop: "30px"
                                    }}>
                                        MEDICAL CERTIFICATE

                                    </div>
                                </div>
                            </div>
                        </div>

                        <table
                            style={{
                                borderCollapse: "collapse",
                                width: "8in",
                                margin: "0 auto",
                                fontFamily: "Times New Roman",
                                fontSize: "16px",
                                lineHeight: "1.3",
                            }}
                        >
                            <tbody>
                                {/* Title */}

                                {/* Salutation */}
                                <tr>
                                    <td colSpan={40} style={{ textAlign: "left", paddingBottom: "5px", fontWeight: "bold" }}>
                                        TO WHOM IT MAY CONCERN:
                                    </td>
                                </tr>

                                {/* Certification Line */}
                                {/* Name, Age, Sex Line - Fully Fitted */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "justify",
                                            paddingBottom: "10px",
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            verticalAlign: "top",
                                        }}
                                    >
                                        This is to certify that&nbsp;
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                width: "50%",
                                                borderBottom: "1px solid black",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span>
                                                {person.last_name.toUpperCase()}, {person.first_name.toUpperCase()}{" "}
                                                {person.middle_name.toUpperCase()}
                                            </span>

                                        </span>

                                        &nbsp;

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                width: "10%",
                                                borderBottom: "1px solid black",
                                                textAlign: "center",
                                                marginLeft: "5px",
                                                marginRight: "5px",
                                            }}
                                        >
                                            <span>{person.age}</span>

                                        </span>
                                        &nbsp;years old,&nbsp;
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                width: "15%",
                                                borderBottom: "1px solid black",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span>
                                                {person.gender === 0
                                                    ? "MALE"
                                                    : person.gender === 1
                                                        ? "FEMALE"
                                                        : ""}
                                            </span>

                                        </span>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginLeft: "140px",
                                            }}
                                        >
                                            <span style={{ width: "15%", textAlign: "center", marginLeft: "150px" }}>(Name)</span>

                                            <span style={{ width: "20%", textAlign: "center", marginLeft: "30px" }}>(Age)</span>
                                            <span style={{ width: "10%", textAlign: "center", marginRight: "10px" }}>(Sex)</span>
                                        </div>
                                    </td>
                                </tr>


                                {/* Civil Status, Address, Date - All in One Row with Labels Below */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "justify",
                                            paddingBottom: "3px",
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {/* Civil Status */}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                width: "10%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    borderBottom: "1px solid black",
                                                    width: "100%",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {person.civilStatus}
                                            </div>
                                            <div style={{ fontSize: "13px", textAlign: "center" }}>(Civil Status)</div>
                                        </span>

                                        &nbsp;A resident of&nbsp;

                                        {/* Address */}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                width: "50%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    borderBottom: "1px solid black",
                                                    width: "100%",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {person.permanentStreet} {person.permanentBarangay}{" "}
                                                {person.permanentMunicipality}
                                            </div>
                                            <div style={{ fontSize: "13px", textAlign: "center" }}>(Address)</div>
                                        </span>

                                        &nbsp;was examined on&nbsp;

                                        {/* Date */}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                width: "16%",
                                                verticalAlign: "bottom",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    borderBottom: "1px solid black",
                                                    textAlign: "center",
                                                    width: "100%",
                                                    lineHeight: "16px",
                                                }}
                                            >
                                                {/* Insert date here */}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    textAlign: "center",
                                                    marginTop: "1px",
                                                    lineHeight: "14px",
                                                }}
                                            >
                                                (Date)
                                            </div>
                                        </span>
                                    </td>
                                </tr>

                                {/* ✅ Due to Line — perfectly matching width */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "left",
                                            paddingTop: "6px",
                                            width: "100%",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                width: "101.5%",
                                            }}
                                        >
                                            <span style={{ minWidth: "60px" }}>Due to:</span>
                                            <span
                                                style={{
                                                    flexGrow: 1,
                                                    borderBottom: "1px solid black",
                                                    display: "inline-block",
                                                    marginLeft: "5px",
                                                }}
                                            ></span>
                                        </div>
                                    </td>
                                </tr>

                                {/* --- Findings and Footer Section --- */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "left",
                                            paddingTop: "5px",
                                            width: "100%",
                                            fontSize: "14px",
                                            lineHeight: "1.8",
                                        }}
                                    >
                                        And found:
                                        <br />
                                        <div style={{ marginLeft: "50px", marginTop: "-20px" }}>
                                            <br />
                                            ( ) Physically and mentally fit.
                                            <br />
                                            ( ) With the impression of{" "}
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    borderBottom: "1px solid black",
                                                    width: "300px", // uniform underline width
                                                    marginLeft: "5px",
                                                }}
                                            ></span>
                                            <br />
                                            And was advised to{" "}
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    borderBottom: "1px solid black",
                                                    width: "335px", // same width
                                                    marginLeft: "5px",
                                                }}
                                            ></span>

                                            <br />
                                            <br />
                                            This certificate is issued upon request for medical purposes only.
                                        </div>
                                        <br />
                                        Official Receipt No.:{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                borderBottom: "1px solid black",
                                                width: "200px",
                                                marginLeft: "5px",
                                            }}
                                        ></span>
                                        <br />
                                        Date Issued:{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                borderBottom: "1px solid black",
                                                width: "245px",
                                                marginLeft: "5px",
                                            }}
                                        ></span>
                                        <br />
                                        MC No.:{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                borderBottom: "1px solid black",
                                                width: "265px",
                                                marginLeft: "5px",
                                            }}
                                        ></span>
                                        <br />
                                        {/* --- Centered line below MC No. --- */}
                                        <div
                                            style={{
                                                textAlign: "center",
                                                marginTop: "15px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    borderBottom: "1px solid black",
                                                    width: "300px",
                                                    marginLeft: "250px"
                                                }}
                                            ></span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={40} style={{ borderBottom: "1px solid black", height: "14px" }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </Container>


                    <Container>


                        <div
                            className="student-table"
                            style={{

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center", // Center horizontally
                                padding: "10px 20px",
                                width: "100%",

                                boxSizing: "border-box"
                            }}>
                            {/* Wrapper to contain logo and text side by side without stretching */}
                            <div style={{
                                display: "flex",

                                alignItems: "center"
                            }}>
                                {/* Logo */}
                                <div style={{ flexShrink: 0, marginRight: "20px" }}>
                                    <img
                                        src={fetchedLogo}
                                        alt="School Logo"
                                        style={{
                                            width: "120px",   // ✅ hardcoded width
                                            height: "120px",  // ✅ hardcoded height
                                            borderRadius: "50%", // optional (use for circular look)
                                            objectFit: "cover",
                                            marginTop: "-30px",
                                        }}
                                    />
                                </div>


                                <div style={{ height: "20px" }}></div>
                                <div>
                                    {/* Top Line: Republic */}
                                    <div style={{
                                        fontSize: "14px",
                                        fontFamily: "Arial, sans-serif",
                                        textAlign: "left",
                                        marginBottom: "5px"
                                    }}>
                                        Republic of the Philippines
                                    </div>

                                    {/* Institute Name */}
                                    <div
                                        style={{
                                            fontSize: "25px",
                                            fontWeight: "bold",
                                            color: "black",
                                            fontFamily: "Times New Roman",
                                            marginBottom: "5px",
                                        }}
                                    >
                                        {companyName}
                                    </div>

                                    {/* Horizontal Line */}
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
                                        <hr style={{ width: "100%", maxWidth: "700px", border: "1px solid #000", margin: 0 }} />
                                    </div>
                                    <br />
                                    {/* Office Name */}
                                    <div style={{
                                        textAlign: "center",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        fontFamily: "Times, New Roman",
                                        marginLeft: "-10px",
                                        marginTop: "-20px"
                                    }}>
                                        HEALTH SERVICE DIVISION

                                    </div>

                                    <div style={{
                                        textAlign: "center",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        fontFamily: "Times, New Roman",
                                        marginLeft: "-10px",

                                        marginTop: "30px"
                                    }}>
                                        MEDICAL CERTIFICATE

                                    </div>
                                </div>
                            </div>
                        </div>
                        <br />
                        <table
                            style={{
                                borderCollapse: "collapse",
                                width: "8in",
                                margin: "0 auto",
                                fontFamily: "Times New Roman",
                                fontSize: "16px",
                                lineHeight: "1.3",
                            }}
                        >
                            <tbody>
                                {/* Title */}

                                {/* Salutation */}
                                <tr>
                                    <td colSpan={40} style={{ textAlign: "left", paddingBottom: "5px", fontWeight: "bold" }}>
                                        TO WHOM IT MAY CONCERN:
                                    </td>
                                </tr>

                                {/* Certification Line */}
                                {/* Name, Age, Sex Line - Fully Fitted */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "justify",
                                            paddingBottom: "10px",
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            verticalAlign: "top",
                                        }}
                                    >
                                        This is to certify that&nbsp;
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                width: "50%",
                                                borderBottom: "1px solid black",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span>
                                                {person.last_name.toUpperCase()}, {person.first_name.toUpperCase()}{" "}
                                                {person.middle_name.toUpperCase()}
                                            </span>

                                        </span>

                                        &nbsp;

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                width: "10%",
                                                borderBottom: "1px solid black",
                                                textAlign: "center",
                                                marginLeft: "5px",
                                                marginRight: "5px",
                                            }}
                                        >
                                            <span>{person.age}</span>

                                        </span>
                                        &nbsp;years old,&nbsp;
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                width: "15%",
                                                borderBottom: "1px solid black",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span>
                                                {person.gender === 0
                                                    ? "MALE"
                                                    : person.gender === 1
                                                        ? "FEMALE"
                                                        : ""}
                                            </span>

                                        </span>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginLeft: "140px",
                                            }}
                                        >
                                            <span style={{ width: "15%", textAlign: "center", marginLeft: "150px" }}>(Name)</span>

                                            <span style={{ width: "20%", textAlign: "center", marginLeft: "30px" }}>(Age)</span>
                                            <span style={{ width: "10%", textAlign: "center", marginRight: "10px" }}>(Sex)</span>
                                        </div>
                                    </td>
                                </tr>


                                {/* Civil Status, Address, Date - All in One Row with Labels Below */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "justify",
                                            paddingBottom: "3px",
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {/* Civil Status */}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                width: "10%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    borderBottom: "1px solid black",
                                                    width: "100%",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {person.civilStatus}
                                            </div>
                                            <div style={{ fontSize: "13px", textAlign: "center" }}>(Civil Status)</div>
                                        </span>

                                        &nbsp;A resident of&nbsp;

                                        {/* Address */}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                width: "50%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    borderBottom: "1px solid black",
                                                    width: "100%",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {person.permanentStreet} {person.permanentBarangay}{" "}
                                                {person.permanentMunicipality}
                                            </div>
                                            <div style={{ fontSize: "13px", textAlign: "center" }}>(Address)</div>
                                        </span>

                                        &nbsp;was examined on&nbsp;

                                        {/* Date */}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                width: "16%",
                                                verticalAlign: "bottom",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    borderBottom: "1px solid black",
                                                    textAlign: "center",
                                                    width: "100%",
                                                    lineHeight: "16px",
                                                }}
                                            >
                                                {/* Insert date here */}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    textAlign: "center",
                                                    marginTop: "1px",
                                                    lineHeight: "14px",
                                                }}
                                            >
                                                (Date)
                                            </div>
                                        </span>
                                    </td>
                                </tr>

                                {/* ✅ Due to Line — perfectly matching width */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "left",
                                            paddingTop: "6px",
                                            width: "100%",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                width: "101.5%",
                                            }}
                                        >
                                            <span style={{ minWidth: "60px" }}>Due to:</span>
                                            <span
                                                style={{
                                                    flexGrow: 1,
                                                    borderBottom: "1px solid black",
                                                    display: "inline-block",
                                                    marginLeft: "5px",
                                                }}
                                            ></span>
                                        </div>
                                    </td>
                                </tr>


                                {/* --- Findings and Footer Section --- */}
                                <tr>
                                    <td
                                        colSpan={40}
                                        style={{
                                            textAlign: "left",
                                            paddingTop: "5px",
                                            width: "100%",
                                            fontSize: "14px",
                                            lineHeight: "1.8",
                                        }}
                                    >
                                        And found:
                                        <br />
                                        <div style={{ marginLeft: "50px", marginTop: "-20px" }}>
                                            <br />
                                            ( ) Physically and mentally fit.
                                            <br />
                                            ( ) With the impression of{" "}
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    borderBottom: "1px solid black",
                                                    width: "300px", // uniform underline width
                                                    marginLeft: "5px",
                                                }}
                                            ></span>
                                            <br />
                                            And was advised to{" "}
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    borderBottom: "1px solid black",
                                                    width: "335px", // same width
                                                    marginLeft: "5px",
                                                }}
                                            ></span>

                                            <br />
                                            <br />
                                            This certificate is issued upon request for medical purposes only.
                                        </div>
                                        <br />
                                        Official Receipt No.:{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                borderBottom: "1px solid black",
                                                width: "200px",
                                                marginLeft: "5px",
                                            }}
                                        ></span>
                                        <br />
                                        Date Issued:{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                borderBottom: "1px solid black",
                                                width: "245px",
                                                marginLeft: "5px",
                                            }}
                                        ></span>
                                        <br />
                                        MC No.:{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                borderBottom: "1px solid black",
                                                width: "265px",
                                                marginLeft: "5px",
                                            }}
                                        ></span>
                                        <br />
                                        {/* --- Centered line below MC No. --- */}
                                        <div
                                            style={{
                                                textAlign: "center",
                                                marginTop: "15px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    borderBottom: "1px solid black",
                                                    width: "300px",
                                                    marginLeft: "250px"
                                                }}
                                            ></span>
                                        </div>
                                    </td>
                                </tr>


                            </tbody>
                        </table>
                    </Container>
                </div>





            </Container>


        </Box >

    );
};

export default MedicalCertificate;

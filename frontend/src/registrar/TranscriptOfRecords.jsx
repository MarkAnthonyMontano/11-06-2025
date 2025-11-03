import { Box, Typography, TextField, Snackbar, Alert, Avatar } from "@mui/material";
import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import EaristLogo from "../assets/EaristLogo.png";
import { InsertPageBreak, Search } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";
import SearchIcon from "@mui/icons-material/Search";


const TOR = () => {

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
        otherEthnicGroup: "",
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
        father_deceased: "",
        father_family_name: "", father_given_name: "", father_middle_name: "", father_ext: "", father_contact: "", father_occupation: "",
        father_income: "", father_email: "", mother_deceased: "", mother_family_name: "", mother_given_name: "", mother_middle_name: "",
        mother_contact: "", mother_occupation: "", mother_income: "", guardian: "", guardian_family_name: "", guardian_given_name: "",
        guardian_middle_name: "", guardian_ext: "", guardian_nickname: "", guardian_address: "", guardian_contact: "", guardian_email: "",
    });



    const [campusAddress, setCampusAddress] = useState("");

    useEffect(() => {
        if (settings && settings.address) {
            setCampusAddress(settings.address);
        }
    }, [settings]);

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

    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);

            if (storedRole === "applicant" || storedRole === "registrar") {
                fetchPersonData(storedID);
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);




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



    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);


    const pageId = 70;

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

    const totalUnitPerSubject = (course_unit, lab_unit) => {
        const lec = Number(course_unit) || 0;
        const lab = Number(lab_unit) || 0;
        return lec + lab;
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

    const groupedSubjects = Object.entries(groupedDetails).map(([key, courses]) => ({
        termKey: key,
        year: courses[0]?.current_year,
        nextYear: courses[0]?.next_year,
        semester: courses[0]?.semester_description,
        subjects: courses
    }));

    const subjectsPerPage = 30;
    const chunkArray = (arr, size) => {
        const result = [];
        let page = [];
        let count = 0; // total subjects on current page

        for (const group of arr) {
            if (group.subjects.length > size) {
                // Case 1: semester itself exceeds a page -> split inside subjects
                let start = 0;
                while (start < group.subjects.length) {
                    const slice = group.subjects.slice(start, start + size);
                    result.push([{ ...group, subjects: slice }]);
                    start += size;
                }
                count = 0;
                page = [];
            } else if (count + group.subjects.length > size) {
                // Case 2: not enough space left -> push current page and start new
                result.push(page);
                page = [group];
                count = group.subjects.length;
            } else {
                // Case 3: fits in current page
                page.push(group);
                count += group.subjects.length;
            }
        }

        if (page.length > 0) result.push(page);
        return result;
    };


    const paginatedSubjects = chunkArray(groupedSubjects, subjectsPerPage);

    const formattedDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const todayDate = new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const divToPrintRef = useRef();

    const printDiv = () => {
        window.print();
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
        <Box className="body" sx={{ height: 'calc(100vh - 150px)', overflowY: 'auto', overflowX: 'hidden', pr: 1, }}>
            <Box
                className="navbars"
                sx={{
                    display: "flex",
                    background: "white",
                    alignItems: "center",
                    justifyContent: "space-between",

                    mb: 2,
                }}
            >
                {/* Left: Title */}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: "maroon",
                        fontSize: "36px",
                        background: "white",
                        display: "flex",
                        alignItems: "center",

                    }}
                >
                    TRANSCRIPT OF RECORDS
                </Typography>

                {/* Right: Search + Print grouped together */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TextField
                        variant="outlined"
                        placeholder="Enter Student Number"
                        size="small"
                        value={studentNumber}
                        onChange={(e) => {
                            setStudentNumber(e.target.value);
                            setSearchQuery(e.target.value);
                        }}
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

                    <button
                        onClick={printDiv}
                        className="bg-maroon-500 w-[10rem] h-[3rem] text-[18px] text-white rounded"
                    >
                        Print
                    </button>
                </Box>
            </Box>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />


            <style>
                {`
                @media print {
                    @page {
                        margin: 0; 
                        size: 215.9mm 330.2mm; 
                    }

                    .body{
                        margin-top: -11rem;
                        position: absolute !important;
                        margin-left: -3.5rem;
                        overflow: visible !important;  /* show all content */
                        height: auto !important;       /* expand height */
                        max-height: none !important;   /* no max height limit */
                        
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .page, .page * {
                        visibility: visible !important;
                    }

                    .page {
                        display: block !important; 
                        page-break-after: always !important;
                        break-after: page !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        
                        min-width: 215.9mm !important;
                        position: static !important;  /* <– remove absolute positioning */
                        transform: none !important;   /* <– remove scaling/shifting */
                        scale: 0.87 !important;
                        overflowY: hidden;
                        min-height: 330.2mm !important;
                        margin: 0 auto !important;
                    }

                    .print-container{
                        width: 100%;
                        height: 100%;    
                    }

                    .print-container-2{
                        margin-top: -7rem !important;
                    }
                    
                    .print-container-3{
                        margin-top: -9rem !important;
                    }

                    table, tr, td {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    button {
                        display: none !important; /* hide buttons */
                    }
                    .navbars{
                        display: none;
                    }
                }
                `}
            </style>
            <Box ref={divToPrintRef} className="page">
                {paginatedSubjects.map((pageGroups, pageIndex) => (
                    <Box key={pageIndex} className={`print-container print-container-${pageIndex + 1}   `} style={{ pageBreakAfter: "always", breakAfter: "page", paddingRight: "1.5rem", marginTop: "3rem", paddingBottom: "1.5rem", minWidth: "215.9mm", minHeight: "330.9mm" }}>
                        {/* Start Of Header */}
                        <Box style={{ display: "flex", alignItems: "center", width: "80rem", justifyContent: "center" }}>
                            <Box style={{ paddingTop: "1.5rem", marginLeft: "-10rem", paddingRight: "3rem" }}>
                                <img
                                    src={fetchedLogo || EaristLogo} // use dynamic logo if available
                                    alt="Logo"
                                    style={{ width: "8rem", height: "8rem", borderRadius: "50%" }}
                                />
                            </Box>
                            <Box style={{ marginTop: "1.5rem", textAlign: "center" }}>
                                <Typography>Republic of the Philippines</Typography>

                                {companyName && (
                                    (() => {
                                        const words = companyName.trim().split(" ");
                                        const middle = Math.ceil(words.length / 2);
                                        const firstLine = words.slice(0, middle).join(" ");
                                        const secondLine = words.slice(middle).join(" ");
                                        return (
                                            <>
                                                <Typography
                                                    style={{
                                                        marginTop: "0rem",
                                                        lineHeight: "1",
                                                        fontSize: "1.6rem",
                                                        letterSpacing: "-1px",
                                                        fontWeight: "600",
                                                        fontFamily: "Times new roman"
                                                    }}
                                                >
                                                    {firstLine}
                                                </Typography>
                                                {secondLine && (
                                                    <Typography
                                                        style={{
                                                            lineHeight: "1",
                                                            fontSize: "1.6rem",
                                                            letterSpacing: "-1px",
                                                            fontWeight: "600",
                                                            fontFamily: "Times new roman"
                                                        }}
                                                    >
                                                        {secondLine}
                                                    </Typography>
                                                )}
                                            </>
                                        );
                                    })()
                                )}

                                <Typography style={{ fontSize: "12px" }}>{campusAddress}</Typography>
                            </Box>

                        </Box>
                        <Typography style={{ marginLeft: "1rem", textAlign: "center", width: "80rem", fontSize: "1.6rem", letterSpacing: "-1px", fontWeight: "500" }}>OFFICE OF THE REGISTRAR</Typography>
                        <Typography style={{ marginLeft: "1rem", marginTop: "-0.5rem", width: "80rem", textAlign: "center", fontSize: "2.75rem", letterSpacing: "-1px", fontWeight: "600" }}>OFFICIAL TRANSCRIPT OF RECORDS</Typography>
                        <Box style={{ display: "flex", marginTop: "2rem" }}>
                            <Box>
                                <Box style={{ display: "flex" }}>
                                    <Box sx={{ padding: "1rem", marginLeft: "1rem", borderBottom: "solid black 1px", width: "80rem" }}>
                                        <Box>
                                            <Box style={{ display: "flex", width: "40rem" }}>
                                                <Typography style={{ width: "20rem", fontSize: "22px", letterSpacing: "-2px", wordSpacing: "14rem" }}>NAME :</Typography>

                                                <Typography style={{ display: "flex", fontSize: "24px", fontWeight: "600", letterSpacing: "-1.5px", wordSpacing: "3px", alignItems: "center", height: "36px" }}>
                                                    {studentData && studentData.last_name
                                                        ? `${studentData.last_name.toUpperCase()}, ${studentData.first_name.toUpperCase()}`
                                                        : ""}
                                                </Typography>
                                            </Box>
                                            <Box style={{ display: "flex", marginTop: "-6px" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-1px", justifyContent: "space-between" }}>
                                                    <span>DATE OF BIRTH</span>
                                                    <span>:</span>
                                                </Typography>
                                                <Typography style={{ fontSize: "21px", marginTop: "-5px", marginLeft: "2.3rem", fontWeight: "400", letterSpacing: "-1px", wordSpacing: "3px" }}>{formattedDate(studentData.birthOfDate)}</Typography>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Box style={{ display: "flex", width: "62rem", marginTop: "0.6rem" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-2.3px", justifyContent: "space-between" }}>
                                                    <span>ADMISSION CREDENTIALS</span>
                                                    <span>:</span>
                                                </Typography>
                                                {studentData && studentData.requirements && (
                                                    <Typography style={{ fontSize: "21px", marginTop: "-5px", height: "30px", marginLeft: "2.3rem", fontWeight: "400", letterSpacing: "-2px", wordSpacing: "1px" }}>
                                                        {studentData.requirements
                                                            .map(reqId =>
                                                                reqId === 0 ? "No Document" :
                                                                    reqId === 1 ? "F138" :
                                                                        reqId === 2 ? "Certificate Of Good Moral Character" :
                                                                            reqId === 3 ? "NSO Birth Certificate" :
                                                                                reqId === 4 ? "F137" :
                                                                                    ""
                                                            )
                                                            .join("/")}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box style={{ display: "flex", marginTop: "-1px" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-2.3px", justifyContent: "space-between" }}>
                                                    <span style={{ wordSpacing: "2px" }}>LAST SCHOOL ATTENDED</span>
                                                    <span>:</span>
                                                </Typography>
                                                <Typography style={{ fontSize: "22px", marginTop: "-5px", marginLeft: "2.3rem", fontWeight: "400", letterSpacing: "-1.5px", wordSpacing: "5px" }}>
                                                    {studentData.schoolLastAttended}
                                                </Typography>
                                            </Box>
                                            <Box style={{ display: "flex", marginTop: "-3px" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-2.3px", justifyContent: "space-between" }}>
                                                    <span style={{ wordSpacing: "3px" }}>DATE GRADUATED</span>
                                                    <span>:</span>
                                                </Typography>
                                                <Typography style={{ fontSize: "22px", marginTop: "-5px", marginLeft: "2.3rem", fontWeight: "400", letterSpacing: "-1.5px", wordSpacing: "5px" }}>
                                                    {studentData.yearGraduated}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Box style={{ display: "flex", width: "38rem", marginTop: "0.9rem" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-1px", justifyContent: "space-between" }}>
                                                    <span>STUDENT NUMBER</span>
                                                    <span>:</span>
                                                </Typography>

                                                <Typography style={{ fontSize: "21px", marginTop: "-5px", marginLeft: "2.3rem", fontWeight: "500", letterSpacing: "-1px", wordSpacing: "3px", height: "30px" }}>{studentData.student_number}</Typography>
                                            </Box>
                                            <Box style={{ display: "flex" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-1px", justifyContent: "space-between" }}>
                                                    <span>DEGREE/TITLE EARNED</span>
                                                    <span>:</span>
                                                </Typography>
                                                <Typography style={{ fontSize: "22px", marginLeft: "2.3rem", marginTop: "-5.5px", fontWeight: "500", letterSpacing: "-1.5px", wordSpacing: "5px", height: "30px" }}>
                                                    {studentData && studentData.program_description
                                                        ? `${studentData.program_description.toUpperCase()}`
                                                        : ""}
                                                </Typography>
                                            </Box>
                                            <Box style={{ display: "flex", marginTop: "1px" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-1.5px", justifyContent: "space-between" }}>
                                                    <span>MAJOR</span>
                                                    <span>:</span>
                                                </Typography>
                                                <Typography style={{ fontSize: "22px", marginTop: "-5px", marginLeft: "2.3rem", fontWeight: "500", letterSpacing: "-1.5px", wordSpacing: "5px", height: "30px" }}>
                                                    {studentData && studentData.major
                                                        ? `${studentData.major.toUpperCase()}`
                                                        : ""}
                                                </Typography>
                                            </Box>
                                            <Box style={{ display: "flex", marginTop: "1px" }}>
                                                <Typography style={{ display: "flex", width: "17.8rem", height: "20px", alignItems: "center", fontSize: "22px", letterSpacing: "-2px", justifyContent: "space-between", wordSpacing: "4px" }}>
                                                    <span>DATE OF GRADUATION</span>
                                                    <span>:</span>
                                                </Typography>
                                                <Typography style={{ fontSize: "22px", marginTop: "-5px", marginLeft: "2.3rem", fontWeight: "500", letterSpacing: "-1.5px", wordSpacing: "5px" }}>

                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box style={{ marginLeft: "-12.6rem", marginTop: "1.3rem" }}>
                                        {!studentData?.profile_image ? (
                                            <Avatar
                                                sx={{
                                                    width: 200,
                                                    height: 226,
                                                    border: "3px solid maroon",
                                                    color: "maroon",
                                                    bgcolor: "transparent",
                                                }}
                                                variant="square"
                                            />
                                        ) : (
                                            <Avatar
                                                src={`http://localhost:5000/uploads/${studentData.profile_image}`}
                                                sx={{
                                                    width: 200,
                                                    height: 246,
                                                    mx: "auto",
                                                }}
                                                variant="square"
                                            />
                                        )}
                                    </Box>
                                </Box>
                                {/* End of Header */}
                                {/* Start of Main Content */}
                                <Box style={{ display: "flex", marginLeft: "1rem", marginTop: "0.5rem", flexWrap: "wrap", borderTop: "solid black 1px", overflow: "hidden" }}>
                                    <Box style={{ flex: "0 0 50%", marginBottom: "1rem", boxSizing: "border-box" }}>
                                        <table >
                                            <thead>
                                                <tr style={{ display: "flex", height: "65px", borderBottom: "solid 1px black" }}>
                                                    <td style={{ fontWeight: "600", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: "0.8px", width: "13rem" }}>
                                                        <span>TERM</span>
                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "38rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "600", fontSize: "20px", textAlign: "center", letterSpacing: "-1px", width: "28rem" }}>SUBJECTS</div>
                                                        <div style={{ margin: "-1px", fontWeight: "600", fontSize: "20px", textAlign: "center", letterSpacing: "-1px", width: "28rem", wordSpacing: "3px" }}>CODE NUMBER WITH DESCRIPTIVE TITLE</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: "600", textAlign: "center", fontSize: "20px", letterSpacing: "-1px", width: "13rem" }}>
                                                            <span style={{ marginLeft: "-1.6rem" }}>GRADES</span>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                            <div style={{ fontWeight: "600", fontSize: "20px", textAlign: "center", letterSpacing: "-1px", width: "6rem" }}>
                                                                <span>FINAL</span>
                                                            </div>
                                                            <div style={{ textAlign: "center", fontWeight: "600", fontSize: "20px", marginLeft: "-2rem", letterSpacing: "-1px", width: "7rem" }}>
                                                                <span>RE-EXAM</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: "600", display: "flex", fontSize: "20px", alignItems: "center", justifyContent: "center", letterSpacing: "-1px", width: "7rem" }}>
                                                        <span>CREDITS</span>
                                                    </td>
                                                    <td style={{ fontWeight: "600", display: "flex", fontSize: "20px", alignItems: "center", justifyContent: "center", letterSpacing: "-1px", width: "8.9rem" }}>
                                                        <span>REMARKS</span>
                                                    </td>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxWidth: "650px", overflowY: "hidden" }}>
                                                <tr>
                                                    <td style={{ fontWeight: "500", textUnderlineOffset: "3px", textDecoration: "underline", letterSpacing: "-1px", paddingLeft: "1.5rem", fontSize: "20px" }}>{studentDetails[0]?.program_description?.toUpperCase()}</td>
                                                </tr>

                                                {pageGroups.map(group => (
                                                    <React.Fragment key={group.termKey}>
                                                        {group.subjects.map((p, index) => (
                                                            <tr style={{ display: "flex" }} key={p.enrolled_id}>
                                                                <td
                                                                    style={{
                                                                        width: "13rem",
                                                                        fontWeight: "400",
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        justifyContent: "center",
                                                                        alignItems: "flex-start",
                                                                        position: "relative",
                                                                        paddingTop: index === 0 ? "0" : "0",
                                                                    }}
                                                                >
                                                                    {index === 0 && (
                                                                        <>
                                                                            <span style={{ fontSize: "18px", textAlign: "center", width: "14rem" }}>
                                                                                {p.semester_description}
                                                                            </span>
                                                                            <span style={{ fontSize: "17px", marginTop: "3rem", position: "absolute", textAlign: "center", width: "13.5rem" }}>
                                                                                {p.current_year} - {p.next_year}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </td>
                                                                <td style={{ display: "flex", width: "38rem" }}>
                                                                    <span style={{ width: "90px", margin: "0", padding: "0", fontSize: "18px", letterSpacing: "-0.5px" }}>{p.course_code}</span>
                                                                    <span style={{ marginLeft: "30px", padding: "0", fontSize: "18px", letterSpacing: "-0.5px" }}>{p.course_description.toUpperCase()}</span>
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                                        <div style={{ fontSize: "18px", width: "6rem", textAlign: "center" }}>
                                                                            <span>{p.final_grade}</span>
                                                                        </div>
                                                                        <div style={{ fontSize: "18px", textAlign: "center", width: "7rem", marginLeft: "-2rem" }}>
                                                                            <span></span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: "flex", fontSize: "18px", alignItems: "center", width: "7rem", marginLeft: "1.7rem", justifyContent: "center" }}>
                                                                        {totalUnitPerSubject(p.course_unit, p.lab_unit)}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", width: "8.9rem", fontSize: "18px", justifyContent: "center" }}>
                                                                        {p.en_remarks === 0 ? "Incomplete" :
                                                                            p.en_remarks === 1 ? "Passed" :
                                                                                p.en_remarks === 2 ? "Failed" :
                                                                                    p.en_remarks === 3 ? "Incomplete" :
                                                                                        p.en_remarks === 4 ? "Dropped" :
                                                                                            ""
                                                                        }
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        <tr style={{ display: "flex", marginTop: "-6px" }}>
                                                            <td style={{ width: "12.8rem" }}>

                                                            </td>
                                                            <td style={{ width: "37.2rem" }}>

                                                            </td>
                                                            <td style={{ fontWeight: "600", fontSize: "18px" }}>
                                                                GWA: {(group.subjects.reduce((total, subj) => total + (Number(subj.final_grade) || 0), 0) / 8).toFixed(3)}
                                                            </td>
                                                            <td>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}

                                            </tbody>
                                        </table>
                                    </Box>
                                </Box>
                                {/* End of Main Content */}
                                {/* Start Of Footer */}
                                <Box style={{ display: "flex", marginLeft: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                                    <Box style={{ flex: "0 0 50%", marginBottom: "1rem", boxSizing: "border-box" }}>
                                        <table >
                                            <thead>
                                                <tr style={{ display: "flex", height: "30px", alignItems: "end", justifyContent: "center", borderTop: "dashed 1px black" }}>
                                                    <td>
                                                        <span style={{ marginBottom: "-4px", fontSize: "17px", fontWeight: "600", display: "flex" }}>
                                                            {pageIndex === paginatedSubjects.length - 1
                                                                ? "- Nothing Follows -"
                                                                : "- continue on next page -"}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr style={{ display: "flex", height: "145px", borderTop: "solid 1px black" }}>
                                                    <td style={{ fontWeight: "400", fontSize: "18px", display: "flex", alignItems: "start", justifyContent: "center", letterSpacing: "-1px", width: "13rem" }}>
                                                        <span>GRADING SYSTEM</span>

                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "4.5rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "0px", paddingTop: "3px" }}>1.00</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "0px" }}>1.25</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "0px" }}>1.50</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "0px" }}>1.75</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>2.00</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>2.25</div>
                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "6.5rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px", paddingTop: "3px" }}>(97-100)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(94-96)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(91-93)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(88-90)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(85-87)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(82-84)</div>
                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "15.5rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px", paddingTop: "3px" }}>Marked Excellence</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Excellent</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Very Superior</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Superior</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Very Good</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Good</div>
                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "4.5rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px", paddingTop: "3px" }}>2.50</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>2.75</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>3.00</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>5.00</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>INC</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>DRP</div>
                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "14rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px", paddingTop: "3px" }}>(79-81)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(76-78)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-2px" }}>(75)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1.5px" }}>(Below 75)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1.5px" }}>(Incomplete)</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1.5px" }}>(Dropped Officially/Unofficialy)</div>
                                                    </td>
                                                    <td style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "22rem" }}>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px", paddingTop: "3px" }}>Satisfactory</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Fair</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Passed</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Failed</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Incomplete</div>
                                                        <div style={{ margin: "-1px", fontWeight: "400", fontSize: "16px", letterSpacing: "-1px" }}>Dropped</div>
                                                    </td>
                                                </tr>
                                                <tr style={{ display: "flex", paddingLeft: "2rem", height: "35px", borderBottom: "solid 1px black" }}>
                                                    <td>
                                                        <span style={{ fontSize: "18px" }}>
                                                            CREDITS, O
                                                        </span>
                                                        <span>
                                                            ne college units is at least (17) full hours of instruction in academic or professional subject within a semester.
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr style={{ display: "flex", paddingLeft: "2rem", height: "65px", borderBottom: "solid 1px black" }}>
                                                    <td style={{ marginTop: "8px" }}>
                                                        <span style={{ fontSize: "18px", marginRight: "8px", letterSpacing: "-0.8px", wordSpacing: "1px" }}>
                                                            EULOGIO "AMANG" RODRIGUEZ INSTITUTE OF SCIENCE AND TECHNOLOGY
                                                        </span>
                                                        <span style={{ letterSpacing: "-0.8px", fontSize: "17px", wordSpacing: "1px" }}>
                                                            is a State College; hence, a SPECIAL ORDER is not issued to its graduates. The <br />
                                                            issuance of the Official Transcript of Records and Diploma is a sufficient proof for Graduation.
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr style={{ display: "flex", paddingLeft: "1rem", marginTop: "0.3rem", height: "65px", borderTop: "solid 1px black", borderBottom: "solid 1px black" }}>
                                                    <td style={{ marginTop: "8px" }}>
                                                        <span style={{ fontSize: "18px", fontWeight: "600", marginRight: "8px", letterSpacing: "-0.8px", wordSpacing: "1px" }}>
                                                            REMARKS:
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr style={{ display: "flex", paddingLeft: "1rem", marginTop: "0.3rem", height: "35px" }}>
                                                    <td style={{ marginTop: "3px" }}>
                                                        <span style={{ fontSize: "18px", fontWeight: "400", marginRight: "2.4rem", letterSpacing: "-0.8px", wordSpacing: "1px" }}>
                                                            DATE ISSUED:
                                                        </span>
                                                        <span style={{ fontSize: "18px", letterSpacing: "-1px", wordSpacing: "3px" }}>
                                                            {todayDate}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr style={{ display: "flex", paddingLeft: "1rem", marginTop: "0.3rem", height: "9rem", borderBottom: "solid black 1px" }}>
                                                    <td style={{ marginTop: "3px", width: "17rem" }}>
                                                        <div>
                                                            <span style={{ fontSize: "18px", letterSpacing: "-1px", wordSpacing: "3px" }}>

                                                            </span>
                                                            <span>

                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ marginTop: "3px", width: "20rem" }}>
                                                        <span style={{ fontSize: "18px", fontWeight: "400", marginRight: "2.4rem", letterSpacing: "-0.8px", wordSpacing: "1px" }}>
                                                            PREPARED BY:
                                                        </span>
                                                        <div>
                                                            <span style={{ fontSize: "18px", letterSpacing: "-1px", wordSpacing: "3px" }}>

                                                            </span>
                                                            <span>

                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ marginTop: "3px", width: "20rem" }}>
                                                        <span style={{ fontSize: "18px", fontWeight: "400", marginRight: "2.4rem", letterSpacing: "-0.8px", wordSpacing: "1px" }}>
                                                            CHECKED BY:
                                                        </span>
                                                        <div>
                                                            <span style={{ fontSize: "18px", letterSpacing: "-1px", wordSpacing: "3px" }}>

                                                            </span>
                                                            <span>

                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ marginTop: "3px", width: "21rem", justifyContent: "center", alignContent: "center" }}>
                                                        <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                                                            <span style={{ fontSize: "24px", letterSpacing: "-2px", wordSpacing: "3px" }}>
                                                                JULIE ANN O. ESPIRITU, JD.
                                                            </span>
                                                            <span style={{ marginTop: "-0.8rem", fontSize: "24px", fontWeight: "500", letterSpacing: "-2px" }}>
                                                                REGISTRAR
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </thead>
                                        </table>
                                    </Box>
                                </Box>
                                {/* End Of Footer */}
                            </Box>
                        </Box>
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
    )
}

export default TOR;
import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Card,
  TableBody,
  Paper,
  TableContainer,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "@mui/icons-material";
import { FcPrint } from "react-icons/fc";
import EaristLogo from "../assets/EaristLogo.png";
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


const ProctorApplicantList = () => {
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

  // Also put it at the very top
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);


  const pageId = 41;

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




  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(6);
  const [clickedSteps, setClickedSteps] = useState(Array(tabs.length).fill(false));


  const handleStepClick = (index, to) => {
    setActiveStep(index);
    navigate(to); // this will actually change the page
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [proctor, setProctor] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [person, setPerson] = useState({
    campus: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    program: "",
    extension: "",


  });

  const handleSearch = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/proctor-applicants",
        { params: { query: searchQuery } }
      );
      setProctor(data[0]?.schedule || null); // first schedule if multiple
      setApplicants(data[0]?.applicants || []);
    } catch (err) {
      console.error(err);
    }
  };

  const [curriculumOptions, setCurriculumOptions] = useState([]);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/applied_program");
        console.log("✅ curriculumOptions:", response.data); // <--- add this
        setCurriculumOptions(response.data);
      } catch (error) {
        console.error("Error fetching curriculum options:", error);
      }
    };

    fetchCurriculums();
  }, []);

  const printDiv = () => {
    const newWin = window.open("", "Print-Window");
    newWin.document.open();

    // ✅ Dynamic logo and company name from Settings
    const logoSrc = fetchedLogo || EaristLogo;
    const name = companyName?.trim() || "No Company Name Available";

    // ✅ Split company name for layout
    const words = name.split(" ");
    const middleIndex = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, middleIndex).join(" ");
    const secondLine = words.slice(middleIndex).join(" ");

    // ✅ Dynamic address from Settings (dropdown or custom)
    let address = "";
    if (settings?.campus_address) {
      address = settings.campus_address;
    } else if (settings?.address) {
      address = settings.address;
    } else {
      address = "No address set in Settings";
    }

    const htmlContent = `
  <html>
    <head>
      <title>Proctor Applicant List</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
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
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid black;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }
        th, td {
          border: 2px solid maroon;
          padding: 6px;
          font-size: 12px;
          text-align: left;
        }
        th {
          text-align: center;
          background-color: #800000;
          color: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>
    <body onload="window.print(); setTimeout(() => window.close(), 100);">
      <div class="print-container">
        <!-- ✅ HEADER -->
        <div class="print-header">
          <img src="${logoSrc}" alt="School Logo" />
          <div>
            <div>Republic of the Philippines</div>

            <!-- ✅ Dynamic company name -->
            <b style="letter-spacing: 1px; font-size: 22px; font-family: 'Times New Roman', serif;">
              ${firstLine}
            </b>
            ${secondLine
        ? `<div style="letter-spacing: 1px; font-size: 22px; font-family: 'Times New Roman', serif;">
                     <b>${secondLine}</b>
                   </div>`
        : ""
      }

            <!-- ✅ Dynamic address from Settings -->
            <div style="font-size: 12px;">${address}</div>

            <div style="margin-top: 25px;">
              <b style="font-size: 22px; letter-spacing: 1px;">Proctor Applicant List</b>
            </div>
          </div>
        </div>

        <!-- ✅ PROCTOR INFO -->
        <div style="margin-top: 20px; width: 100%; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span><b>Proctor:</b> ${proctor?.proctor || "N/A"}</span>
            <span><b>Building:</b> ${proctor?.building_description || "N/A"}</span>
          </div>

          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span><b>Room:</b> ${proctor?.room_description || "N/A"}</span>
            <span><b>Schedule:</b>
              ${proctor?.day_description || ""} |
              ${proctor?.start_time
        ? new Date("1970-01-01T" + proctor.start_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        : ""
      } -
              ${proctor?.end_time
        ? new Date("1970-01-01T" + proctor.end_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        : ""
      }
            </span>
          </div>
        </div>

        <!-- ✅ APPLICANT TABLE -->
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Applicant #</th>
              <th>Applicant Name</th>
              <th>Program</th>
            </tr>
          </thead>
          <tbody>
            ${applicants
        .map((a, index) => {
          const program =
            curriculumOptions.find(
              (item) => item.curriculum_id?.toString() === a.program?.toString()
            )?.program_code ?? "N/A";
          return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${a.applicant_number}</td>
                    <td>${a.last_name}, ${a.first_name} ${a.middle_name || ""}</td>
                    <td>${program}</td>
                  </tr>`;
        })
        .join("")}
            <tr>
              <td colspan="4" style="text-align:right; font-weight:bold;">
                Total Applicants: ${applicants.length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
`;

    newWin.document.write(htmlContent);
    newWin.document.close();
  };


  // 🔎 Auto-search whenever searchQuery changes (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        handleSearch();
      } else {
        setApplicants([]); // clear results if empty search
        setProctor(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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
    <Box sx={{ height: 'calc(100vh - 150px)', overflowY: 'auto', pr: 1, }}>
      {/* Header with Search aligned right */}
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
            fontWeight: "bold",
            color: "maroon",
            fontSize: "36px",
          }}
        >
          PROCTOR APPLICANT LIST
        </Typography>

        <TextField
          variant="outlined"
          placeholder="Search Proctor Name / Email"
          size="small"

          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // reset page when searching
            handleSearch(); // 🔍 auto-search as you type
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

      <br />
      {proctor && (
        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",

            mb: 2,
            fontSize: "16px",
          }}
        >
          <span><b>Proctor:</b> {proctor.proctor || "N/A"}</span>
          <span><b>Building:</b> {proctor.building_description || "N/A"}</span>
          <span><b>Room:</b> {proctor.room_description || "N/A"}</span>
          <span><b>Schedule:</b> {proctor.day_description || ""} |{" "}</span>
          <span><b>Time: </b>
            {proctor.start_time
              ? new Date(`1970-01-01T${proctor.start_time}`).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              : ""}{" "}
            -{" "}
            {proctor.end_time
              ? new Date(`1970-01-01T${proctor.end_time}`).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              : ""}
          </span>
        </Box>
      )}


      {applicants.length > 0 && (
        <Button
          onClick={printDiv}
          variant="outlined"
          sx={{
            padding: "5px 20px",
            border: "2px solid black",
            backgroundColor: "#f0f0f0",
            color: "black",
            borderRadius: "5px",
            fontSize: "14px",
            fontWeight: "bold",
            height: "40px",
            display: "flex",
            alignItems: "center",
            gap: 1, // 8px gap between icon and text
            userSelect: "none",
            transition: "background-color 0.3s, transform 0.2s",
            "&:hover": {
              backgroundColor: "#d3d3d3",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
          startIcon={<FcPrint size={20} />}
        >
          Print Applicant List
        </Button>

      )}
      <br />

      {/* TableContainer */}
      {applicants.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#6D2323" }}>
              <TableRow>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>#</TableCell>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>Applicant</TableCell>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>Name</TableCell>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>Program</TableCell>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>Building</TableCell>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>Room</TableCell>
                <TableCell sx={{ color: "white", textAlign: "center", border: "2px solid maroon" }}>Email Sent</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {applicants.map((a, idx) => (
                <TableRow key={idx}>
                  <TableCell align="center" sx={{ border: "2px solid maroon" }}>{idx + 1}</TableCell>
                  <TableCell align="left" sx={{ border: "2px solid maroon" }}>{a.applicant_number}</TableCell>
                  <TableCell align="left" sx={{ border: "2px solid maroon" }}>
                    {`${a.last_name}, ${a.first_name} ${a.middle_name || ""}`}
                  </TableCell>
                  <TableCell align="left" sx={{ border: "2px solid maroon" }}>
                    {curriculumOptions.find(
                      (item) => item.curriculum_id?.toString() === a.program?.toString()
                    )?.program_code ?? "N/A"}
                  </TableCell>
                  <TableCell align="left" sx={{ border: "2px solid maroon" }}>
                    {a.building_description || proctor?.building_description || "N/A"} {/* ✅ NEW */}
                  </TableCell>
                  <TableCell align="left" sx={{ border: "2px solid maroon" }}>
                    {a.room_description || proctor?.room_description || "N/A"} {/* ✅ NEW */}
                  </TableCell>
                  <TableCell align="left" sx={{ border: "2px solid maroon" }}>
                    {a.email_sent ? "✅ Sent" : "❌ Not Sent"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>

      )}
    </Box>
  );
};

export default ProctorApplicantList;

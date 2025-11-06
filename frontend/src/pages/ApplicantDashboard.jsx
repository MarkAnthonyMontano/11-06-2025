import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import "../styles/TempStyles.css";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import { Dialog } from "@mui/material";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

const ApplicantDashboard = (props) => {
  const settings = useContext(SettingsContext);
  const [fetchedLogo, setFetchedLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [shortTerm, setShortTerm] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/settings");
        const data = response.data;

        if (data.logo_url) {
          setFetchedLogo(`http://localhost:5000${data.logo_url}`);
        } else {
          setFetchedLogo(EaristLogo);
        }

        // ✅ set company + short term + address
        setCompanyName(data.company_name || "");
        setShortTerm(data.short_term || "");
        setCampusAddress(data.address || "");
      } catch (err) {
        console.error("Error fetching settings in ApplicantDashboard:", err);
      }
    };

    fetchSettings();
  }, []);



  const { profileImage, setProfileImage } = props;
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);
  const [openImage, setOpenImage] = useState(null);
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [applicantID, setApplicantID] = useState("");
  const [person, setPerson] = useState({
    profile_img: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    extension: "",
    profile_img: "",
  });
  const [proctor, setProctor] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole === "applicant") {
        fetchPersonData(storedID);
        fetchApplicantNumber(storedID);
      } else {
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const [medicalUploads, setMedicalUploads] = useState([]);

  const fetchMedicalUploads = async (personId) => {
    try {
      const res = await axios.get(`http://localhost:5000/uploads`, {
        headers: { "x-person-id": personId },
      });

      // ✅ Only get vaccine/medical related uploads
      const medicalDocs = res.data.filter(u =>
        u.original_name?.toLowerCase().includes("vaccine") ||
        u.description?.toLowerCase().includes("vaccine") ||
        u.requirements_id === 5 // if 5 = VaccineCard in your DB
      );

      setMedicalUploads(medicalDocs);
    } catch (err) {
      console.error("❌ Failed to fetch medical uploads:", err);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("person_id");
    if (id) {
      checkRequirements(id);
      fetchMedicalUploads(id); // 👈 fetch medical documents
    }
  }, []);

  // add these alongside your other useState declarations
  const [qualifyingExamScore, setQualifyingExamScore] = useState(null);
  const [qualifyingInterviewScore, setQualifyingInterviewScore] = useState(null);
  const [examScore, setExamScore] = useState(null);


  const fetchProctorSchedule = async (applicantNumber) => {
    if (!applicantNumber) return console.warn("fetchProctorSchedule missing applicantNumber");
    try {
      const { data } = await axios.get(`http://localhost:5000/api/applicant-schedule/${applicantNumber}`);
      console.info("applicant-schedule response for", applicantNumber, data);
      setProctor(data);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setProctor(null);
    }
  };


  const [requirementsCompleted, setRequirementsCompleted] = useState(
    localStorage.getItem("requirementsCompleted") === "1"
  );

  useEffect(() => {
    const checkRequirements = () => {
      setRequirementsCompleted(localStorage.getItem("requirementsCompleted") === "1");
    };

    // Run on mount
    checkRequirements();

    // Optional: Listen for storage changes across tabs/components
    window.addEventListener("storage", checkRequirements);

    return () => window.removeEventListener("storage", checkRequirements);
  }, []);

  const [allRequirementsCompleted, setAllRequirementsCompleted] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("person_id");
    if (id) {
      checkRequirements(id);
    }
  }, []);

  const checkRequirements = async (personId) => {
    try {
      const res = await axios.get("http://localhost:5000/uploads", {
        headers: { "x-person-id": personId },
      });

      const uploadsData = res.data;
      const rebuiltSelectedFiles = {};

      uploadsData.forEach((upload) => {
        const desc = upload.description.toLowerCase();
        if (desc.includes("form 138")) rebuiltSelectedFiles["Form138"] = true;
        if (desc.includes("good moral")) rebuiltSelectedFiles["GoodMoralCharacter"] = true;
        if (desc.includes("birth certificate")) rebuiltSelectedFiles["BirthCertificate"] = true;
        if (desc.includes("graduating class")) rebuiltSelectedFiles["CertificateOfGraduatingClass"] = true;
        if (desc.includes("vaccine card")) rebuiltSelectedFiles["VaccineCard"] = true;
      });

      const allRequired = ["Form138", "GoodMoralCharacter", "BirthCertificate", "CertificateOfGraduatingClass", "VaccineCard"]
        .every((key) => rebuiltSelectedFiles[key]);

      setAllRequirementsCompleted(allRequired);
      localStorage.setItem("requirementsCompleted", allRequired ? "1" : "0");
    } catch (err) {
      console.error("Failed to check requirements:", err);
    }
  };




  const fetchApplicantNumber = async (personID) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/applicant_number/${personID}`
      );
      if (res.data && res.data.applicant_number) {
        setApplicantID(res.data.applicant_number);
        fetchEntranceExamScores(res.data.applicant_number);
        fetchProctorSchedule(res.data.applicant_number);
        fetchInterviewSchedule(res.data.applicant_number);
        fetchCollegeApproval(res.data.applicant_number);
      }
    } catch (error) {
      console.error("Failed to fetch applicant number:", error);
    }
  };

  const fetchPersonData = async (id) => {
    if (!id) return console.warn("fetchPersonData called with empty id");

    try {
      console.info("fetchPersonData -> requesting person_with_applicant for id:", id);
      const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${id}`);
      console.info("person_with_applicant response:", res.data);
      setPerson(res.data || {});

      const applicantNumber = res.data?.applicant_number ?? res.data?.applicantNumber ?? null;
      if (applicantNumber) {
        setApplicantID(applicantNumber);
        try {
          const sched = await axios.get(`http://localhost:5000/api/applicant-schedule/${applicantNumber}`);
          console.info("applicant-schedule:", sched.data);
          setProctor(sched.data);
        } catch (e) {
          console.warn("applicant-schedule fetch failed:", e?.response?.data || e.message);
          setProctor(null);
        }
      } else {
        console.warn("No applicant_number in person_with_applicant response for id", id);
      }

      // map many possible field names
      let qExam = res.data?.qualifying_exam_score ?? res.data?.qualifying_result ?? res.data?.exam_score ?? null;
      let qInterview = res.data?.qualifying_interview_score ?? res.data?.interview_result ?? null;
      let ex = res.data?.exam_score ?? res.data?.exam_result ?? null;


      // fallback: fetch person_status_by_applicant if scores not present
      if ((qExam === null && qInterview === null && ex === null) && applicantNumber) {
        try {
          const st = await axios.get(`http://localhost:5000/api/person_status_by_applicant/${applicantNumber}`);
          console.info("person_status_by_applicant response:", st.data);
          qExam = qExam ?? st.data?.qualifying_result ?? null;
          qInterview = qInterview ?? st.data?.interview_result ?? null;
          ex = ex ?? st.data?.exam_result ?? null;
        } catch (err) {
          console.warn("Fallback status endpoint failed:", err?.response?.data || err.message);
        }
      }

      setQualifyingExamScore(qExam !== undefined ? qExam : null);
      setQualifyingInterviewScore(qInterview !== undefined ? qInterview : null);
      setExamScore(ex !== undefined ? ex : null);




      console.info("final mapped scores:", { qExam, qInterview, ex });

    } catch (err) {
      console.error("fetchPersonData failed:", err?.response?.data || err.message);
    }
  };



  // Format start and end time
  const formatTime = (time) =>
    time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      : "";

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const [examScores, setExamScores] = useState({
    english: null,
    science: null,
    filipino: null,
    math: null,
    abstract: null,
    final: null
  });

  const fetchEntranceExamScores = async (applicantNumber) => {
    if (!applicantNumber) return;
    try {
      const res = await axios.get("http://localhost:5000/api/applicants-with-number");
      const applicant = res.data.find(a => a.applicant_number === applicantNumber);

      if (applicant) {
        const english = Number(applicant.english) || 0;
        const science = Number(applicant.science) || 0;
        const filipino = Number(applicant.filipino) || 0;
        const math = Number(applicant.math) || 0;
        const abstract = Number(applicant.abstract) || 0;
        const finalRating = applicant.final_rating
          ? Number(applicant.final_rating)
          : (english + science + filipino + math + abstract) / 5;

        setExamScores({
          english,
          science,
          filipino,
          math,
          abstract,
          final: finalRating.toFixed(2)
        });
      } else {
        setExamScores({
          english: null,
          science: null,
          filipino: null,
          math: null,
          abstract: null,
          final: null
        });
      }
    } catch (err) {
      console.error("❌ Failed to fetch entrance exam scores:", err);
    }
  };


  const hasScores = examScores.english !== null &&
    examScores.science !== null &&
    examScores.filipino !== null &&
    examScores.math !== null &&
    examScores.abstract !== null &&
    (
      examScores.english > 0 ||
      examScores.science > 0 ||
      examScores.filipino > 0 ||
      examScores.math > 0 ||
      examScores.abstract > 0
    );

  const hasSchedule = proctor?.email_sent === 1;

  const [interviewSchedule, setInterviewSchedule] = useState(null);
  const [hasInterviewScores, setHasInterviewScores] = useState(false);

  const fetchInterviewSchedule = async (applicantNumber) => {
    if (!applicantNumber) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/applicant-interview-schedule/${applicantNumber}`
      );
      console.info("Interview schedule + scores:", res.data);

      setInterviewSchedule(res.data);

      // ✅ set scores directly from API
      const qExam = res.data.qualifying_result ?? null;
      const qInterview = res.data.interview_result ?? null;
      const ex = res.data.exam_result ?? null;

      setQualifyingExamScore(qExam);
      setQualifyingInterviewScore(qInterview);
      setExamScore(ex);

      setHasInterviewScores(qExam !== null || qInterview !== null || ex !== null);
    } catch (err) {
      console.error("❌ Failed to fetch interview schedule:", err);
      setInterviewSchedule(null);
    }
  };

  const [collegeApproval, setCollegeApproval] = useState(null);

  const fetchCollegeApproval = async (applicantNumber) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/interview_applicants/${applicantNumber}`
      );
      setCollegeApproval(res.data?.status || "");
    } catch (err) {
      console.error("❌ Failed to fetch college approval:", err);
    }
  };

  const [date, setDate] = useState(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  const year = date.getFullYear();
  const month = date.getMonth();

  // Get today's date in Manila timezone (UTC+8)
  const now = new Date();
  const manilaDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  const today = manilaDate.getDate();
  const thisMonth = manilaDate.getMonth();
  const thisYear = manilaDate.getFullYear();

  // First day of the month
  const firstDay = new Date(year, month, 1).getDay();
  // Total days in the month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Build weeks array
  const weeks = [];
  let currentDay = 1 - firstDay;

  while (currentDay <= totalDays) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (currentDay > 0 && currentDay <= totalDays) {
        week.push(currentDay);
      } else {
        week.push(null);
      }
      currentDay++;
    }
    weeks.push(week);
  }

  // Handle month navigation
  const handlePrevMonth = () => {
    setDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(year, month + 1, 1));
  };


  const stepIcons = {
    0: <DescriptionIcon />,
    1: <EventIcon />,
    2: <AssignmentTurnedInIcon />,
    3: <CheckCircleIcon />,
    4: <LocalHospitalIcon />,
    5: <PersonIcon />,
  };

  const [hasStudentNumber, setHasStudentNumber] = useState(false);
  const [studentNumber, setStudentNumber] = useState(null);

  const checkStudentNumber = async (personId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student_status/${personId}`);
      if (res.data.hasStudentNumber) {
        setHasStudentNumber(true);
        setStudentNumber(res.data.student_number);
      } else {
        setHasStudentNumber(false);
      }
    } catch (err) {
      console.error("❌ Failed to check student number:", err);
    }
  };

  useEffect(() => {
    const storedID = localStorage.getItem("person_id");
    if (storedID) {
      fetchPersonData(storedID);
      fetchApplicantNumber(storedID);
      checkStudentNumber(storedID); // 👈 ADD THIS LINE
    }
  }, []);

  const getCurrentStep = () => {
    // ✅ Step 6 – Final status reached OR student number issued
    if (
      person?.final_status === "Accepted" ||
      person?.final_status === "Rejected" ||
      hasStudentNumber
    )
      return 5;

    // ✅ Step 5 – Display only (no automatic advancement)
    // — intentionally skipped in logic

    // ✅ Step 4 – College approval received
    if (collegeApproval === "Accepted" || collegeApproval === "Rejected") return 3;

    // ✅ Step 3 – Interview scheduled or scored
    if (interviewSchedule || hasInterviewScores) return 2;

    // ✅ Step 2 – Exam scheduled or scored
    if (hasSchedule || hasScores) return 1;

    // ✅ Step 1 – Documents verified
    if (person?.document_status === "Documents Verified & ECAT") return 0;

    // ✅ Default – Documents submitted (registration done but no verification yet)
    return 0;
  };


  const activeStep = getCurrentStep();

  const interview = person?.interview || null;
  const medical = person?.medical || {};


  const { active, completed, icon } = props; // <-- props are defined here
  const IconComponent = stepIcons[icon - 1]; // MUI passes `icon` as 1-based index


  const steps = [
    "Documents Submitted",
    "Admission Entrance Exam",
    "Interview /  Qualifying Exam Schedule",
    "College Approval",
    "Medical And Dental Service",
    "Applicant Status",
  ];

  const [holidays, setHolidays] = useState({});

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
        const lookup = {};
        res.data.forEach(h => {
          lookup[h.date] = h;
        });
        setHolidays(lookup);
      } catch (err) {
        console.error("❌ Failed to fetch PH holidays:", err);
        setHolidays({});
      }
    };

    fetchHolidays();
  }, [year]);  // 👈 refetch when year changes

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/announcements");
        setAnnouncements(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // In case it's not a valid date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const person_id = localStorage.getItem("person_id");
      const role = localStorage.getItem("role");

      // ✅ Get user_account_id
      const res = await axios.get(
        `http://localhost:5000/api/get_applicant_account_id/${person_id}`
      );

      const user_account_id = res.data.user_account_id;

      const formData = new FormData();

      formData.append("profile_picture", file);

      // ✅ Upload image using same backend API
      await axios.post(
        `http://localhost:5000/update_applicant/${user_account_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ Refresh profile info to display the new image
      const updated = await axios.get(
        `http://localhost:5000/api/person_data/${person_id}/${role}`
      );

      setPerson(updated.data);
      fetchPersonData(person_id, role);

      const baseUrl = `http://localhost:5000/uploads/${updated.data.profile_image}`;
      setProfileImage(`${baseUrl}?t=${Date.now()}`);

      console.log("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };






  return (
    <Box
      sx={{
        p: 4,
        marginLeft: "-2rem",
        paddingRight: 8,
        height: "calc(100vh - 150px)",
        overflowY: "auto",
      }}
    >

      <Grid container spacing={3}>
        {/* Applicant Information */}
        <Grid item xs={12}>
          <Card
            sx={{
              border: "2px solid maroon",
              boxShadow: 3,
              height: "135px",
              width: "1485px",
              marginLeft: "10px",
              p: 2,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              {/* Wrap in row: left (avatar+info) | right (date) */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                {/* Left side */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  {!person?.profile_img ? (
                    <PersonIcon sx={{ color: "maroon" }} fontSize="large" />
                  ) : (
                    <Box
                      position="relative"
                      display="inline-block"
                      mr={2}
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                    >
                      <Avatar
                        src={profileImage || `http://localhost:5000/uploads/${person?.profile_img}`}
                        alt={person?.fname}
                        sx={{
                          width: 90,
                          height: 90,
                          border: "2px solid maroon",
                          cursor: "pointer",
                          mt: -1.5,
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        {person?.fname?.[0]}
                      </Avatar>

                      {/* Hover upload button */}
                      {hovered && (
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            bgcolor: "maroon",
                            color: "white",
                            "&:hover": { bgcolor: "#6D2323" },
                          }}
                          onClick={() => fileInputRef.current.click()}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      )}

                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </Box>
                  )}

                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="maroon">
                      Welcome,&nbsp;
                      {person.last_name}, {person.first_name}{" "}
                      {person.middle_name} {person.extension}
                    </Typography>
                    <Typography variant="body1" color="black" fontSize={20}>
                      <b>Applicant ID:</b> {applicantID || "N/A"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Right side (date) */}
                <Typography
                  variant="body3"
                  color="#000000"
                  sx={{ fontWeight: 500, marginTop: "-10px" }}
                >
                  Date: {formattedDate}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>


        <Grid container spacing={2} justifyContent="left" mt={2}>
          {/* Group for Application + Upload + Notice */}
          <Grid item>
            <Grid container direction="column" spacing={2}>
              {/* Row 1 - Application + Upload */}
              <Grid item>
                <Grid container spacing={2}>
                  {/* Common size for both cards */}
                  {["Application Form", "Upload Requirements"].map((title, idx) => (
                    <Grid item key={idx}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: 3,
                          p: 2,
                          transition: "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                          width: 245, // same width
                          height: 275, // same height
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "2px solid #800000",
                          marginLeft: idx === 0 ? "35px" : 0, // only first card has left margin
                        }}
                      >
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography variant="h6" gutterBottom>
                            {title}
                          </Typography>

                          {title === "Application Form" && (
                            <button
                              style={{
                                padding: "10px 20px",
                                backgroundColor: "maroon",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                marginTop: "10px",
                              }}
                              onClick={() => {
                                if (!localStorage.getItem("dashboardKeys")) {
                                  const generateKey = () =>
                                    Math.random().toString(36).substring(2, 10);

                                  const dashboardKeys = {
                                    step1: generateKey(),
                                    step2: generateKey(),
                                    step3: generateKey(),
                                    step4: generateKey(),
                                    step5: generateKey(),
                                  };

                                  localStorage.setItem(
                                    "dashboardKeys",
                                    JSON.stringify(dashboardKeys)
                                  );
                                }
                                const keys = JSON.parse(localStorage.getItem("dashboardKeys"));
                                window.location.href = `/dashboard/${keys.step1}`;
                              }}
                            >
                              Start Application
                            </button>
                          )}

                          {title === "Upload Requirements" && (
                            <button
                              style={{
                                padding: "10px 20px",
                                backgroundColor: "maroon",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                marginTop: "10px",
                              }}
                              onClick={() => {
                                window.location.href = "/requirements_uploader";
                              }}
                            >
                              Upload Now
                            </button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>



              {/* Row 2 - Notice directly below */}
              <Grid item>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    marginLeft: "35px",
                    transition: "transform 0.2s ease",
                    boxShadow: 3,
                    "&:hover": { transform: "scale(1.03)" },

                    borderRadius: "10px",
                    backgroundColor: "#fffaf5",
                    border: "2px solid #6D2323",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    width: "510px", // same width as the two cards together
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

                      width: 50,
                      height: 50,
                      flexShrink: 0,
                    }}
                  >
                    <WarningAmberIcon sx={{ color: "white", fontSize: 35 }} />
                  </Box>

                  {/* Text */}
                  <Typography sx={{ fontSize: "15px", fontFamily: "Arial" }}>
                    <strong style={{ color: "maroon" }}>Notice:</strong>&nbsp;
                    <Typography component="span" sx={{ color: "maroon", fontWeight: "bold", }}>
                      {allRequirementsCompleted
                        ? "Your application is registered."
                        : "Please complete all required documents to register your application."}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Third Card (Announcement) */}
          <Grid item xs="auto">
            <Card
              sx={{
                borderRadius: 3,
                marginLeft: "10px",
                boxShadow: 3,
                p: 2,
                width: "490px",
                height: "375px",
                display: "flex",
                border: "2px solid #800000",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography sx={{ textAlign: "center" }} variant="h6" gutterBottom>
                  Announcements
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {announcements.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No active announcements.
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                    {announcements.map((a) => (
                      <Box
                        key={a.id}
                        sx={{
                          mb: 2,
                          p: 1,
                          width: 400,

                          borderRadius: 2,
                          border: "1px solid #ddd",
                          backgroundColor: "#fff8f6",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "maroon", fontWeight: "bold" }}
                        >
                          {a.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {a.content}
                        </Typography>

                        {a.file_path && (
                          <>
                            <img
                              src={`http://localhost:5000/uploads/${a.file_path}`}
                              alt={a.title}
                              style={{
                                width: "100%",
                                maxHeight: "120px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                marginBottom: "6px",
                                cursor: "pointer"
                              }}
                              onClick={() => setOpenImage(`http://localhost:5000/uploads/${a.file_path}`)}
                            />

                            <Dialog
                              open={Boolean(openImage)}
                              onClose={() => setOpenImage(null)}
                              fullScreen
                              PaperProps={{
                                style: {
                                  backgroundColor: "transparent", // fully transparent background
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  position: "relative",
                                  boxShadow: "none",
                                  cursor: "pointer", // indicate clickable outside
                                },
                              }}
                            >
                              {/* Clicking outside image closes dialog */}
                              <Box
                                onClick={() => setOpenImage(null)}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  zIndex: 1,
                                }}
                              />

                              {/* 🔙 Back Button on Top-Left */}
                              <IconButton
                                onClick={() => setOpenImage(null)}
                                sx={{
                                  position: "absolute",
                                  top: 20,
                                  left: 20,
                                  backgroundColor: "white",
                                  width: 70,
                                  height: 70,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  zIndex: 2, // above clickable backdrop
                                  "&:hover": { backgroundColor: "#f5f5f5" },
                                }}
                              >
                                <KeyboardBackspaceIcon sx={{ fontSize: 50, color: "black" }} />
                              </IconButton>

                              {/* Fullscreen Image */}
                              <Box
                                onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
                                sx={{
                                  position: "relative",
                                  zIndex: 2,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                }}
                              >
                                <img
                                  src={openImage}
                                  alt="Preview"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "90%",
                                    objectFit: "contain",
                                  }}
                                />
                              </Box>
                            </Dialog>


                          </>
                        )}


                        <Typography variant="caption" color="text.secondary">
                          Expires: {new Date(a.expires_at).toLocaleDateString("en-US")}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

          </Grid>

          <Grid item xs="auto">
            <Card
              sx={{
                border: "2px solid maroon",
                marginLeft: "10px",
                boxShadow: 3,
                p: 2,
                width: "425px",
                height: "375px",
                transition: "transform 0.2s ease",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.03)" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ p: 0, width: "100%" }}>
                {/* Header with month + year + arrows */}
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor: "maroon",
                    color: "white",
                    borderRadius: "6px 6px 0 0",
                    padding: "4px 8px",
                  }}
                >
                  <Grid item>
                    <IconButton size="small" onClick={handlePrevMonth} sx={{ color: "white" }}>
                      <ArrowBackIos fontSize="small" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {date.toLocaleString("default", { month: "long" })} {year}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton size="small" onClick={handleNextMonth} sx={{ color: "white" }}>
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>

                {/* Days of Week */}
                <Divider />
                <Grid container spacing={0.5} sx={{ mt: 1 }}>
                  {days.map((day, idx) => (
                    <Grid item xs key={idx}>
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Dates */}
                {weeks.map((week, i) => (
                  <Grid container spacing={0.5} key={i}>
                    {week.map((day, j) => {
                      if (!day) {
                        return <Grid item xs key={j}></Grid>;
                      }

                      const isToday = day === today && month === thisMonth && year === thisYear;
                      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isHoliday = holidays[dateKey];

                      return (
                        <Grid item xs key={j}>
                          <Typography
                            variant="body2"
                            align="center"
                            sx={{
                              color: isToday ? "white" : "black",
                              backgroundColor: isToday
                                ? "maroon"
                                : isHoliday
                                  ? "#E8C999"
                                  : "transparent",
                              borderRadius: "50%",
                              width: 45,
                              height: 38,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: isHoliday ? "bold" : "500",
                              margin: "0 auto",
                            }}
                            title={isHoliday ? isHoliday.localName : ""}
                          >
                            {day}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>

        </Grid>



        <Box sx={{ width: "100%", mt: 2 }}>
          {/* Title */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,

            }}
          >
            <Typography sx={{ fontSize: "32px", fontWeight: "bold", color: "maroon" }}>
              APPLICATION STATUS
            </Typography>
          </Box>

          <Stepper
            alternativeLabel
            activeStep={activeStep}
            sx={{
              "& .MuiStepConnector-root": {
                top: "30px", // 👈 moves line down, middle of circles
                left: "calc(-50% + 30px)",
                right: "calc(50% + 30px)",
              },
              "& .MuiStepConnector-line": {
                borderColor: "#6D2323",   // maroon line
                borderTopWidth: 3,
                borderRadius: 8,

              },
            }}
          >
            {steps.map((label, index) => (
              <Step key={index} completed={index <= activeStep}>
                <StepLabel
                  StepIconComponent={(stepProps) => {
                    const icons = [
                      <DescriptionIcon />,
                      <EventIcon />,
                      <AssignmentTurnedInIcon />,
                      <CheckCircleIcon />,
                      <LocalHospitalIcon />,
                      <PersonIcon />,
                    ];

                    const isActive = stepProps.active;
                    const isCompleted = stepProps.completed;

                    return (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          backgroundColor: isActive ? "#800000" : isCompleted ? "#800000" : "#E8C999",

                          border: "2px solid #6D2323",
                          display: "flex",

                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                        }}
                      >
                        {React.cloneElement(icons[index], {
                          sx: { color: isActive || isCompleted ? "white" : "#6D2323", fontSize: 30 },
                        })}
                      </Box>
                    );
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#6D2323",
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>


          {/* Containers below each step */}
          <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
            {steps.map((label, index) => (
              <Grid
                item
                xs={2} // each step gets equal space (12/6 = 2)
                key={index}

                sx={{ display: "flex", justifyContent: "center", }}
              >
                <Box
                  sx={{
                    height: 360,
                    width: "100%",        // let it stretch with grid
                    maxWidth: 205,        // same size as before
                    border: "2px solid maroon",
                    borderRadius: 2,
                    p: 2,
                    overflowY: "auto",
                    fontSize: "13px",
                    transition: "transform 0.2s ease",
                    boxShadow: 3,
                    "&:hover": { transform: "scale(1.03)" },
                    color: "maroon",
                    fontWeight: "bold",
                    lineHeight: 1.6,
                  }}
                >
                  {/* Step 1: Document Submitted */}
                  {index === 0 && (
                    <>
                      {person?.document_status === "Documents Verified & ECAT" ? (
                        <div>
                          ✅ Your submitted documents have been successfully verified.
                          <br />
                          <Divider
                            sx={{
                              backgroundColor: "gray",
                              height: "0.5px",
                              my: 2,
                              borderRadius: 1,
                            }}
                          />

                          <strong>Next Step:</strong>
                          <br />
                          Go to <strong>Applicant Form</strong> → <strong>Examination Permit</strong>
                          <br />
                          and <strong>print your permit</strong>.
                        </div>
                      ) : (
                        "⏳ Status: Pending"
                      )}
                    </>
                  )}


                  {/* Step 2: Entrance Exam */}
                  {index === 1 && (
                    <>
                      {!hasSchedule && !hasScores && "⏳ Status: Pending"}

                      {hasSchedule && (
                        <>
                          📅 Date: {formatDate(proctor?.day_description)} <br />
                          🏢 Building: {proctor?.building_description || "TBA"} <br />
                          🚪 Room: {proctor?.room_description || "TBA"} <br />
                          ⏰ Time: {formatTime(proctor?.start_time)} – {formatTime(proctor?.end_time)}
                        </>
                      )}
                      <br />
                      <Divider
                        sx={{
                          backgroundColor: "gray",
                          height: "0.5px",
                          my: 2,
                          borderRadius: 1,
                        }}
                      />

                      {hasScores && (
                        <>
                          📖 English: {examScores.english} <br />
                          🔬 Science: {examScores.science} <br />
                          🇵🇭 Filipino: {examScores.filipino} <br />
                          ➗ Math: {examScores.math} <br />
                          🧩 Abstract: {examScores.abstract} <br />
                          🏆 Final Rating: {examScores.final}
                        </>
                      )}
                    </>
                  )}

                  {/* Step 3: Interview */}
                  {index === 2 && (
                    <>
                      {!interviewSchedule && !hasInterviewScores && "⏳ Status: Pending"}

                      {interviewSchedule && (
                        <>
                          👤 Interviewer: {interviewSchedule.interviewer || "TBA"} <br />
                          📅 Date: {formatDate(interviewSchedule?.day_description)} <br />
                          🏫 Building: {interviewSchedule.building_description || "TBA"} <br />
                          🏷️ Room: {interviewSchedule.room_description || "TBA"} <br />
                          ⏰ Time: {formatTime(interviewSchedule.start_time)} – {formatTime(interviewSchedule.end_time)}
                        </>
                      )}
                      <br />
                      <Divider
                        sx={{
                          backgroundColor: "gray",
                          height: "0.5px",
                          my: 2,
                          borderRadius: 1,
                        }}
                      />

                      {hasInterviewScores && (
                        <>
                          🗣 Interview Score: {qualifyingInterviewScore ?? "N/A"} <br />
                          📝 Qualifying Exam Score: {qualifyingExamScore ?? "N/A"} <br />
                          📊 Exam Result: {examScore ?? "N/A"} <br />
                          📈 Total Average: {(
                            (Number(qualifyingExamScore ?? 0) +
                              Number(qualifyingInterviewScore ?? 0) +
                              Number(examScore ?? 0)) / 3
                          ).toFixed(2)}
                        </>
                      )}
                    </>
                  )}



                  {/* Step 4: College Approval */}
                  {index === 3 && (
                    <>
                      {collegeApproval === "Accepted"
                        ? "✅ Approved by College"
                        : collegeApproval === "Rejected"
                          ? "❌ Rejected by College"
                          : "⏳ Waiting for College Decision"}
                    </>
                  )}



                  {/* Step 5: Medical Submitted */}
                  {index === 4 && (
                    <>
                      ⏳ Apply For Medical Processing
                    </>
                  )}



                  {/* Step 6: Applicant Status */}
                  {index === 5 && (
                    <>
                      {person?.final_status === "Rejected" ? (
                        "❌ Unfortunately, you were not accepted."
                      ) : hasStudentNumber ? (
                        <>
                          🎉 <strong>Congratulations!</strong> You are now accepted at{" "}
                          <strong>
                            {shortTerm
                              ? `${shortTerm.toUpperCase()} - ${companyName || ""}`
                              : companyName || ""}
                          </strong>.

                          <div style={{ marginTop: "6px", lineHeight: "1.6" }}>
                            1. Proceed to your <strong>College</strong> for your Subjects tagging <br />
                            2. Get your <strong>Class Schedule</strong> from your department. <br />
                            {studentNumber && (
                              <span
                                style={{
                                  display: "block",
                                  fontWeight: "bold",
                                  marginTop: "5px",
                                }}
                              >
                                Your Student Number: {studentNumber}
                              </span>
                            )}
                          </div>
                        </>
                      ) : person?.final_status === "Accepted" ? (
                        "✅ You have been accepted. Please wait while your student number is being processed."
                      ) : (
                        "⏳ Application in Progress"
                      )}
                    </>
                  )}

                </Box>
              </Grid>
            ))}
          </Grid>

        </Box>





      </Grid>
    </Box>
  );
};

export default ApplicantDashboard;

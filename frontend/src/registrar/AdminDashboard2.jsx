import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Box, TextField, Container, Card, Modal, TableContainer, Paper, Table, TableHead, TableRow, TableCell, Typography, FormControl, FormHelperText, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PeopleIcon from "@mui/icons-material/People";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

import ExamPermit from "../applicant/ExamPermit";

const AdminDashboard2 = () => {
  const stepsData = [
    { label: "Admission Process for Registrar", to: "/applicant_list_admin", icon: <SchoolIcon fontSize="large" /> },
    { label: "Applicant Form", to: "/admin_dashboard1", icon: <DashboardIcon fontSize="large" /> },
    { label: "Student Requirements", to: "/student_requirements", icon: <AssignmentIcon fontSize="large" /> },
    { label: "Entrance Exam Room Assignment", to: "/assign_entrance_exam", icon: <MeetingRoomIcon fontSize="large" /> },
    { label: "Entrance Exam Schedule Management", to: "/assign_schedule_applicant", icon: <ScheduleIcon fontSize="large" /> },
    { label: "Examination Profile", to: "/registrar_examination_profile", icon: <PersonSearchIcon fontSize="large" /> },
    { label: "Proctor's Applicant List", to: "/proctor_applicant_list", icon: <PeopleIcon fontSize="large" /> },
    { label: "Entrance Examination Scores", to: "/applicant_scoring", icon: <FactCheckIcon fontSize="large" /> },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState(Array(stepsData.length).fill(false));

  const fetchByPersonId = async (personID) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${personID}`);
      setPerson(res.data);
      setSelectedPerson(res.data);
      if (res.data?.applicant_number) {
      }
    } catch (err) {
      console.error("❌ person_with_applicant failed:", err);
    }
  };

  const handleNavigateStep = (index, to) => {
    setCurrentStep(index);

    const pid = sessionStorage.getItem("admin_edit_person_id");
    if (pid) {
      navigate(`${to}?person_id=${pid}`);
    } else {
      navigate(to);
    }
  };

  const navigate = useNavigate();
  const [explicitSelection, setExplicitSelection] = useState(false);

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [person, setPerson] = useState({
    solo_parent: "", father_deceased: "", father_family_name: "", father_given_name: "", father_middle_name: "",
    father_ext: "", father_nickname: "", father_education: "", father_education_level: "", father_last_school: "", father_course: "", father_year_graduated: "", father_school_address: "", father_contact: "", father_occupation: "", father_employer: "",
    father_income: "", father_email: "", mother_deceased: "", mother_family_name: "", mother_given_name: "", mother_middle_name: "", mother_ext: "", mother_nickname: "", mother_education: "", mother_education_level: "", mother_last_school: "", mother_course: "",
    mother_year_graduated: "", mother_school_address: "", mother_contact: "", mother_occupation: "", mother_employer: "", mother_income: "", mother_email: "", guardian: "", guardian_family_name: "", guardian_given_name: "",
    guardian_middle_name: "", guardian_ext: "", guardian_nickname: "", guardian_address: "", guardian_contact: "", guardian_email: "", annual_income: "",
  });
  const [selectedPerson, setSelectedPerson] = useState(null);

  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageId = 2;

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

  // do not alter
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryPersonId = queryParams.get("person_id");

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
      fetchPersonData(targetId);
      return;
    }

    window.location.href = "/login";
  }, [queryPersonId]);

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





  const steps = person.person_id
    ? [
      { label: "Personal Information", icon: <PersonIcon />, path: `/admin_dashboard1?person_id=${userID}` },
      { label: "Family Background", icon: <FamilyRestroomIcon />, path: `/admin_dashboard2?person_id=${userID}` },
      { label: "Educational Attainment", icon: <SchoolIcon />, path: `/admin_dashboard3?person_id=${userID}` },
      { label: "Health Medical Records", icon: <HealthAndSafetyIcon />, path: `/admin_dashboard4?person_id=${userID}` },
      { label: "Other Information", icon: <InfoIcon />, path: `/admin_dashboard5?person_id=${userID}` },
    ]
    : [];




  const [activeStep, setActiveStep] = useState(1);

  const fetchPersonData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/person/${id}`);

      // Sanitize null values and set state
      const safePerson = Object.fromEntries(
        Object.entries(res.data).map(([key, val]) => [key, val ?? ""])
      );

      setPerson(safePerson);

      // ✅ Set dropdown based on existing deceased values
      if (res.data.solo_parent === 1) {
        if (res.data.father_deceased === 1) {
          setSoloParentChoice("Mother");
        } else if (res.data.mother_deceased === 1) {
          setSoloParentChoice("Father");
        }
      }
    } catch (error) {
      console.error("Failed to fetch person data:", error);
    }
  };


  const [isFatherDeceased, setIsFatherDeceased] = useState(false);
  const [isMotherDeceased, setIsMotherDeceased] = useState(false);

  useEffect(() => {
    setIsFatherDeceased(person.father_deceased === 1);
  }, [person.father_deceased]);

  useEffect(() => {
    setIsMotherDeceased(person.mother_deceased === 1);
  }, [person.mother_deceased]);



  // No need for local states like isFatherDeceased, etc. if you're using person state directly
  useEffect(() => {
    if (person.parent_type === "Mother") {
      setPerson((prev) => ({
        ...prev,
        father_deceased: 1,
        mother_deceased: 0,
      }));
    } else if (person.parent_type === "Father") {
      setPerson((prev) => ({
        ...prev,
        mother_deceased: 1,
        father_deceased: 0,
      }));
    }
  }, [person.parent_type]);



  const [errors, setErrors] = useState({});

  const isFormValid = () => {
    const requiredFields = [];

    // If father is NOT deceased, require father fields:
    if (person.father_deceased !== 1) {
      requiredFields.push(
        "father_family_name", "father_given_name", "father_middle_name", "father_nickname",
        "father_contact", "father_occupation", "father_employer", "father_income", "father_email"
      );

      // but only require education details if father_education !== 1
      if (person.father_education !== 1) {
        requiredFields.push(
          "father_education_level", "father_last_school", "father_course", "father_year_graduated", "father_school_address"
        );
      }
    }

    // If mother is NOT deceased, require mother fields:
    if (person.mother_deceased !== 1) {
      requiredFields.push(
        "mother_family_name", "mother_given_name", "mother_middle_name", "mother_nickname",
        "mother_contact", "mother_occupation", "mother_employer", "mother_income", "mother_email"
      );

      // only require education details if mother_education !== 1
      if (person.mother_education !== 1) {
        requiredFields.push(
          "mother_education_level", "mother_last_school", "mother_course", "mother_year_graduated", "mother_school_address"
        );
      }
    }

    // Guardian fields always required:
    requiredFields.push(
      "guardian", "guardian_family_name", "guardian_given_name", "guardian_middle_name",
      "guardian_nickname", "guardian_address", "guardian_contact"
    );

    // Annual income always required:
    requiredFields.push("annual_income");

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

   const handleUpdate = async (updatedData) => {
         if (!person) return;
 
         try {
             // ✅ Get correct applicant ID
             const targetId = selectedPerson?.person_id || queryPersonId || person.person_id;
             if (!targetId) {
                 console.warn("⚠️ No valid applicant ID found — skipping update.");
                 return;
             }
 
             const allowedFields = [
                 "person_id", "profile_img", "campus", "academicProgram", "classifiedAs", "applyingAs",
                 "program", "program2", "program3", "yearLevel",
                 "last_name", "first_name", "middle_name", "extension", "nickname",
                 "height", "weight", "lrnNumber", "nolrnNumber", "gender",
                 "pwdMember", "pwdType", "pwdId",
                 "birthOfDate", "age", "birthPlace", "languageDialectSpoken",
                 "citizenship", "religion", "civilStatus", "tribeEthnicGroup",
                 "cellphoneNumber", "emailAddress",
                 "presentStreet", "presentBarangay", "presentZipCode", "presentRegion",
                 "presentProvince", "presentMunicipality", "presentDswdHouseholdNumber",
                 "sameAsPresentAddress",
                 "permanentStreet", "permanentBarangay", "permanentZipCode",
                 "permanentRegion", "permanentProvince", "permanentMunicipality",
                 "permanentDswdHouseholdNumber",
                 "solo_parent",
                 "father_deceased", "father_family_name", "father_given_name", "father_middle_name",
                 "father_ext", "father_nickname", "father_education", "father_education_level",
                 "father_last_school", "father_course", "father_year_graduated", "father_school_address",
                 "father_contact", "father_occupation", "father_employer", "father_income", "father_email",
                 "mother_deceased", "mother_family_name", "mother_given_name", "mother_middle_name",
                 "mother_ext", "mother_nickname", "mother_education", "mother_education_level",
                 "mother_last_school", "mother_course", "mother_year_graduated", "mother_school_address",
                 "mother_contact", "mother_occupation", "mother_employer", "mother_income", "mother_email",
                 "guardian", "guardian_family_name", "guardian_given_name", "guardian_middle_name",
                 "guardian_ext", "guardian_nickname", "guardian_address", "guardian_contact", "guardian_email",
                 "annual_income",
                 "schoolLevel", "schoolLastAttended", "schoolAddress", "courseProgram",
                 "honor", "generalAverage", "yearGraduated",
                 "schoolLevel1", "schoolLastAttended1", "schoolAddress1", "courseProgram1",
                 "honor1", "generalAverage1", "yearGraduated1",
                 "strand",
                 // 🩺 Health and medical
                 "cough", "colds", "fever", "asthma", "faintingSpells", "heartDisease",
                 "tuberculosis", "frequentHeadaches", "hernia", "chronicCough", "headNeckInjury",
                 "hiv", "highBloodPressure", "diabetesMellitus", "allergies", "cancer",
                 "smokingCigarette", "alcoholDrinking", "hospitalized", "hospitalizationDetails",
                 "medications",
                 // 🧬 Covid / Vaccination
                 "hadCovid", "covidDate",
                 "vaccine1Brand", "vaccine1Date", "vaccine2Brand", "vaccine2Date",
                 "booster1Brand", "booster1Date", "booster2Brand", "booster2Date",
                 // 🧪 Lab results / medical findings
                 "chestXray", "cbc", "urinalysis", "otherworkups",
                 // 🧍 Additional fields
                 "symptomsToday", "remarks",
                 // ✅ Agreement / Meta
                 "termsOfAgreement", "created_at", "current_step"
             ];
             // ✅ Clean the payload
             const cleanedData = Object.fromEntries(
                 Object.entries(updatedData).filter(([key]) => allowedFields.includes(key))
             );
 
             if (Object.keys(cleanedData).length === 0) {
                 console.warn("⚠️ No valid fields to update — skipping request.");
                 return;
             }
 
             // ✅ Send update request
             await axios.put(`http://localhost:5000/api/person/${targetId}`, cleanedData);
 
             console.log(`✅ SuperAdmin updated person_id: ${targetId} successfully.`);
         } catch (error) {
             console.error("❌ SuperAdmin update failed:", {
                 message: error.message,
                 status: error.response?.status,
                 details: error.response?.data || error,
             });
         }
     };
 
     // Real-time save on every character typed
     const handleChange = (e) => {
         const { name, type, checked, value } = e.target;
 
         const updatedPerson = {
             ...person,
             [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
         };
 
         // If updating either mother_income or father_income, calculate total and set annual_income
         if (name === "mother_income" || name === "father_income") {
             const motherIncome = parseFloat(name === "mother_income" ? value : updatedPerson.mother_income) || 0;
             const fatherIncome = parseFloat(name === "father_income" ? value : updatedPerson.father_income) || 0;
             const totalIncome = motherIncome + fatherIncome;
 
             let annualIncomeBracket = "";
             if (totalIncome <= 80000) {
                 annualIncomeBracket = "80,000 and below";
             } else if (totalIncome <= 135000) {
                 annualIncomeBracket = "80,000 to 135,000";
             } else if (totalIncome <= 250000) {
                 annualIncomeBracket = "135,000 to 250,000";
             } else if (totalIncome <= 500000) {
                 annualIncomeBracket = "250,000 to 500,000";
             } else if (totalIncome <= 1000000) {
                 annualIncomeBracket = "500,000 to 1,000,000";
             } else {
                 annualIncomeBracket = "1,000,000 and above";
             }
 
             updatedPerson.annual_income = annualIncomeBracket;
         }
 
         setPerson(updatedPerson);
         handleUpdate(updatedPerson); // No delay, real-time save
     };
 
 
     // ✅ Safe handleBlur for SuperAdmin — updates correct applicant only
     const handleBlur = async () => {
         try {
             // ✅ Determine correct applicant/person_id
             const targetId = selectedPerson?.person_id || queryPersonId || person.person_id;
             if (!targetId) {
                 console.warn("⚠️ No valid applicant ID found — skipping update.");
                 return;
             }
 
             const allowedFields = [
                 "person_id", "profile_img", "campus", "academicProgram", "classifiedAs", "applyingAs",
                 "program", "program2", "program3", "yearLevel",
                 "last_name", "first_name", "middle_name", "extension", "nickname",
                 "height", "weight", "lrnNumber", "nolrnNumber", "gender",
                 "pwdMember", "pwdType", "pwdId",
                 "birthOfDate", "age", "birthPlace", "languageDialectSpoken",
                 "citizenship", "religion", "civilStatus", "tribeEthnicGroup",
                 "cellphoneNumber", "emailAddress",
                 "presentStreet", "presentBarangay", "presentZipCode", "presentRegion",
                 "presentProvince", "presentMunicipality", "presentDswdHouseholdNumber",
                 "sameAsPresentAddress",
                 "permanentStreet", "permanentBarangay", "permanentZipCode",
                 "permanentRegion", "permanentProvince", "permanentMunicipality",
                 "permanentDswdHouseholdNumber",
                 "solo_parent",
                 "father_deceased", "father_family_name", "father_given_name", "father_middle_name",
                 "father_ext", "father_nickname", "father_education", "father_education_level",
                 "father_last_school", "father_course", "father_year_graduated", "father_school_address",
                 "father_contact", "father_occupation", "father_employer", "father_income", "father_email",
                 "mother_deceased", "mother_family_name", "mother_given_name", "mother_middle_name",
                 "mother_ext", "mother_nickname", "mother_education", "mother_education_level",
                 "mother_last_school", "mother_course", "mother_year_graduated", "mother_school_address",
                 "mother_contact", "mother_occupation", "mother_employer", "mother_income", "mother_email",
                 "guardian", "guardian_family_name", "guardian_given_name", "guardian_middle_name",
                 "guardian_ext", "guardian_nickname", "guardian_address", "guardian_contact", "guardian_email",
                 "annual_income",
                 "schoolLevel", "schoolLastAttended", "schoolAddress", "courseProgram",
                 "honor", "generalAverage", "yearGraduated",
                 "schoolLevel1", "schoolLastAttended1", "schoolAddress1", "courseProgram1",
                 "honor1", "generalAverage1", "yearGraduated1",
                 "strand",
                 // 🩺 Health and medical
                 "cough", "colds", "fever", "asthma", "faintingSpells", "heartDisease",
                 "tuberculosis", "frequentHeadaches", "hernia", "chronicCough", "headNeckInjury",
                 "hiv", "highBloodPressure", "diabetesMellitus", "allergies", "cancer",
                 "smokingCigarette", "alcoholDrinking", "hospitalized", "hospitalizationDetails",
                 "medications",
                 // 🧬 Covid / Vaccination
                 "hadCovid", "covidDate",
                 "vaccine1Brand", "vaccine1Date", "vaccine2Brand", "vaccine2Date",
                 "booster1Brand", "booster1Date", "booster2Brand", "booster2Date",
                 // 🧪 Lab results / medical findings
                 "chestXray", "cbc", "urinalysis", "otherworkups",
                 // 🧍 Additional fields
                 "symptomsToday", "remarks",
                 // ✅ Agreement / Meta
                 "termsOfAgreement", "created_at", "current_step"
             ];
 
             // ✅ Clean payload before sending
             const cleanedData = Object.fromEntries(
                 Object.entries(person).filter(([key]) => allowedFields.includes(key))
             );
 
             if (Object.keys(cleanedData).length === 0) {
                 console.warn("⚠️ No valid fields to update — skipping blur save.");
                 return;
             }
 
             // ✅ Execute safe update
             await axios.put(`http://localhost:5000/api/person/${targetId}`, cleanedData);
             console.log(`💾 Auto-saved (on blur) for person_id: ${targetId}`);
         } catch (err) {
             console.error("❌ Auto-save (on blur) failed:", {
                 message: err.message,
                 status: err.response?.status,
                 details: err.response?.data || err,
             });
         }
     };
 
 

  const [soloParentChoice, setSoloParentChoice] = useState("");
  const [clickedSteps, setClickedSteps] = useState(Array(steps.length).fill(false));

  const handleStepClick = (index) => {
    setActiveStep(index);
    const newClickedSteps = [...clickedSteps];
    newClickedSteps[index] = true;
    setClickedSteps(newClickedSteps);
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

  const handleExamPermitClick = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/verified-exam-applicants");
      const verified = res.data.some(a => a.person_id === parseInt(userID));

      if (!verified) {
        setExamPermitError("❌ You cannot print the Exam Permit until all required documents are verified.");
        setExamPermitModalOpen(true);
        return;
      }

      // ✅ Render permit and print
      setShowPrintView(true);
      setTimeout(() => {
        printDiv();
        setShowPrintView(false);
      }, 500);
    } catch (err) {
      console.error("Error verifying exam permit eligibility:", err);
      setExamPermitError("⚠️ Unable to check document verification status right now.");
      setExamPermitModalOpen(true);
    }
  };


  const links = [
    { to: `/admin_ecat_application_form`, label: "ECAT Application Form" },
    { to: `/admission_form_process`, label: "Admission Form Process" },
    { to: `/admin_personal_data_form`, label: "Personal Data Form" },
    { to: `/admin_office_of_the_registrar`, label: "Application For EARIST College Admission" },
    { to: `/admission_services`, label: "Application/Student Satisfactory Survey" },
    { label: "Examination Permit", onClick: handleExamPermitClick }, // ✅
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
          ADMISSION SHIFTING FORM - FAMILY BACKGROUND
        </Typography>
      </Box>
      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          mt: 2,
        }}
      >
        {stepsData.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Card */}
            <Card
              onClick={() => handleNavigateStep(index, step.to)}
              sx={{
                flex: 1,
                maxWidth: `${100 / stepsData.length}%`, // evenly fit 100%
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 2,
                border: "2px solid #6D2323",

                backgroundColor: currentStep === index ? "#6D2323" : "#E8C999",
                color: currentStep === index ? "#fff" : "#000",
                boxShadow:
                  currentStep === index
                    ? "0px 4px 10px rgba(0,0,0,0.3)"
                    : "0px 2px 6px rgba(0,0,0,0.15)",
                transition: "0.3s ease",
                "&:hover": {
                  backgroundColor: currentStep === index ? "#5a1c1c" : "#f5d98f",
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
                <Box sx={{ fontSize: 32, mb: 0.5 }}>{step.icon}</Box>
                <Typography
                  sx={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}
                >
                  {step.label}
                </Typography>
              </Box>
            </Card>

            {/* Spacer instead of line */}
            {index < stepsData.length - 1 && (
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

      <br />



      <TableContainer component={Paper} sx={{ width: '100%', mb: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#6D2323' }}>
            <TableRow>
              {/* Left cell: Applicant ID */}
              <TableCell sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}>
                Applicant ID:&nbsp;
                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                  {person?.applicant_number || "N/A"}

                </span>
              </TableCell>

              {/* Right cell: Applicant Name */}
              <TableCell
                align="right"
                sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}
              >
                Applicant Name:&nbsp;
                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                  {person?.last_name?.toUpperCase()}, {person?.first_name?.toUpperCase()}{" "}
                  {person?.middle_name?.toUpperCase()} {person?.extension?.toUpperCase() || ""}
                </span>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>


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

        {person.person_id && (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", px: 4 }}>
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                {/* Wrap the step with Link for routing */}
                <Link to={step.path} style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => handleStepClick(index)}
                  >
                    {/* Step Icon */}
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

                    {/* Step Label */}
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

                {/* Connector Line */}
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
        )}

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
              <Typography style={{ fontSize: "20px", padding: "10px", fontFamily: "Arial Black" }}>Step 2: Family Background</Typography>
            </Box>
          </Container>


          <Container maxWidth="100%" sx={{ backgroundColor: "#f1f1f1", border: "2px solid black", padding: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Family Background:</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />




            <Box display="flex" gap={3} width="100%" alignItems="center">
              {/* Solo Parent Checkbox */}
              <Box marginTop="10px" display="flex" alignItems="center" gap={1}>
                <Checkbox
                  disabled
                  name="solo_parent"
                  checked={person.solo_parent === 1}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    const newPerson = {
                      ...person,
                      solo_parent: checked ? 1 : 0,
                      father_deceased: checked && soloParentChoice === "Mother" ? 1 : checked ? 0 : null,
                      mother_deceased: checked && soloParentChoice === "Father" ? 1 : checked ? 0 : null,
                    };

                    setPerson(newPerson);
                    handleUpdate(newPerson); // Save immediately
                  }}
                  onBlur={handleBlur}
                  sx={{ width: 25, height: 25 }}
                />
                <label style={{ fontFamily: "Arial" }}>Solo Parent</label>
              </Box>

              {/* Parent Type Dropdown */}
              {person.solo_parent === 1 && (
                <FormControl size="small" style={{ width: "200px" }}>
                  <InputLabel id="parent-select-label">- Parent- </InputLabel>
                  <Select
                    labelId="parent-select-label"
                    value={soloParentChoice}
                    onChange={(e) => {
                      const choice = e.target.value;
                      setSoloParentChoice(choice);

                      const updatedPerson = {
                        ...person,
                        father_deceased: choice === "Mother" ? 1 : 0,
                        mother_deceased: choice === "Father" ? 1 : 0,
                      };

                      setPerson(updatedPerson);
                      handleUpdate(updatedPerson);
                    }}
                  >
                    <MenuItem value="Father">Father</MenuItem>
                    <MenuItem value="Mother">Mother</MenuItem>
                  </Select>
                </FormControl>
              )}


            </Box>

            <br />



            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Father's Details</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ mb: 2 }}>
              {/* Father Deceased Checkbox */}
              {/* Father Deceased Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    disabled
                    name="father_deceased"
                    checked={person.father_deceased === 1}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      // Call your form handler
                      handleChange(e);

                      // Update local state
                      setPerson((prev) => ({
                        ...prev,
                        father_deceased: checked ? 1 : 0,
                      }));
                    }}
                    onBlur={handleBlur}
                  />
                }
                label="Father Deceased"
              />
              <br />


              {/* Show Father's Info ONLY if not deceased */}
              {!isFatherDeceased && (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Family Name</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        placeholder="Enter Father Last Name"
                        name="father_family_name"
                        value={person.father_family_name ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_family_name} helperText={errors.father_family_name ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Given Name</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_given_name"
                        placeholder="Enter Father First Name"
                        value={person.father_given_name ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_given_name} helperText={errors.father_given_name ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Middle Name</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_middle_name"
                        placeholder="Enter Father Middle Name"
                        value={person.father_middle_name ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_middle_name} helperText={errors.father_middle_name ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Extension</Typography>
                      <FormControl fullWidth size="small" required error={!!errors.father_ext}>
                        <InputLabel id="father-ext-label">Extension</InputLabel>
                        <Select
                          readOnly
                          labelId="father-ext-label"
                          id="father_ext"
                          name="father_ext"
                          value={person.father_ext || ""}
                          label="Extension"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <MenuItem value=""><em>Select Extension</em></MenuItem>
                          <MenuItem value="Jr.">Jr.</MenuItem>
                          <MenuItem value="Sr.">Sr.</MenuItem>
                          <MenuItem value="I">I</MenuItem>
                          <MenuItem value="II">II</MenuItem>
                          <MenuItem value="III">III</MenuItem>
                          <MenuItem value="IV">IV</MenuItem>
                          <MenuItem value="V">V</MenuItem>
                        </Select>
                        {errors.father_ext && (
                          <FormHelperText>This field is required.</FormHelperText>
                        )}
                      </FormControl>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Father Nickname</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_nickname"
                        placeholder="Enter Father Nickname"
                        value={person.father_nickname ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_nickname} helperText={errors.father_nickname ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Father's Educational Background
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />
                  <Box display="flex" gap={3} alignItems="center">
                    {/* Father's Education Not Applicable Checkbox */}
                    <Checkbox
                      disabled
                      name="father_education"
                      checked={person.father_education === 1}
                      onChange={(e) => {
                        const isChecked = e.target.checked;

                        const updatedPerson = {
                          ...person,
                          father_education: isChecked ? 1 : 0,
                          ...(isChecked
                            ? {
                              father_education_level: "",
                              father_last_school: "",
                              father_course: "",
                              father_year_graduated: "",
                              father_school_address: "",
                            }
                            : {}),
                        };

                        setPerson(updatedPerson);
                        handleUpdate(updatedPerson); // Immediate update (optional)
                      }}
                      onBlur={handleBlur}
                      sx={{ width: 25, height: 25 }}
                    />
                    <label style={{ fontFamily: "Arial" }}>Father's education not applicable</label>
                  </Box>




                  {/* Father Educational Details (conditionally rendered) */}
                  {person.father_education !== 1 && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Education Level</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          placeholder="Enter Father Education Level"
                          name="father_education_level"
                          value={person.father_education_level ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_education_level}
                          helperText={errors.father_education_level ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Last School</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="father_last_school"
                          placeholder="Enter Father Last School"
                          value={person.father_last_school ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_last_school}
                          helperText={errors.father_last_school ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Course</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="father_course"
                          placeholder="Enter Father Course"
                          value={person.father_course ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_course}
                          helperText={errors.father_course ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father Year Graduated</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="father_year_graduated"
                          placeholder="Enter Father Year Graduated"
                          value={person.father_year_graduated ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_year_graduated}
                          helperText={errors.father_year_graduated ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Father School Address</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="father_school_address"
                          placeholder="Enter Father School Address"
                          value={person.father_school_address ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.father_school_address}
                          helperText={errors.father_school_address ? "This field is required." : ""}
                        />
                      </Box>
                    </Box>
                  )}


                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Father's Contact Information
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Contact</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_contact"
                        placeholder="Enter Father Contact"
                        value={person.father_contact ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_contact} helperText={errors.father_contact ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Occupation</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_occupation"
                        value={person.father_occupation ?? ""}
                        placeholder="Enter Father Occupation"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_occupation} helperText={errors.father_occupation ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Employer</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_employer"
                        placeholder="Enter Father Employer"
                        value={person.father_employer ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_employer} helperText={errors.father_employer ? "This field is required." : ""}
                      />
                    </Box>
                    {/* Father Income */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Father Income</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="father_income"
                        placeholder="Enter Father Income"
                        value={person.father_income ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.father_income}
                        helperText={errors.father_income ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" mb={1}>Father Email Address</Typography>
                    <TextField
                      InputProps={{ readOnly: true }}

                      fullWidth
                      size="small"
                      required
                      name="father_email"
                      placeholder="Enter your Father Email Address (e.g., username@gmail.com)"
                      value={person.father_email ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}

                    />
                  </Box>
                </>
              )}
            </Box>


            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Mother's Details</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />
            <Box sx={{ mb: 2 }}>
              {/* Mother Deceased Checkbox */}

              <FormControlLabel
                control={
                  <Checkbox
                    disabled
                    name="mother_deceased"
                    checked={person.mother_deceased === 1}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      // Call your form handler
                      handleChange(e);

                      // Update local state
                      setPerson((prev) => ({
                        ...prev,
                        mother_deceased: checked ? 1 : 0,
                      }));
                    }}
                    onBlur={handleBlur}
                  />
                }
                label="Mother Deceased"
              />
              <br />


              {/* Show Mother's Info ONLY if not deceased */}
              {!isMotherDeceased && (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Family Name</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_family_name"
                        placeholder="Enter your Mother Last Name"
                        value={person.mother_family_name ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_family_name}
                        helperText={errors.mother_family_name ? "This field is required." : ""}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother First Name</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_given_name"
                        placeholder="Enter your Mother First Name"
                        value={person.mother_given_name ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_given_name}
                        helperText={errors.mother_given_name ? "This field is required." : ""}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Middle Name</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_middle_name"
                        placeholder="Enter your Mother Middle Name"
                        value={person.mother_middle_name ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_middle_name}
                        helperText={errors.mother_middle_name ? "This field is required." : ""}
                      />
                    </Box>

                    {/* Mother Extension */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Extension</Typography>
                      <FormControl fullWidth size="small" >
                        <InputLabel id="mother-ext-label">Extension</InputLabel>
                        <Select
                          readOnly
                          labelId="mother-ext-label"
                          id="mother_ext"
                          name="mother_ext"
                          value={person.mother_ext || ""}
                          label="Extension"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <MenuItem value=""><em>Select Extension</em></MenuItem>
                          <MenuItem value="Jr.">Jr.</MenuItem>
                          <MenuItem value="Sr.">Sr.</MenuItem>
                          <MenuItem value="I">I</MenuItem>
                          <MenuItem value="II">II</MenuItem>
                          <MenuItem value="III">III</MenuItem>
                          <MenuItem value="IV">IV</MenuItem>
                          <MenuItem value="V">V</MenuItem>
                        </Select>

                      </FormControl>
                    </Box>


                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={1}>Mother Nickname</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_nickname"
                        placeholder="Enter your Mother Nickname"
                        value={person.mother_nickname ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_nickname}
                        helperText={errors.mother_nickname ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>


                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Mother's Educational Background
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />

                  <Box display="flex" gap={3} alignItems="center">
                    {/* Mother's Education Not Applicable Checkbox */}
                    <Checkbox
                      disabled
                      name="mother_education"
                      checked={person.mother_education === 1}
                      onChange={(e) => {
                        const isChecked = e.target.checked;

                        const updatedPerson = {
                          ...person,
                          mother_education: isChecked ? 1 : 0,
                          ...(isChecked
                            ? {
                              mother_education_level: "",
                              mother_last_school: "",
                              mother_course: "",
                              mother_year_graduated: "",
                              mother_school_address: "",
                            }
                            : {}),
                        };

                        setPerson(updatedPerson);
                        handleUpdate(updatedPerson); // Optional: Immediate save
                      }}
                      onBlur={handleBlur}
                      sx={{ width: 25, height: 25 }}
                    />
                    <label style={{ fontFamily: "Arial" }}>Mother's education not applicable</label>
                  </Box>

                  {/* Mother Educational Details (conditionally rendered) */}
                  {person.mother_education !== 1 && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Education Level</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="mother_education_level"
                          placeholder="Enter your Mother Education Level"
                          value={person.mother_education_level ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_education_level}
                          helperText={errors.mother_education_level ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Last School</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="mother_last_school"
                          placeholder="Enter your Mother Last School Attended"
                          value={person.mother_last_school ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_last_school}
                          helperText={errors.mother_last_school ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Course</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="mother_course"
                          placeholder="Enter your Mother Course"
                          value={person.mother_course ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_course}
                          helperText={errors.mother_course ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother Year Graduated</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="mother_year_graduated"
                          placeholder="Enter your Mother Year Graduated"
                          value={person.mother_year_graduated ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_year_graduated}
                          helperText={errors.mother_year_graduated ? "This field is required." : ""}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" mb={1}>Mother School Address</Typography>
                        <TextField
                          InputProps={{ readOnly: true }}

                          fullWidth
                          size="small"
                          name="mother_school_address"
                          placeholder="Enter your Mother School Address"
                          value={person.mother_school_address ?? ""}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.mother_school_address}
                          helperText={errors.mother_school_address ? "This field is required." : ""}
                        />
                      </Box>
                    </Box>
                  )}

                  <Typography sx={{ fontSize: '20px', color: '#6D2323', fontWeight: 'bold', mt: 3 }}>
                    Mother's Contact Information
                  </Typography>
                  <hr style={{ border: '1px solid #ccc', width: '100%' }} />
                  <br />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Contact</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_contact"
                        placeholder="Enter your Mother Contact"
                        value={person.mother_contact ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_contact} helperText={errors.mother_contact ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Occupation</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_occupation"
                        placeholder="Enter your Mother Occupation"
                        value={person.mother_occupation ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_occupation} helperText={errors.mother_occupation ? "This field is required." : ""}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Employer</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_employer"
                        placeholder="Enter your Mother Employer"
                        value={person.mother_employer ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_employer} helperText={errors.mother_employer ? "This field is required." : ""}
                      />
                    </Box>

                    {/* Mother Income */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" mb={0.5}>Mother Income</Typography>
                      <TextField
                        InputProps={{ readOnly: true }}

                        fullWidth
                        size="small"
                        required
                        name="mother_income"
                        placeholder="Enter your Mother Income"
                        value={person.mother_income ?? ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mother_income}
                        helperText={errors.mother_income ? "This field is required." : ""}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" mb={1}>Mother Email</Typography>
                    <TextField
                      InputProps={{ readOnly: true }}

                      fullWidth
                      size="small"
                      required
                      name="mother_email"
                      placeholder="Enter your Mother Email Address (e.g., username@gmail.com)"
                      value={person.mother_email ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}

                    />
                  </Box>
                </>
              )}
            </Box>


            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>In Case of Emergency</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" mb={1}>Guardian</Typography>
              <FormControl style={{ marginBottom: "10px", width: "200px" }} size="small" required error={!!errors.guardian}>
                <InputLabel id="guardian-label">Guardian</InputLabel>
                <Select
                  readOnly
                  labelId="guardian-label"
                  id="guardian"
                  name="guardian"
                  value={person.guardian || ""}
                  label="Guardian"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <MenuItem value=""><em>Select Guardian</em></MenuItem>
                  <MenuItem value="Father">Father</MenuItem>
                  <MenuItem value="Mother">Mother</MenuItem>
                  <MenuItem value="Brother/Sister">Brother/Sister</MenuItem>
                  <MenuItem value="Uncle">Uncle</MenuItem>
                  <MenuItem value="StepFather">Stepfather</MenuItem>
                  <MenuItem value="StepMother">Stepmother</MenuItem>
                  <MenuItem value="Cousin">Cousin</MenuItem>
                  <MenuItem value="Father in Law">Father-in-law</MenuItem>
                  <MenuItem value="Mother in Law">Mother-in-law</MenuItem>
                  <MenuItem value="Sister in Law">Sister-in-law</MenuItem>
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>

              </FormControl>
            </Box>



            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'nowrap' }}>
              {/* Guardian Family Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Family Name</Typography>
                <TextField
                  InputProps={{ readOnly: true }}

                  fullWidth
                  size="small"
                  required
                  name="guardian_family_name"
                  placeholder="Enter your Guardian Family Name"
                  value={person.guardian_family_name ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_family_name}
                  helperText={errors.guardian_family_name ? "This field is required." : ""}
                />
              </Box>

              {/* Guardian First Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian First Name</Typography>
                <TextField
                  InputProps={{ readOnly: true }}

                  fullWidth
                  size="small"
                  required
                  name="guardian_given_name"
                  placeholder="Enter your Guardian First Name"
                  value={person.guardian_given_name ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_given_name}
                  helperText={errors.guardian_given_name ? "This field is required." : ""}
                />
              </Box>

              {/* Guardian Middle Name */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Middle Name</Typography>
                <TextField
                  InputProps={{ readOnly: true }}

                  fullWidth
                  size="small"
                  required
                  name="guardian_middle_name"
                  placeholder="Enter your Guardian Middle Name"
                  value={person.guardian_middle_name ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_middle_name}
                  helperText={errors.guardian_middle_name ? "This field is required." : ""}
                />
              </Box>

              {/* Guardian Name Extension */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Name Extension</Typography>
                <FormControl fullWidth size="small" required error={!!errors.guardian_ext}>
                  <InputLabel id="guardian-ext-label">Extension</InputLabel>
                  <Select
                    readOnly
                    labelId="guardian-ext-label"
                    id="guardian_ext"
                    name="guardian_ext"
                    value={person.guardian_ext || ""}
                    label="Extension"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value=""><em>Select Extension</em></MenuItem>
                    <MenuItem value="Jr.">Jr.</MenuItem>
                    <MenuItem value="Sr.">Sr.</MenuItem>
                    <MenuItem value="I">I</MenuItem>
                    <MenuItem value="II">II</MenuItem>
                    <MenuItem value="III">III</MenuItem>
                    <MenuItem value="IV">IV</MenuItem>
                    <MenuItem value="V">V</MenuItem>
                  </Select>
                  {errors.guardian_ext && (
                    <FormHelperText>This field is required.</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Guardian Nickname */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Nickname</Typography>
                <TextField
                  InputProps={{ readOnly: true }}

                  fullWidth
                  size="small"
                  required
                  name="guardian_nickname"
                  placeholder="Enter your Guardian Nickname"
                  value={person.guardian_nickname ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.guardian_nickname}
                  helperText={errors.guardian_nickname ? "This field is required." : ""}
                />
              </Box>
            </Box>

            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Guardian's Contact Information</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>Guardian Address</Typography>
              <TextField
                InputProps={{ readOnly: true }}

                fullWidth
                size="small"
                required
                name="guardian_address"
                placeholder="Enter your Guardian Address"
                value={person.guardian_address ?? ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.guardian_address}
                helperText={errors.guardian_address ? "This field is required." : ""}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Contact</Typography>
                <TextField
                  InputProps={{ readOnly: true }}

                  fullWidth
                  size="small"
                  required
                  name="guardian_contact"
                  placeholder="Enter your Guardian Contact Number"
                  value={person.guardian_contact ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.guardian_contact} helperText={errors.guardian_contact ? "This field is required." : ""}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" mb={1}>Guardian Email</Typography>
                <TextField
                  InputProps={{ readOnly: true }}

                  fullWidth
                  size="small"
                  required
                  name="guardian_email"
                  placeholder="Enter your Guardian Email Address (e.g., username@gmail.com)"
                  value={person.guardian_email ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}

                />
              </Box>
            </Box>

            <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>Family (Annual Income)</Typography>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            {/* Annual Income */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>Annual Income</Typography>
              <FormControl fullWidth size="small" required error={!!errors.annual_income}>
                <InputLabel id="annual-income-label">Annual Income</InputLabel>
                <Select
                  readOnly
                  labelId="annual-income-label"
                  name="annual_income"
                  value={person.annual_income || ""}
                  label="Annual Income"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <MenuItem value=""><em>Select Annual Income</em></MenuItem>
                  <MenuItem value="80,000 and below">80,000 and below</MenuItem>
                  <MenuItem value="80,000 to 135,000">80,000 to 135,000</MenuItem>
                  <MenuItem value="135,000 to 250,000">135,000 to 250,000</MenuItem>
                  <MenuItem value="250,000 to 500,000">250,000 to 500,000</MenuItem>
                  <MenuItem value="500,000 to 1,000,000">500,000 to 1,000,000</MenuItem>
                  <MenuItem value="1,000,000 and above">1,000,000 and above</MenuItem>
                </Select>
                {errors.annual_income && (
                  <FormHelperText>This field is required.</FormHelperText>
                )}
              </FormControl>
            </Box>



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






            <Box display="flex" justifyContent="space-between" mt={4}>
              {/* Previous Page Button */}
              <Button
                variant="contained"
                component={Link}
                to="/admin_dashboard1"
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

              <Button
                variant="contained"
                onClick={() => {
                  handleUpdate();
                  navigate("/admin_dashboard3");
                }}
                endIcon={
                  <ArrowForwardIcon
                    sx={{
                      color: "#fff",
                      transition: "color 0.3s",
                    }}
                  />
                }
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#E8C999",
                    color: "#000",
                    "& .MuiSvgIcon-root": {
                      color: "#000",
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


export default AdminDashboard2;

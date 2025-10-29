import React, { useState, useEffect } from "react";

import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    Card,
    TableContainer,
    TableHead,
    TextField,
    TableRow,
    MenuItem
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import { useLocation, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ListAltIcon from "@mui/icons-material/ListAlt";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import io from 'socket.io-client';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { Snackbar, Alert } from "@mui/material";
import Unauthorized from "../components/Unauthorized";



const vaccineDoc = { label: 'Copy of Vaccine Card (1st and 2nd Dose)', key: 'VaccineCard' };


const tabs = [
    { label: "Applicant List", to: "/applicant_list", icon: <ListAltIcon /> },
    { label: "Applicant Form", to: "/admin_dashboard1", icon: <PersonIcon /> },
    { label: "Documents Submitted", to: "/student_requirements", icon: <DescriptionIcon /> },
    { label: "Entrance Examination Scores", to: "/applicant_scoring", icon: <SchoolIcon /> },
    { label: "Qualifying / Interview Examination Scores", to: "/qualifying_exam_scores", icon: <FactCheckIcon /> },
    { label: "Medical Clearance", to: "/medical_clearance", icon: <LocalHospitalIcon /> },
    { label: "Student Numbering", to: "/student_numbering", icon: <HowToRegIcon /> },
];


const remarksOptions = [
    "75% OF ATTENDANCE IS NEEDED FOR TRANSFEREE",
    "Attachments were blurry",
    "Birth Certificate with Sarical Surname",
    "Card No Name/Details of the Applicant",
    "Conflict of Lastname with birth certificate",
    "Conflict of Lastname with birth certificate. Please Check",
    "Conflict of name on the document submitted",
    "Did not meet the requirements",
    "Documents did not match with the Requirement",
    "Duplicate Application",
    "FORM 138 IS NOT COMPLETE",
    "Good Moral is outdated must be 2022",
    "GWA did not meet the Requirements",
    "Have failed and incomplete grades",
    "Have failing Grades",
    "Kindly submit your vaccine card and good moral certificate to complete your evaluation",
    "Kindly wait for verification of your credentials (ALS)",
    "Multiple Accounts",
    "NO COURSE APPLIED AND NO DOCUMENTS UPLOADED",
    "NO DOCUMENT UPLOADED",
    "NO FORM 138 UPLOADED",
    "NO TOR UPLOADED",
    "NOT QUALIFIED BASE ON YOUR STRAND",
    "Please post your form 138 for approval",
    "Please prepare your birth certificate reflecting the serrano surname",
    "Please re-submit documents",
    "Please resolve the lastname (conflict) appeared in your birth certificate",
    "Please resubmit all documents. They are not clear",
    "Please resubmit clear copy",
    "Please resubmit the complete view of your document",
    "Please submit clear copy of form 138",
    "Please submit complete documents",
    "Please submit first page of your TOR",
    "Please submit full copy of report card with (front page, 1st, 2nd semester)",
    "Please submit letter of intent or permit to study",
    "Please submit NSO or PSA Birth certificate",
    "Please submit NSO/PSA Birth certificate and vaccine card.",
    "Please submit PSA, form 138, Vaccine card and Good moral",
    "Please submit the full view of your f138 1st and 2nd semester front and back with name on both for verification",
    "Please submit the required documents",
    "Please submit vaccination card with name",
    "Please upload Form 138, NSO/PSA Birth certificate and good moral",
    "Please upload official Transcript of Records",
    "Please upload the whole picture of your form 138",
    "Please upload your form 138, NSO/PSA Birth certificate and vaccine card",
    "Please upload your NSO/PSA",
    "Please upload your photo",
    "Please submit clear copy",
    "Re-submit all copy of TOR w/ remarks: Graduated with a Degree of.... signed by key officials of the school and the registrar",
    "Re-submit photo",
    "REQUIRED TO SUBMIT COMPLETE GRADES FOR TRANSFEREE",
    "Re-submit clear copy",
    "Re-submit clear fill image of form 138",
    "Re-submit form 138 for 2nd semester",
    "Re-submit with complete name",
    "SUBJECTS WERE ALL DROPPED FROM PREVIOUS SCHOOL",
    "Submit good moral year 2022",
    "Submit 1st and 2nd semester report card grade 12",
    "Submit 1st and 2nd semester report card, together with front page",
    "Submit form 138",
    "Submit form 138 with name",
    "Submit form 138 with name and submit photo",
    "Submit Good Moral",
    "Submit Good Moral and Vaccine Card",
    "Submit Goof Moral year 2022",
    "Submit the course descriptions of all the subjects taken from another school to the EARIST registrar for crediting.",
    "Submit updated copy of your good moral",
    "Submit updated Vaccine Card (1st and 2nd dose)",
    "Submit your document",
    "Teacher Certificate Program is a Graduate Program",
    "Temporarily accepted. Please Submit PSA copy of birth certificate",
    "Temporarily accepted. Submit original document upon enrollment.",
    "The file cannot be opened",
    "The form 138 document did not contain the name of the applicant",
    "The uploaded did not match the name and gender of the applicant (Abela, Mary Jane)",
    "The uploaded file did not match with the name of applicant (Shane Bamba)",
    "The uploaded file did not match with the required document",
    "The Vaccine Card you uploaded does not show your name.",
    "TOR should be based in the new curriculum for transferee",
    "Upload clear copy of PSA Birth Certificate in PDF. JPEG. format in full image",
    "Upload your NSO/PSA Birth Certificate",
    "Upload your Photo",
    "You did not meet the grade required for the course",
    "You have a lower grade"
];



const MedicalClearance = () => {

    
const [userID, setUserID] = useState("");
const [user, setUser] = useState("");
const [userRole, setUserRole] = useState("");
const [hasAccess, setHasAccess] = useState(null);
const pageId = 36;

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
    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(5);
    const [clickedSteps, setClickedSteps] = useState(Array(tabs.length).fill(false));


    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });


    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const [explicitSelection, setExplicitSelection] = useState(false);

    const fetchByPersonId = async (personID) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${personID}`);
            setPerson(res.data);
            setSelectedPerson(res.data);
            if (res.data?.applicant_number) {
                await fetchUploadsByApplicantNumber(res.data.applicant_number);
            }
        } catch (err) {
            console.error("❌ person_with_applicant failed:", err);
        }
    };



    const handleStepClick = (index, to) => {
        setActiveStep(index);

        const pid = sessionStorage.getItem("admin_edit_person_id");

        if (pid) {
            // ✅ Always attach ?person_id for whichever tab we click
            navigate(`${to}?person_id=${pid}`);
        } else {
            navigate("/applicant_status"); // if no pid in session, just go raw
        }
    };






    const [uploads, setUploads] = useState([]);
    const [persons, setPersons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({});
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [remarksMap, setRemarksMap] = useState({});
    const [person, setPerson] = useState({
        profile_img: "",
        document_status: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        extension: "",
    });
    const [editingRemarkId, setEditingRemarkId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [newRemarkMode, setNewRemarkMode] = useState({}); // { [upload_id]: true|false }


    useEffect(() => {
        if (editingRemarkId !== null) {
            const stillEditing = uploads.find((u) => u.upload_id === editingRemarkId);
            if (stillEditing?.remarks === remarksMap[editingRemarkId]) {
                setEditingRemarkId(null); // reset only when new data matches
            }
        }
    }, [uploads]);


    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);

            if (storedRole === "registrar") {

                if (storedID !== "undefined") {

                } else {
                    console.warn("Stored person_id is invalid:", storedID);
                }
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    const queryParams = new URLSearchParams(location.search);
    const urlPersonId = queryParams.get("person_id")?.trim() || "";
    let queryPersonId = urlPersonId || sessionStorage.getItem("admin_edit_person_id") || "";

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


    useEffect(() => {
        // No search text: keep explicit selection if present
        if (!searchQuery.trim()) {
            if (!explicitSelection) {
                setSelectedPerson(null);
                setUploads([]);
                setSelectedFiles({});
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
            return;
        }

        // User started typing -> manual search takes over
        if (explicitSelection) setExplicitSelection(false);

        const match = persons.find((p) =>
            `${p.first_name} ${p.middle_name} ${p.last_name} ${p.emailAddress} ${p.applicant_number || ""}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );

        if (match) {
            setSelectedPerson(match);
            fetchUploadsByApplicantNumber(match.applicant_number);
        } else {
            setSelectedPerson(null);
            setUploads([]);
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
    }, [searchQuery, persons, explicitSelection]);




    useEffect(() => {
        fetchPersons();
    }, []);


    const fetchUploadsByApplicantNumber = async (applicant_number) => {
        if (!applicant_number) return;
        try {
            const res = await axios.get(`http://localhost:5000/uploads/by-applicant/${applicant_number}`);
            const vaccineUploads = res.data
                .filter(u =>
                    u.file_path?.toLowerCase().includes("vaccine") ||
                    u.original_name?.toLowerCase().includes("vaccine")
                )
                .map(u => ({
                    ...u,
                    status: u.status ? parseInt(u.status, 10) : 0 // ✅ normalize status
                }));
            setUploads(vaccineUploads);

        } catch (err) {
            console.error("Fetch uploads failed:", err);
        }
    };



    const fetchPersonData = async (personID) => {
        if (!personID || personID === "undefined") {
            console.warn("Invalid personID for person data:", personID);
            return;
        }
        try {
            const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${personID}`);
            const safePerson = {
                ...res.data,
                document_status: res.data.document_status ?? "",  // ✅ fixed
            };
            setPerson(safePerson);   // ✅ only update person
            // ❌ don't call setSelectedPerson here (good that you removed it)
        } catch (error) {
            console.error("❌ Failed to fetch person data:", error?.response?.data || error.message);
        }
    };


    useEffect(() => {
        if (selectedPerson?.person_id) {
            fetchPersonData(selectedPerson.person_id);
        }
    }, [selectedPerson]);



    const fetchPersons = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/upload_documents');
            setPersons(res.data);
        } catch (err) {
            console.error('Error fetching persons:', err);
        }
    };

    // ✅ STATUS CHANGE
    const handleStatusChange = async (uploadId, remarkValue) => {
        const remarks = remarksMap[uploadId] || "";

        try {
            await axios.put(`http://localhost:5000/uploads/vaccine-status/${uploadId}`, {
                status: Number(remarkValue),
                remarks,
                user_id: userID,
                document_status: person.document_status || "Disapproved", // ✅ keep status
            });

            fetchApplicantUploads(applicantNumber);

            setUploads(prev =>
                prev.map(u =>
                    u.upload_id === uploadId
                        ? { ...u, status: Number(remarkValue), remarks }
                        : u
                )
            );

            if (selectedPerson?.applicant_number) {
                await fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
            }
            setEditingRemarkId(null);

            showSnackbar("✅ Updated successfully!", "success");
        } catch (err) {
            console.error("Error updating Status:", err);
            showSnackbar("❌ Something went wrong.", "error");
        }
    };

    // ✅ FIXED: Upload Vaccine Card (Admin)
    const handleUploadSubmit = async () => {
        if (!selectedFiles.file || !selectedPerson?.person_id) {
            showSnackbar("⚠️ Please select a file and a person first.", "warning");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFiles.file);
            formData.append("person_id", selectedPerson.person_id);
            formData.append("remarks", selectedFiles.remarks || "");

            await axios.post("http://localhost:5000/api/upload/vaccine", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                "x-person-id": localStorage.getItem("person_id"),
            });

            showSnackbar("✅ Vaccine Card uploaded successfully!", "success");
            setSelectedFiles({});

            if (selectedPerson?.applicant_number) {
                await fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            showSnackbar("❌ Upload failed.", "error");
        }
    };

    const handleDelete = async (uploadId) => {
        try {
            await axios.delete(`http://localhost:5000/admin/uploads/${uploadId}`);

            if (selectedPerson?.applicant_number) {
                fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
            }

            setSelectedFiles((prev) => {
                const updated = { ...prev };
                delete updated[vaccineDoc.key];
                return updated;
            });

            showSnackbar("✅ Deleted successfully!", "success");
        } catch (err) {
            console.error("Delete error:", err);
            showSnackbar("❌ Failed to delete. Please try again.", "error");
        }
    };


    // ✅ DOCUMENT STATUS CHANGE
    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name !== "document_status") return;

        const newValue = value || "";
        setPerson(prev => ({ ...prev, document_status: newValue })); // ✅ keep local state

        try {
            const vaccineUpload = uploads.find(u =>
                u.file_path?.toLowerCase().includes("vaccine") ||
                u.original_name?.toLowerCase().includes("vaccine")
            );

            if (vaccineUpload) {
                await axios.put(
                    `http://localhost:5000/uploads/vaccine-status/${vaccineUpload.upload_id}`,
                    {
                        document_status: newValue,
                        user_id: userID,
                        status: vaccineUpload.status || 0,
                        remarks: vaccineUpload.remarks || ""
                    }
                );
            }

            // ❌ REMOVE fetchPersonData because it overwrites with stale status
            // ✅ only refresh uploads, not person
            if (selectedPerson?.applicant_number) {
                await fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
            }

            showSnackbar("✅ Updated successfully!", "success");
        } catch (err) {
            console.error("❌ Failed to update vaccine document_status:", err);
            showSnackbar("❌ Something went wrong.", "error");
        }
    };



    const renderRow = (doc) => {
        const uploaded = uploads.find((u) =>
            u.description.toLowerCase().includes(doc.label.toLowerCase())
        );

        const uploadId = uploaded?.upload_id;

        const buttonStyle = {
            minWidth: 120,
            height: 40,
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'none',
        };

        // local save handler (rename to avoid shadowing top-level handler)
        // ✅ REMARKS SAVE inside renderRow

if (hasAccess === null) {
   return "Loading...."
}

  if (!hasAccess) {
    return (
      <Unauthorized />
    );
  }w


        return (
            <TableRow key={doc.key}>
                <TableCell sx={{ fontWeight: 'bold', width: '20%', border: "1px solid maroon" }}>{doc.label}</TableCell>
                <TableCell sx={{ width: '20%', border: "1px solid maroon" }}>
                    {uploadId && editingRemarkId === uploadId ? (
                        newRemarkMode[uploadId] ? (
                            // free-text mode
                            <TextField
                                size="small"
                                fullWidth
                                autoFocus
                                placeholder="Enter custom remark"
                                value={remarksMap[uploadId] ?? ""}
                                onChange={(e) =>
                                    setRemarksMap((prev) => ({ ...prev, [uploadId]: e.target.value }))
                                }
                                onBlur={async () => {
                                    const finalRemark = (remarksMap[uploadId] || "").trim();
                                    if (finalRemark) {
                                        try {
                                            const isVaccine =
                                                uploaded?.file_path?.toLowerCase().includes("vaccine") ||
                                                uploaded?.original_name?.toLowerCase().includes("vaccine");

                                            const endpoint = isVaccine
                                                ? `http://localhost:5000/uploads/vaccine-status/${uploadId}`
                                                : `http://localhost:5000/uploads/remarks/${uploadId}`;

                                            const payload = isVaccine
                                                ? {
                                                    status: Number(uploaded?.status || 0),
                                                    remarks: finalRemark,
                                                    document_status: person.document_status || null,
                                                    user_id: userID,
                                                }
                                                : {
                                                    remarks: finalRemark,
                                                    status: Number(uploaded?.status || 0),
                                                    user_id: userID,
                                                };

                                            await axios.put(endpoint, payload);

                                            // optimistic update local state
                                            setUploads((prev) =>
                                                prev.map((u) =>
                                                    u.upload_id === uploadId ? { ...u, remarks: finalRemark } : u
                                                )
                                            );

                                            if (selectedPerson?.applicant_number) {
                                                await fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
                                            }
                                        } catch (err) {
                                            console.error("Failed to save remarks:", err);
                                        }
                                    }

                                    setNewRemarkMode((prev) => ({ ...prev, [uploadId]: false }));
                                    setEditingRemarkId(null);
                                }}
                                onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const finalRemark = (remarksMap[uploadId] || "").trim();
                                        if (finalRemark) {
                                            try {
                                                const isVaccine =
                                                    uploaded?.file_path?.toLowerCase().includes("vaccine") ||
                                                    uploaded?.original_name?.toLowerCase().includes("vaccine");

                                                const endpoint = isVaccine
                                                    ? `http://localhost:5000/uploads/vaccine-status/${uploadId}`
                                                    : `http://localhost:5000/uploads/remarks/${uploadId}`;

                                                const payload = isVaccine
                                                    ? {
                                                        status: Number(uploaded?.status || 0),
                                                        remarks: finalRemark,
                                                        document_status: person.document_status || null,
                                                        user_id: userID,
                                                    }
                                                    : {
                                                        remarks: finalRemark,
                                                        status: Number(uploaded?.status || 0),
                                                        user_id: userID,
                                                    };

                                                await axios.put(endpoint, payload);

                                                setUploads((prev) =>
                                                    prev.map((u) =>
                                                        u.upload_id === uploadId ? { ...u, remarks: finalRemark } : u
                                                    )
                                                );

                                                if (selectedPerson?.applicant_number) {
                                                    await fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
                                                }
                                            } catch (err) {
                                                console.error("Failed to save remarks:", err);
                                            }
                                        }

                                        setNewRemarkMode((prev) => ({ ...prev, [uploadId]: false }));
                                        setEditingRemarkId(null);
                                    }
                                }}
                            />
                        ) : (
                            // preset dropdown mode
                            <TextField
                                select
                                size="small"
                                fullWidth
                                autoFocus
                                value={remarksMap[uploadId] ?? uploaded?.remarks ?? ""}
                                onChange={async (e) => {
                                    const value = e.target.value;
                                    if (value === "__NEW__") {
                                        setNewRemarkMode((prev) => ({ ...prev, [uploadId]: true }));
                                        return;
                                    }

                                    setRemarksMap((prev) => ({ ...prev, [uploadId]: value }));

                                    try {
                                        const isVaccine =
                                            uploaded?.file_path?.toLowerCase().includes("vaccine") ||
                                            uploaded?.original_name?.toLowerCase().includes("vaccine");

                                        const endpoint = isVaccine
                                            ? `http://localhost:5000/uploads/vaccine-status/${uploadId}`
                                            : `http://localhost:5000/uploads/remarks/${uploadId}`;

                                        const payload = isVaccine
                                            ? {
                                                status: Number(uploaded?.status || 0),
                                                remarks: value,
                                                document_status: person.document_status || null,
                                                user_id: userID,
                                            }
                                            : {
                                                remarks: value,
                                                status: Number(uploaded?.status || 0),
                                                user_id: userID,
                                            };

                                        await axios.put(endpoint, payload);

                                        // optimistic local update
                                        setUploads((prev) =>
                                            prev.map((u) => (u.upload_id === uploadId ? { ...u, remarks: value } : u))
                                        );

                                        if (selectedPerson?.applicant_number) {
                                            await fetchUploadsByApplicantNumber(selectedPerson.applicant_number);
                                        }
                                    } catch (err) {
                                        console.error("Failed to save remarks:", err);
                                    } finally {
                                        setEditingRemarkId(null);
                                    }
                                }}
                                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                            >
                                <MenuItem value="">
                                    <em>Select Remarks</em>
                                </MenuItem>
                                {remarksOptions.map((option, index) => (
                                    <MenuItem key={index} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                                <MenuItem value="__NEW__">New Remarks</MenuItem>
                            </TextField>
                        )
                    ) : (
                        <Box
                            onClick={() => {
                                if (!uploadId) return; // guard: don't open editor if no upload
                                setEditingRemarkId(uploadId);
                                setNewRemarkMode((prev) => ({ ...prev, [uploadId]: false }));
                                setRemarksMap((prev) => ({
                                    ...prev,
                                    [uploadId]: uploaded?.remarks ?? "",
                                }));
                            }}
                            sx={{
                                cursor: uploadId ? "pointer" : "default",
                                fontStyle: uploaded?.remarks ? "normal" : "italic",
                                color: uploaded?.remarks ? "inherit" : "#888",
                                minHeight: "40px",
                                display: "flex",
                                alignItems: "center",
                                px: 1,
                            }}
                        >
                            {uploaded?.remarks || "Click to add remarks"}
                        </Box>
                    )}
                </TableCell>







                <TableCell align="center" sx={{ width: '15%', border: "1px solid maroon" }}>
                    {uploaded ? (
                        uploaded.status === 1 ? (
                            <Box
                                sx={{
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    borderRadius: 1,
                                    width: 140,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                }}
                            >
                                <Typography sx={{ fontWeight: 'bold' }}>Verified</Typography>
                            </Box>
                        ) : uploaded.status === 2 ? (
                            <Box
                                sx={{
                                    backgroundColor: '#F44336',
                                    color: 'white',
                                    borderRadius: 1,
                                    width: 140,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                }}
                            >
                                <Typography sx={{ fontWeight: 'bold' }}>Rejected</Typography>
                            </Box>
                        ) : (
                            <Box display="flex" justifyContent="center" gap={1}>
                                <Button
                                    variant="contained"
                                    onClick={() => handleStatusChange(uploaded.upload_id, '1')}
                                    sx={{ ...buttonStyle, backgroundColor: 'green', color: 'white' }}
                                >
                                    Verified
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => handleStatusChange(uploaded.upload_id, '2')}
                                    sx={{ ...buttonStyle, backgroundColor: 'red', color: 'white' }}
                                >
                                    Rejected
                                </Button>
                            </Box>
                        )
                    ) : null}
                </TableCell>

                <TableCell style={{ border: "1px solid maroon" }}>
                    {uploaded?.created_at &&
                        new Date(uploaded.created_at).toLocaleString('en-PH', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                            timeZone: 'Asia/Manila',
                        })}
                </TableCell>

                <TableCell style={{ border: "1px solid maroon" }}>
                    {selectedPerson
                        ? `[${selectedPerson.applicant_number}] ${selectedPerson.last_name?.toUpperCase()}, ${selectedPerson.first_name?.toUpperCase()} ${selectedPerson.middle_name?.toUpperCase() || ''} ${selectedPerson.extension?.toUpperCase() || ''}`
                        : ''}
                </TableCell>

                <TableCell style={{ border: "1px solid maroon" }}>
                    <Box display="flex" justifyContent="center" gap={1}>
                        {uploaded ? (
                            <>
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        backgroundColor: 'green',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#006400'
                                        }
                                    }}
                                    onClick={() => {
                                        setEditingRemarkId(uploaded.upload_id);
                                        setRemarksMap((prev) => ({
                                            ...prev,
                                            [uploaded.upload_id]: uploaded.remarks || "",
                                        }));
                                    }}
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#1976d2', color: 'white' }}
                                    href={`http://localhost:5000/uploads/${uploaded.file_path}`}
                                    target="_blank"
                                >
                                    Preview
                                </Button>

                                <Button
                                    onClick={() => handleDelete(uploaded.upload_id)}
                                    sx={{
                                        backgroundColor: 'maroon',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#600000' },
                                    }}
                                >
                                    Delete
                                </Button>

                            </>
                        ) : null}
                    </Box>
                </TableCell>

            </TableRow>

        );
    };




    return (
        <Box sx={{ height: 'calc(100vh - 150px)', overflowY: 'auto', paddingRight: 1 }}>
            <Box sx={{ px: 2 }}>


                {/* Top header: DOCUMENTS SUBMITTED + Search */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        mt: 2,
                        mb: 2,
                        px: 2,
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
                        MEDICAL CLEARANCE
                    </Typography>

                    <TextField
                        variant="outlined"
                        placeholder="Search Applicant Name / Email / Applicant ID"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
                        sx={{ width: { xs: '100%', sm: '425px' }, mt: { xs: 2, sm: 0 } }}
                    />
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
                        flexWrap: "wrap", // so it wraps on smaller screens
                    }}
                >
                    {tabs.map((tab, index) => (
                        <React.Fragment key={index}>
                            {/* Step Card */}
                            <Card
                                onClick={() => handleStepClick(index, tab.to)}
                                sx={{
                                    flex: 1,
                                    maxWidth: `${100 / tabs.length}%`, // evenly fit in one row
                                    height: 100,
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
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box sx={{ fontSize: 32, mb: 0.5 }}>{tab.icon}</Box>
                                    <Typography
                                        sx={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}
                                    >
                                        {tab.label}
                                    </Typography>
                                </Box>
                            </Card>

                            {/* Spacer instead of line */}
                            {index < tabs.length - 1 && (
                                <Box
                                    sx={{
                                        flex: 0.1,
                                        mx: 1, // keeps spacing between cards
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </Box>


                {/* Applicant ID and Name */}
                <TableContainer component={Paper} sx={{ width: '100%', border: "1px solid maroon", mt: 2 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#6D2323', }}>
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

                <TableContainer component={Paper} sx={{ width: '100%', border: "2px solid maroon" }}>
                    <Box style={{ textAlign: "center", marginTop: "25px", fontSize: "24px", fontFamily: "Arial", color: "maroon", fontWeight: "bold" }}>Medical Clearance</Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 5,
                            mb: 2,
                            px: 2,
                        }}
                    >
                        {/* Left side: Applying As and Strand */}
                        <Box>
                            {/* Applying As */}


                            {/* Document Status */}
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        fontFamily: "Arial Black",
                                        marginRight: "45px",

                                    }}
                                >
                                    Status:
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    name="document_status"
                                    value={person.document_status || ""}
                                    onChange={handleChange} // ✅ this stays
                                    sx={{ width: "500px" }}
                                    InputProps={{ sx: { height: 40 } }}
                                    inputProps={{ style: { padding: "4px 8px", fontSize: "12px" } }}
                                >
                                    <MenuItem value=""><em>Select Document Status</em></MenuItem>
                                    <MenuItem value="On process">On process</MenuItem>
                                    <MenuItem value="Documents Verified & ECAT">Documents Verified & ECAT</MenuItem>
                                    <MenuItem value="Disapproved">Disapproved</MenuItem>
                                    <MenuItem value="Program Closed">Program Closed</MenuItem>
                                </TextField>
                                {person?.evaluator?.evaluator_email && (
                                    <Typography variant="caption" sx={{ marginLeft: 1 }}>
                                        Status Changed By:{" "}
                                        {person.evaluator.evaluator_email.replace(/@gmail\.com$/i, "")} (
                                        {person.evaluator.evaluator_lname || ""}, {person.evaluator.evaluator_fname || ""}{" "}
                                        {person.evaluator.evaluator_mname || ""}
                                        )
                                        <br />
                                        Updated At: {new Date(person.evaluator.created_at).toLocaleString()}
                                    </Typography>
                                )}

                            </Box>


                            {/* Document Type, Remarks, and Document File */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>

                                {/* Document Type */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                                    <Typography sx={{ fontSize: "14px", fontFamily: "Arial Black", width: "90px" }}>
                                        Document Type:
                                    </Typography>
                                    <TextField
                                        select
                                        size="small"
                                        placeholder="Select Documents"
                                        value={selectedFiles.requirements_id || ''}
                                        onChange={(e) =>
                                            setSelectedFiles(prev => ({
                                                ...prev,
                                                requirements_id: e.target.value,
                                            }))
                                        }
                                        sx={{ width: 200 }} // match width
                                        InputProps={{ sx: { height: 38 } }} // match height
                                        inputProps={{ style: { padding: "4px 8px", fontSize: "12px" } }}
                                    >
                                        <MenuItem value="">
                                            <em>Select Documents</em>
                                        </MenuItem>
                                        <MenuItem value={1}>Copy of Vaccine Card (1st and 2nd Dose)</MenuItem>

                                    </TextField>
                                </Box>

                                {/* Remarks */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: "14px", fontFamily: "Arial Black", width: "80px" }}>
                                        Remarks
                                    </Typography>
                                    <TextField
                                        select
                                        size="small"
                                        placeholder="Select Remarks"
                                        value={selectedFiles.remarks || ''}
                                        onChange={(e) =>
                                            setSelectedFiles(prev => ({
                                                ...prev,
                                                remarks: e.target.value,
                                            }))
                                        }
                                        sx={{ width: 250 }}
                                        InputProps={{ sx: { height: 38 } }}
                                        inputProps={{ style: { padding: "4px 8px", fontSize: "12px" } }}
                                    >
                                        <MenuItem value="">
                                            <em>Select Remarks</em>
                                        </MenuItem>
                                        {remarksOptions.map((option, index) => (
                                            <MenuItem key={index} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>


                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: "-25px" }}>
                                    <Typography sx={{ fontSize: "14px", fontFamily: "Arial Black", width: "100px", textAlign: "center" }}>
                                        Document File:
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        onClick={() => document.getElementById("fileInput").click()}
                                        sx={{
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            textTransform: 'none',
                                            width: 150,
                                            height: 38,
                                            fontSize: "15px",
                                            fontWeight: 'bold',
                                            justifyContent: "center", // center icon and text
                                            '&:hover': {
                                                backgroundColor: '#1565c0'
                                            }
                                        }}
                                    >
                                        {selectedFiles.file ? selectedFiles.file.name : "Select File"}
                                    </Button>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        hidden
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) =>
                                            setSelectedFiles(prev => ({
                                                ...prev,
                                                file: e.target.files[0],
                                            }))
                                        }
                                    />
                                </Box>

                            </Box>


                            <Button
                                variant="contained"
                                color="success"
                                sx={{
                                    ml: 2,
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    height: "35px",
                                    width: "200px"
                                }}
                                onClick={handleUploadSubmit}
                                disabled={!selectedFiles.requirements_id || !selectedFiles.file}
                            >
                                Submit Documents
                            </Button>
                        </Box>

                        {/* Right side: ID Photo */}
                        {person.profile_img && (
                            <Box
                                sx={{
                                    width: "2.10in", // standard 2×2 size
                                    height: "2.10in",
                                    border: "1px solid #ccc",
                                    overflow: "hidden",
                                    marginTop: "-140px",
                                    borderRadius: "4px",
                                }}
                            >
                                <img
                                    src={`http://localhost:5000/uploads/${person.profile_img}`}
                                    alt="Profile"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </Box>
                        )}
                    </Box>
                </TableContainer>




                <>
                    <TableContainer component={Paper} sx={{ width: '100%', border: "1px solid maroon" }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#6D2323' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', textAlign: "center", border: "1px solid maroon" }}>Document Type</TableCell>
                                    <TableCell sx={{ color: 'white', textAlign: "center", border: "1px solid maroon" }}>Remarks</TableCell>
                                    <TableCell sx={{ color: 'white', textAlign: "center", border: "1px solid maroon" }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', textAlign: "center", border: "1px solid maroon" }}>Date and Time Submitted</TableCell>
                                    <TableCell sx={{ color: 'white', textAlign: "center", border: "1px solid maroon" }}>User</TableCell>
                                    <TableCell sx={{ color: 'white', textAlign: "center", border: "1px solid maroon" }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderRow(vaccineDoc) ? (
                                    renderRow(vaccineDoc)
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No vaccine documents found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
                        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert
                            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                            severity={snackbar.severity}
                            sx={{ width: "100%" }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>



                </>

            </Box>
        </Box >
    );
};

export default MedicalClearance;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RegistrarExamPermit from "../registrar/RegistrarExamPermit";
import { TextField, Button, Box, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QRScanner from "../components/QRScanner"; // make sure path is correct
import Unauthorized from "../components/Unauthorized";

const ApplicantProfile = () => {
    const { applicantNumber } = useParams();
    const navigate = useNavigate();

    const [personId, setPersonId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(applicantNumber || "");
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        if (!searchQuery) return;

        const fetchPersonId = async () => {
            try {
                // 1️⃣ Get person_id by applicant_number
                const res = await axios.get(`http://localhost:5000/api/person-by-applicant/${searchQuery}`);

                if (!res.data?.person_id) {
                    alert("❌ Applicant not found.");
                    setPersonId(null);
                    return;
                }

                const pid = res.data.person_id;

                // 2️⃣ Check if applicant is qualified for exam (verified documents)
                const verifiedRes = await axios.get(`http://localhost:5000/api/document_status/check/${searchQuery}`);

                if (!verifiedRes.data.verified) {
                    alert("❌ Applicant’s documents are not yet verified. Not qualified for exam.");
                    setPersonId(null);
                    return;
                }

                // 3️⃣ Check if applicant is already accepted FIRST
                const statusRes = await axios.get(`http://localhost:5000/api/applicant-status/${searchQuery}`);

                if (statusRes.data?.found && statusRes.data.status === "Accepted") {
                    alert("✅ Applicant already ACCEPTED. Please proceed to the medical.");
                    setPersonId(pid);
                    return;
                }

                // 4️⃣ Then check if applicant already has exam score
                const scoreRes = await axios.get(`http://localhost:5000/api/applicant-has-score/${searchQuery}`);

                if (scoreRes.data.hasScore) {
                    alert("✅ Applicant already has entrance exam score. Proceed to college admission.");
                    setPersonId(pid);
                    return;
                }

                // ✅ If verified, not accepted, and no score — show permit
                setPersonId(pid);

            } catch (err) {
                console.error("Error fetching applicant:", err);
                setPersonId(null);
            }
        };

        fetchPersonId();
    }, [searchQuery]);

    const [userID, setUserID] = useState("");
const [user, setUser] = useState("");
const [userRole, setUserRole] = useState("");
const [hasAccess, setHasAccess] = useState(null);
const pageId = 11;

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
    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/applicant_profile/${searchQuery.trim()}`);
        }
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
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    mb: 2,
                    px: 2,
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
                    APPLICANT PROFILE
                </Typography>
            </Box>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    label="Enter Applicant Number"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                />
                <Button variant="contained" onClick={handleSearch}>
                    Search
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<CameraAltIcon />}
                    onClick={() => setScannerOpen(true)}
                >
                    Scan QR
                </Button>
            </Box>

            {/* 📷 QR Scanner Dialog */}
            <QRScanner
                open={scannerOpen}
                onScan={async (text) => {
                    let scannedNumber = String(text || "").trim();
                    if (scannedNumber.includes("/")) {
                        scannedNumber = scannedNumber.split("/").pop();
                    }

                    setScannerOpen(false);
                    setSearchQuery(scannedNumber);

                    // Immediately trigger search logic
                    setTimeout(() => handleSearch(), 300);
                }}
                onClose={() => setScannerOpen(false)}
            />

            {/* 📝 Display Exam Permit if applicant is valid */}
            {personId ? (
                <RegistrarExamPermit personId={personId} />
            ) : (
                searchQuery && <div>Invalid Applicant Number or not found.</div>
            )}
        </Box>
    );
};

export default ApplicantProfile;

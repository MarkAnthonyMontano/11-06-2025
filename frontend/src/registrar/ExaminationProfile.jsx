import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ExamPermit from "../applicant/ExamPermit";
import { TextField, Button, Box, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QRScanner from "../components/QRScanner"; // make sure path is correct
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

const ExaminationProfile = () => {
    const { applicantNumber } = useParams();
    const navigate = useNavigate();

    const [personId, setPersonId] = useState(null);
    const [searchQuery, setSearchQuery] = useState(applicantNumber || "");
    const [scannerOpen, setScannerOpen] = useState(false);

    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const pageId = 31;

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
        if (!searchQuery) return;

        const fetchPersonId = async () => {
            try {
                // 1. Get person_id by applicant_number
                const res = await axios.get(
                    `http://localhost:5000/api/person-by-applicant/${searchQuery}`
                );

                if (!res.data?.person_id) {
                    setPersonId(null);
                    alert("❌ Applicant not found.");
                    return;
                }

                const pid = res.data.person_id;

                // 2. Check if all 4 documents are verified
                const statusRes = await axios.get(
                    `http://localhost:5000/api/document_status/check/${searchQuery}`
                );

                if (!statusRes.data.verified) {
                    alert("❌ This applicant’s documents are not yet fully verified. Exam permit cannot be displayed.");
                    setPersonId(null);
                    return;
                }

                // ✅ Only set personId if verified
                setPersonId(pid);
            } catch (err) {
                console.error("Error fetching applicant:", err);
                setPersonId(null);
            }
        };

        fetchPersonId();
    }, [searchQuery]);


    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/examination_profile/${searchQuery.trim()}`);
        }
    };

  // Put this at the very bottom before the return 
if (loading || hasAccess === null) {
   return <LoadingOverlay open={loading} message="Check Access"/>;
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',

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
                    EXAMINATION PROFILE
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
            {/* <QRScanner
                open={scannerOpen}
                onScan={async (text) => {
                    let scannedNumber = String(text || "").trim();
                    if (scannedNumber.includes("/")) {
                        scannedNumber = scannedNumber.split("/").pop();
                    }

                    setScannerOpen(false);
                    navigate(`/examination_profile/${scannedNumber}`);
                    setSearchQuery(scannedNumber);
                }}
                onClose={() => setScannerOpen(false)}
            /> */}

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

                    // ✅ Immediately trigger search after scan
                    setTimeout(() => {
                        handleSearch();
                    }, 300);
                }}
                onClose={() => setScannerOpen(false)}
            />


            {/* 📝 Display ExamPermit if person found */}
            {personId ? (
                <ExamPermit personId={personId} />
            ) : (
                searchQuery && <div>Invalid Applicant Number or not found.</div>
            )}
        </Box>
    );
};

export default ExaminationProfile;

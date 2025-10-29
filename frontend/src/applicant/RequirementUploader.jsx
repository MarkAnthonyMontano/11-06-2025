import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Container,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import ErrorIcon from "@mui/icons-material/Error";


const RequirementUploader = () => {
  const [requirements, setRequirements] = useState([]); // ✅ dynamic requirements

  const [uploads, setUploads] = useState([]);
  const [userID, setUserID] = useState('');
  const [selectedFiles, setSelectedFiles] = useState({});
  const [allRequirementsCompleted, setAllRequirementsCompleted] = useState(
    localStorage.getItem("requirementsCompleted") === "1"
  );
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const id = localStorage.getItem('person_id');
    if (id) {
      setUserID(id);
      fetchUploads(id);
    }

    // ✅ Fetch all requirements dynamically from backend
    axios.get("http://localhost:5000/requirements")
      .then((res) => setRequirements(res.data))
      .catch((err) => console.error("Error loading requirements:", err));
  }, []);

  const fetchUploads = async (personId) => {
    try {
      const res = await axios.get("http://localhost:5000/uploads", {
        headers: { "x-person-id": personId },
      });

      const uploadsData = res.data;
      setUploads(uploadsData);

      const rebuiltSelectedFiles = {};
      uploadsData.forEach((upload) => {
        rebuiltSelectedFiles[upload.requirements_id] = upload.original_name;
      });
      setSelectedFiles(rebuiltSelectedFiles);

      // ✅ Simple completion logic — replace with your own rule if needed
      const allRequired = uploadsData.length > 0; // or >= some number you expect

      // ✅ Show Congratulations only if all uploads are now complete
      if (!allRequirementsCompleted && allRequired) {
        setSnack({
          open: true,
          message:
            "🎉 Congratulations! You have successfully confirmed your slot at Eulogio Amang Rodriguez Institute of Science and Technology.",
          severity: "success",
        });
      }

      setAllRequirementsCompleted(allRequired);
      localStorage.setItem("requirementsCompleted", allRequired ? "1" : "0");
    } catch (err) {
      console.error("❌ Fetch uploads failed:", err);
    }
  };



  const handleUpload = async (key, file) => {
    if (!file) return;

    setSelectedFiles((prev) => ({ ...prev, [key]: file.name }));

    const requirementId = key;
    if (!requirementId) return alert('Requirement not found.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirements_id', key); // ✅ key is already the doc.id
    formData.append('person_id', userID);

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchUploads(userID);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload. Please try again.');
    }
  };



  const handleDelete = async (uploadId) => {
    try {
      await axios.delete(`http://localhost:5000/uploads/${uploadId}`, {
        headers: { 'x-person-id': userID }
      });

      fetchUploads(userID);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack(prev => ({ ...prev, open: false }));
  };

  const renderRow = (doc) => {
    const uploaded = uploads.find((u) =>
      u.description && u.description.toLowerCase().includes(doc.label.toLowerCase())

    );

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



    return (
      <TableRow key={doc.id}>
        <TableCell sx={{ fontWeight: 'bold', width: '25%', border: "2px solid maroon" }}>{doc.label}</TableCell>
        <TableCell sx={{ width: '25%', border: "2px solid maroon", textAlign: "Center" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Box sx={{ width: '220px', flexShrink: 0, textAlign: "center" }}>
              {selectedFiles[doc.id] ? (
                <Box
                  sx={{
                    backgroundColor: '#e0e0e0',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={selectedFiles[doc.id]}
                >
                  {selectedFiles[doc.id]}
                </Box>
              ) : (
                <Box sx={{ height: '40px' }} />
              )}
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  backgroundColor: '#F0C03F',
                  color: 'white',
                  fontWeight: 'bold',
                  height: '40px',
                  textTransform: 'none',
                  minWidth: '140px',
                }}
              >
                Browse File
                <input
                  key={selectedFiles[doc.key] || Date.now()}
                  hidden
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleUpload(doc.id, e.target.files[0])}

                />
              </Button>
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={{ width: "25%", border: "2px solid maroon" }}>
          <Typography
            sx={{
              fontStyle: uploaded?.remarks ? "normal" : "italic",
              color: uploaded?.remarks ? "inherit" : "#888",
            }}
          >
            {uploaded?.remarks || ""}
          </Typography>

          {uploaded?.status == 1 || uploaded?.status == 2 ? (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: "14px",
                color: uploaded?.status == 1 ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {uploaded?.status == 1 ? "Verified" : "Rejected"}
            </Typography>
          ) : null}
        </TableCell>

        <TableCell sx={{ width: '10%', border: "2px solid maroon" }}>
          {uploaded && (
            <Button
              variant="contained"
              color="primary"
              href={`http://localhost:5000/uploads/${uploaded.file_path}`}
              target="_blank"
              startIcon={<VisibilityIcon />}
              sx={{
                height: '40px',
                textTransform: 'none',
                minWidth: '100px',
                width: '100%',
              }}
            >
              Preview
            </Button>

          )}
        </TableCell>

        <TableCell sx={{ width: '10%', border: "2px solid maroon" }}>
          {uploaded && (
            <Button
              onClick={() => handleDelete(uploaded.upload_id)}
              startIcon={<DeleteIcon />}
              sx={{
                backgroundColor: 'maroon',
                color: 'white',
                '&:hover': { backgroundColor: '#600000' },
                fontWeight: 'bold',
                height: '40px',
                textTransform: 'none',
                minWidth: '100px',
                width: '100%',
              }}
            >
              Delete
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>
      {/* ✅ Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={handleClose} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
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
        UPLOAD REQUIREMENTS
        </Typography>




      </Box>
      <hr style={{ border: "1px solid #ccc", width: "100%" }} />

      <br />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // ✅ Center horizontally
          width: "100%",
          mt: 2,
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // ✅ Center content inside full-width box
            gap: 2,
            width: "100%", // ✅ Still takes full width
            textAlign: "center",
            p: 2,
            borderRadius: "10px",
            backgroundColor: "#fffaf5",
            border: "1px solid #6D2323",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
            whiteSpace: "nowrap",
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
            <ErrorIcon sx={{ color: "white", fontSize: 40 }} />
          </Box>

          {/* Text */}
          <Typography
            sx={{
              fontSize: "15px",
              fontFamily: "Arial",
              color: "#3e3e3e",
              textAlign: "center",
            }}
          >
            <strong style={{ color: "maroon" }}>Notice:</strong> &nbsp;
            <strong>
              PLEASE NOTE: ONLY JPG, JPEG, PNG or PDF WITH MAXIMUM OF FILE SIZE OF 4MB ARE ALLOWED
            </strong>
          </Typography>
        </Box>
      </Box>


      <Box sx={{ px: 2, marginLeft: "-10px" }}>
        {Object.entries(
          requirements.reduce((acc, r) => {
            const cat = r.category || "Regular";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(r);
            return acc;
          }, {})
        ).map(([category, docs]) => (
          <Box key={category} sx={{ mt: 4 }}>
            <Container>
              <h1
                style={{
                  fontSize: "45px",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "maroon",
                  marginTop: "25px",
                }}
              >
                {category === "Medical"
                  ? "UPLOAD MEDICAL DOCUMENTS"
                  : category === "Others"
                    ? "OTHER REQUIREMENTS"
                    : "UPLOAD DOCUMENTS"}
              </h1>

              {/* 📝 Show message only below UPLOAD DOCUMENTS title */}
              {category !== "Medical" && category !== "Others" && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    marginTop: "10px",
                    marginBottom: "30px",
                    color: "#333",
                  }}
                >
                  Complete the applicant form to secure your place for the upcoming academic year at{" "}
                  <b>EARIST</b>.
                </div>
              )}
            </Container>

            <TableContainer
              component={Paper}
              sx={{ width: "95%", mt: 2, border: "2px solid maroon" }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#6D2323", border: "2px solid maroon" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", border: "2px solid maroon" }}>Document</TableCell>
                    <TableCell sx={{ color: "white", border: "2px solid maroon" }}>Upload</TableCell>
                    <TableCell sx={{ color: "white" }}>Remarks</TableCell>
                    <TableCell sx={{ color: "white" }}>Preview</TableCell>
                    <TableCell sx={{ color: "white" }}>Delete</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {docs.map((doc) =>
                    renderRow({
                      id: doc.id,
                      label: doc.description,
                    })
                  )}

                </TableBody>

              </Table>
            </TableContainer>
          </Box>
        ))}
      </Box>

    </Box>
  );
};

export default RequirementUploader;

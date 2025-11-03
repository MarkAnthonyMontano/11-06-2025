import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";


const ProgramPanel = () => {
  const [program, setProgram] = useState({ name: "", code: "" });
  const [programs, setPrograms] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Also put it at the very top
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);


  const pageId = 42;

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


  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 🔹 Fetch programs
  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get_program");
      setPrograms(res.data);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // 🔹 Handle input change
  const handleChangesForEverything = (e) => {
    const { name, value } = e.target;
    setProgram((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Add or Update Program
  const handleAddingProgram = async () => {
    if (!program.name || !program.code) {
      setSnackbar({
        open: true,
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/program/${editId}`, program);
        setSnackbar({
          open: true,
          message: "Program updated successfully!",
          severity: "success",
        });
      } else {
        await axios.post("http://localhost:5000/program", program);
        setSnackbar({
          open: true,
          message: "Program added successfully!",
          severity: "success",
        });
      }

      setProgram({ name: "", code: "" });
      setEditMode(false);
      setEditId(null);
      fetchPrograms();
    } catch (err) {
      console.error("Error saving program:", err);
      setSnackbar({
        open: true,
        message: "Error saving program!",
        severity: "error",
      });
    }
  };

  // 🔹 Edit Program
  const handleEdit = (prog) => {
    setProgram({
      name: prog.program_description,
      code: prog.program_code,
    });
    setEditMode(true);
    setEditId(prog.program_id);
  };

  // 🔹 Delete Program
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?")) return;

    try {
      await axios.delete(`http://localhost:5000/program/${id}`);
      fetchPrograms();
      setSnackbar({
        open: true,
        message: "Program deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting program:", err);
      setSnackbar({
        open: true,
        message: "Error deleting program!",
        severity: "error",
      });
    }
  };

  // 🔹 Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 🔒 Disable right-click and blocked keys
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    const blocked =
      e.key === "F12" ||
      e.key === "F11" ||
      (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && ["u", "p"].includes(e.key.toLowerCase()));
    if (blocked) {
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
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        paddingRight: 1,
        backgroundColor: "transparent",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          
          mb: 2,
          
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "maroon", fontSize: "36px" }}
        >
          PROGRAM PANEL
        </Typography>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      <div style={styles.container}>
        {/* LEFT SECTION: Form */}
        <div style={styles.formSection}>
          <div style={styles.formGroup}>
            <label htmlFor="program_name" style={styles.label}>
              Program Description:
            </label>
            <input
              type="text"
              id="program_name"
              name="name"
              value={program.name}
              onChange={handleChangesForEverything}
              placeholder="Enter Program Description"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="program_code" style={styles.label}>
              Program Code:
            </label>
            <input
              type="text"
              id="program_code"
              name="code"
              value={program.code}
              onChange={handleChangesForEverything}
              placeholder="Enter Program Code"
              style={styles.input}
            />
          </div>

          <Button
            onClick={handleAddingProgram}
            variant="contained"
            sx={{
              backgroundColor: "maroon",
              color: "white",
              mt: 3,
              width: "100%",
              "&:hover": { backgroundColor: "#8b0000" },
            }}
          >
            {editMode ? "Update Program" : "Insert Program"}
          </Button>
        </div>

        {/* RIGHT SECTION: Table */}
        <div style={styles.displaySection}>
          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: "center", color: "#333" }}
          >
            Program List
          </Typography>

          <div style={styles.taggedProgramsContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((prog) => (
                  <tr key={prog.program_id}>
                    <td style={styles.td}>{prog.program_id}</td>
                    <td style={styles.td}>{prog.program_description}</td>
                    <td style={styles.td}>{prog.program_code}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button
                        onClick={() => handleEdit(prog)}
                        style={styles.editButton}
                      >
                        <EditIcon fontSize="small" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prog.program_id)}
                        style={styles.deleteButton}
                      >
                        <DeleteIcon fontSize="small" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {programs.length === 0 && <p>No programs available.</p>}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  formSection: {
    width: "48%",
    background: "#f8f8f8",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
    border: "2px solid maroon",
  },
  displaySection: {
    width: "48%",
    background: "#f8f8f8",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    overflowY: "auto",
    maxHeight: "600px",
    boxSizing: "border-box",
    border: "2px solid maroon",
  },
  formGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#444",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  taggedProgramsContainer: {
    overflowY: "auto",
    maxHeight: "500px",
    marginTop: "15px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    backgroundColor: "#f1f1f1",
    padding: "15px",
    textAlign: "left",
    fontWeight: "bold",
    border: "2px solid maroon",
    fontSize: "16px",
  },
  td: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    fontSize: "16px",
    border: "2px solid maroon",
  },
  editButton: {
    backgroundColor: "#2E7D32", // success green
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 14px",
    marginRight: "6px",
    cursor: "pointer",
    width: "100px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
  deleteButton: {
    backgroundColor: "#800000", // maroon
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 14px",
    cursor: "pointer",
    width: "100px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
};

export default ProgramPanel;

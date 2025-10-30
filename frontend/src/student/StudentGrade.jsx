import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert
} from "@mui/material";
import axios from "axios";

const StudentGradingPage = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [studentGrade, setStudentGrade] = useState([])
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [gradingActive, setGradingActive] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole !== "student") {
        window.location.href = "/faculty_dashboard";
      } else {
        fetchStudentGrade(storedID);
        console.log("you are an", storedRole);
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchStudentGrade = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student_grade/${id}`);
      setStudentGrade(res.data);
    } catch (error) {
      console.error(error)
    }
  };

  const fetchGradingStatus = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/grading_status");
      if (res.data.status === 1) {
        setGradingActive(true);
        setMessage("");
      } else {
        setGradingActive(false);
        setMessage("Grades are not available yet.");
      }
    } catch (error) {
      console.error("Failed to fetch grading status:", error);
      setMessage("Error fetching grading status.");
    }
  };

  useEffect(() => {
    fetchGradingStatus();
  }, []);

  const getRemarks = (remark) => {
    switch (remark) {
      case 0: return "";
      case 1: return "PASSED";
      case 2: return "FAILED";
      case 3: return "INCOMPLETE";
      case 4: return "DROP";
      default: return "ERROR";
    }
  };

  const viewGrade = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student/view_latest_grades/${userID}`);

      if (res.data.status === "incomplete") {
        setMessage(res.data.message);
        setStudentGrade(res.data.grades);
      } else if (res.data.status === "ok") {
        setMessage("");
        setStudentGrade(res.data.grades);
      } else if (res.data.status === "not-available") {
        setMessage(res.data.message);
      } else {
        setMessage(res.data.message || "No grades available");
        setStudentGrade([]);
      }
    } catch (err) {
      console.error("Failed to fetch grades:", err);
      setMessage("Error fetching grades.");
    }
  };

// 🔒 Disable right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 🔒 Block DevTools shortcuts silently
    document.addEventListener('keydown', (e) => {
        const isBlockedKey =
            e.key === 'F12' ||
            e.key === 'F11' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'U');

        if (isBlockedKey) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

  return (
    <Box sx={{ ml: '-2rem', paddingRight: 8, height: "calc(100vh - 150px)", overflowY: "auto", marginLeft: '-2rem' }}>
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setMessage("")} severity="warning" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2, // adds spacing like gutterBottom
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
          STUDENT GRADES
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Typography
            variant="body2"
            sx={{ color: gradingActive ? "green" : "error.main" }}
          >
            {gradingActive
              ? "The grades can now be viewed."
              : "The grades are not yet available."}
          </Typography>
          <Button
            variant="contained"
            disabled={!gradingActive}
            onClick={viewGrade}
            sx={{
              bgcolor: "maroon",
              textTransform: "none",
              px: 3,
              fontWeight: 500,
              "&:hover": { bgcolor: "red" },
            }}
          >
            View Latest Grade
          </Button>
        </Box>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />



      {studentGrade.length > 0 ? (
        [...new Set(studentGrade.map(row => `${row.first_year}-${row.last_year} ${row.semester_description}`))]
          .map((term, idx) => (
            <Box key={idx} sx={{ mb: 4 }}>
              <Box className="flex mt-[2rem] mb-[1rem]">
                <Typography variant="body2" color="text.secondary" className="w-full">
                  Program: {studentGrade[0].program_description} ({studentGrade[0].program_code})
                </Typography>
                <Box className="flex gap-[5rem] w-[42rem]">
                  <Typography variant="body2" color="text.secondary">
                    School Year: {term.split(" ")[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Semester: {term.split(" ").slice(1).join(" ")}
                  </Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} sx={{ marginTop: "1rem", boxShadow: "none" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell style={{ border: "2px solid maroon" }} ><strong>Code</strong></TableCell>
                      <TableCell style={{ border: "2px solid maroon" }}><strong>Subject</strong></TableCell>
                      <TableCell style={{ border: "2px solid maroon" }} align="center"><strong>Faculty Name</strong></TableCell>
                      <TableCell style={{ border: "2px solid maroon" }} align="center"><strong>Units</strong></TableCell>
                      <TableCell style={{ border: "2px solid maroon" }} align="center"><strong>Section</strong></TableCell>
                      <TableCell style={{ border: "2px solid maroon" }} align="center"><strong>Final Grade</strong></TableCell>

                      <TableCell style={{ border: "2px solid maroon" }} align="center"><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentGrade
                      .filter(row => `${row.first_year}-${row.last_year} ${row.semester_description}` === term)
                      .map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell style={{ border: "2px solid maroon" }}>{row.course_code}</TableCell>
                          <TableCell style={{ border: "2px solid maroon" }}>{row.course_description}</TableCell>
                          <TableCell sx={{ border: "2px solid maroon" }}>
                            {row.fname === "TBA" && row.lname === "TBA"
                              ? "TBA"
                              : `Prof. ${row.fname} ${row.lname}`}
                          </TableCell>
                          <TableCell style={{ border: "2px solid maroon" }} align="center">
                            {row.course_unit}
                          </TableCell>
                          <TableCell style={{ border: "2px solid maroon" }}>
                            {row.program_code}-{row.section_description}
                          </TableCell>
                          <TableCell style={{ border: "2px solid maroon" }} align="center">
                            {row.final_grade ?? ""}
                          </TableCell>
                          <TableCell style={{ border: "2px solid maroon" }} align="center">
                            {row.en_remarks ? getRemarks(row.en_remarks) : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>

                </Table>
              </TableContainer>
            </Box>
          ))
      ) : (
        <Typography>No grades available</Typography>
      )}
    </Box>
  );
};

export default StudentGradingPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, TextField, MenuItem, Container } from "@mui/material";
import LinearWithValueLabel from "../components/LinearWithValueLabel";
import { Snackbar, Alert } from "@mui/material";
import { FaFileExcel } from "react-icons/fa";
import Unauthorized from "../components/Unauthorized";

const CourseTagging = () => {
  const [data, setdata] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [personID, setPersonID] = useState('');
  //////////
  const [hasAccess, setHasAccess] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  ///////////
  const pageId = 22;

  // do not alter
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

  //////
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
    const updateDate = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours() % 12 || 12).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";

      const formattedDate = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
      setCurrentDate(formattedDate);
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [studentNumber, setStudentNumber] = useState("");
  const [userId, setUserId] = useState(null); // Dynamic userId
  const [first_name, setUserFirstName] = useState(null); // Dynamic userId
  const [middle_name, setUserMiddleName] = useState(null); // Dynamic userId
  const [last_name, setUserLastName] = useState(null); // Dynamic userId
  const [currId, setCurr] = useState(null); // Dynamic userId
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [subjectCounts, setSubjectCounts] = useState({});

  const fetchSubjectCounts = async (sectionId) => {
    try {
      const response = await axios.get("http://localhost:5000/subject-enrollment-count", {
        params: { sectionId },
      });

      // Transform into object for easy lookup: { subject_id: enrolled_count }
      const counts = {};
      response.data.forEach((item) => {
        counts[item.course_id] = item.enrolled_count;
      });

      setSubjectCounts(counts);

    } catch (err) {
      console.error("Failed to fetch subject counts", err);

    }
  };

  useEffect(() => {
    if (selectedSection) {
      fetchSubjectCounts(selectedSection);
    }
  }, [selectedSection]);

  useEffect(() => {
    if (currId) {
      axios
        .get(`http://localhost:5000/courses/${currId}`)
        .then((res) => setCourses(res.data))
        .catch((err) => console.error(err));
    }
  }, [currId]);

  useEffect(() => {
    if (userId && currId) {
      axios
        .get(`http://localhost:5000/enrolled_courses/${userId}/${currId}`)
        .then((res) => setEnrolled(res.data))
        .catch((err) => console.error(err));
    }
  }, [userId, currId]);

  // Fetch department sections when component mounts
  useEffect(() => {
    fetchDepartmentSections();
  }, []);

  // Fetch sections whenever selectedDepartment changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentSections();
    }
  }, [selectedDepartment]);

  // Fetch department sections based on selected department
  const fetchDepartmentSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/department-sections", {
        params: { departmentId: selectedDepartment },
      });
      // Artificial delay
      setTimeout(() => {
        setSections(response.data);
        setLoading(false);
      }, 700); // 3 seconds delay

    } catch (err) {
      console.error("Error fetching department sections:", err);
      setError("Failed to load department sections");
      setLoading(false);
    }
  };

  const handleSectionChange = async (e) => {
    const sectionId = e.target.value;
    setSelectedSection(sectionId);
    console.log("Selected section ID:", sectionId);

    const selectedSectionObj = sections.find(
      (section) => section.section_id === parseInt(sectionId)
    );
    console.log("Selected section object:", selectedSectionObj);

    try {

      const response = await axios.put("http://localhost:5000/api/update-active-curriculum", {
        studentId: studentNumber,
        departmentSectionId: sectionId,
      });


      const courseRes = await axios.get(`http://localhost:5000/api/search-student/${sectionId}`);
      if (courseRes.data.length > 0) {
        setCurr(courseRes.data[0].curriculum_id);
        setCourseCode(courseRes.data[0].program_code);
        setCourseDescription(courseRes.data[0].program_description);
      } else {
        console.warn("No program data found for selected section");
      }

      console.log("Curriculum updated:", response.data);

    } catch (error) {
      console.error("Error updating curriculum:", error);
    }
  };


  const isEnrolled = (course_id) => enrolled.some((item) => item.course_id === course_id);

  const addToCart = async (course) => {
    if (!selectedSection) {
      alert("Please select a department section before adding the course.");
      return;
    }

    if (!isEnrolled(course.course_id)) {
      const payload = { subject_id: course.course_id, department_section_id: selectedSection };
      try {
        await axios.post(`http://localhost:5000/add-to-enrolled-courses/${userId}/${currId}/`, payload);

        // Refresh enrolled courses list after adding
        const { data } = await axios.get(`http://localhost:5000/enrolled_courses/${userId}/${currId}`);
        setEnrolled(data);
      } catch (err) {
        console.error("Error adding course or refreshing enrolled list:", err);
      }
    }
  };

  const addAllToCart = async () => {
    const newCourses = courses.filter((c) => !isEnrolled(c.course_id));
    if (!selectedSection) {
      alert("Please select a department section before adding the course.");
      return;
    }

    if (newCourses.length === 0) return;

    try {
      await Promise.all(
        newCourses.map(async (course) => {
          try {
            console.log("Curriculum ID for this course taggging is:", currId);
            const res = await axios.post("http://localhost:5000/add-all-to-enrolled-courses", {
              subject_id: course.course_id,
              user_id: userId,
              curriculumID: currId, // Include curriculum_id
              departmentSectionID: selectedSection, // Include selected section
            });

            console.log(`Response for subject ${course.course_id}:`, res.data.message);
          } catch (err) {
            console.error(`Error enrolling subject ${course.course_id}:`, err.response?.data?.message || err.message);
          }
        })
      );

      // Refresh enrolled courses list
      const { data } = await axios.get(`http://localhost:5000/enrolled_courses/${userId}/${currId}`);
      setEnrolled(data);
      setCourseCode(data[0].program_code);
      setCourseDescription(data[0].program_description);
      setSectionDescription(data[0].section);

    } catch (err) {
      console.error("Unexpected error during enrollment:", err);
    }
  };

  const deleteFromCart = async (id) => {
    try {
      // Delete the specific course
      await axios.delete(`http://localhost:5000/courses/delete/${id}`);

      // Refresh enrolled courses list
      const { data } = await axios.get(`http://localhost:5000/enrolled_courses/${userId}/${currId}`);
      setEnrolled(data);

      console.log(`Course with ID ${id} deleted and enrolled list updated`);
    } catch (err) {
      console.error("Error deleting course or refreshing enrolled list:", err);
    }
  };

  const deleteAllCart = async () => {
    try {
      // Delete all user courses
      await axios.delete(`http://localhost:5000/courses/user/${userId}`);
      setCourseCode("Not");
      setCourseDescription("Currently Enrolled");
      setSectionDescription("");
      // Refresh enrolled courses list
      const { data } = await axios.get(`http://localhost:5000/enrolled_courses/${userId}/${currId}`);
      setEnrolled(data);
      console.log("Cart cleared and enrolled courses refreshed");
    } catch (err) {
      console.error("Error deleting cart or refreshing enrolled list:", err);
    }
  };

  const handleSearchStudent = async () => {
    if (!studentNumber.trim()) {
      setSnack({ open: true, message: "Please fill in the student number", severity: "warning" });

      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/student-tagging", { studentNumber }, { headers: { "Content-Type": "application/json" } });

      const { token, person_id, studentNumber: studentNum, section: section, activeCurriculum: active_curriculum, yearLevel, courseCode: courseCode, courseDescription: courseDescription, firstName: first_name,
        middleName: middle_name, lastName: last_name, } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("person_id", person_id);
      localStorage.setItem("studentNumber", studentNum);
      localStorage.setItem("activeCurriculum", active_curriculum);
      localStorage.setItem("yearLevel", yearLevel);
      localStorage.setItem("courseCode", courseCode);
      localStorage.setItem("courseDescription", courseDescription);
      localStorage.setItem("firstName", first_name);
      localStorage.setItem("middleName", middle_name);
      localStorage.setItem("lastName", last_name);
      localStorage.setItem("section", section);
      setUserId(studentNum); // Set dynamic userId
      setUserFirstName(first_name); // Set dynamic userId
      setUserMiddleName(middle_name); // Set dynamic userId
      setUserLastName(last_name); // Set dynamic userId
      setCurr(active_curriculum); // Set Program Code based on curriculum
      setCourseCode(courseCode); // Set Program Code
      setCourseDescription(courseDescription); // Set Program Description
      setPersonID(person_id);
      setSectionDescription(section);

      console.log(studentNum);
      console.log(userId);
      console.log(active_curriculum);
      console.log(currId);
      setSnack({ open: true, message: "Student found and authenticated!", severity: "success" });
    } catch (error) {
      setSnack({
        open: true,
        message: error.response?.data?.message || "Student not found",
        severity: "error",
      });

    }
  };

  // Fetch all departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelect = (departmentId) => {
    setSelectedDepartment(departmentId);
  };

  const handleImport = async () => {
    try {
      if (!selectedFile) {
        alert("Please choose a file first!");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post("http://localhost:5000/api/import-xlsx", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert(res.data.message || "Excel imported successfully!");
        setSelectedFile(null);

      } else {
        alert(res.data.error || "Failed to import");
      }
    } catch (err) {
      console.error("❌ Import error:", err);
      alert("Import failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  //🔒 Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  //🔒 Block DevTools shortcuts + Ctrl+P silently
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


  ////////
  if (hasAccess === null) {
   return "Loading...."
}

  if (!hasAccess) {
    return (
      <Unauthorized />
    );
  }


  return (
    <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>

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
          COURSE TAGGING PANEL
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "0.5rem",
            justifyContent: "flex-end", // ✅ push to right
          }}
        >
          <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 200 }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="excel-upload"
            />
            <button
              onClick={() => document.getElementById("excel-upload").click()}
              style={{
                border: "2px solid green",
                backgroundColor: "#f0fdf4",
                color: "green",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                height: "50px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                userSelect: "none",
                width: "200px", // ✅ same width as Print
              }}
              type="button"
            >
              <FaFileExcel size={20} />
              Choose Excel
            </button>
          </Box>

          <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 200 }}>
            <Button
              variant="contained"
              fullWidth
               sx={{ backgroundColor: "maroon", color: "white", height: "50px", width: "200px", }}
              onClick={handleImport}
            >
              Upload
            </Button>
          </Box>
        </Box>



      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />

      <br />
      <Typography
        variant="h4"
        fontWeight="bold"
        color="maroon"
        textAlign="center"
        gutterBottom
        mb={3}
      >
        Select Department
      </Typography>
      <Grid
        container
        spacing={4}
        gap={2}
        justifyContent="center"
        textAlign="center"
        style={{ backgroundColor: "white", padding: "1rem 0rem" }}
      >
        {departments.map((dept, index) => (
          <Grid key={dept.dprtmnt_id}>
            <Button
              fullWidth
              key={index}
              variant="contained"
              value={dept.dprtmnt_id}
              onClick={() => handleSelect(dept.dprtmnt_id)}
              sx={{
                backgroundColor:
                  selectedDepartment === dept.dprtmnt_id ? "maroon" : "white",
                color: selectedDepartment === dept.dprtmnt_id ? "white" : "maroon",
                border: "1px solid maroon",
                "&:hover": {
                  backgroundColor: "maroon",
                  color: "white",
                },
              }}
              style={{ opacity: '1px' }}
            >
              {dept.dprtmnt_code}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Box p={4} display="grid" gridTemplateColumns="1fr 1fr" gap={4} style={{ marginLeft: '-1rem', height: 'calc(90vh - 120px)', overflowY: 'auto', overflowX: "hidden", width: '100rem', }}>
        {/* Available Courses */}
        <Box
          component={Paper}
          backgroundColor={"#f1f1f1"}
          p={2}
          sx={{ border: "2px solid maroon" }}
        >
          {/* Search Student */}

          <Box>
            <Typography variant="h6">
              Name: &emsp;
              {first_name} {middle_name} {last_name}
              <br />
              Department/Course/Section: &emsp;
              {courseCode} {courseDescription} {sectionDescription}
            </Typography>

            <TextField
              label="Student Number"
              fullWidth
              margin="normal"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchStudent();
                }
              }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearchStudent}
            >
              Search
            </Button>
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="success" onClick={addAllToCart} disabled={!userId}>
              Enroll All
            </Button>
            <Button variant="contained" color="warning" onClick={deleteAllCart}>
              Unenroll All
            </Button>
          </Box>

          <Typography variant="h6" mt={2} gutterBottom>
            Available Courses
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{border: "2px solid maroon", textAlign: "center"}}>Course Code</TableCell>
                <TableCell style={{border: "2px solid maroon", textAlign: "center"}}>Subject ID</TableCell>
                <TableCell style={{border: "2px solid maroon", textAlign: "center"}}>Enrolled Students</TableCell>
                <TableCell style={{border: "2px solid maroon", textAlign: "center"}}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.course_id}>
                  <TableCell style={{border: "2px solid maroon",}}>{c.course_code}</TableCell>
                  <TableCell style={{border: "2px solid maroon", }}>{c.course_description}</TableCell>
                  <TableCell style={{border: "2px solid maroon", textAlign: "center"}}>
                    {subjectCounts[c.course_id] || 0}
                  </TableCell>
                  <TableCell style={{border: "2px solid maroon", }}>
                    {!isEnrolled(c.course_id) ? (
                      <Button variant="contained" size="small" onClick={() => addToCart(c)} disabled={!userId}>
                        Enroll
                      </Button>
                    ) : (
                      <Typography color="textSecondary">Enrolled</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box
          component={Paper}
          backgroundColor={"#f1f1f1"}
          p={2}
          sx={{ border: "2px solid maroon" }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Department Section
            </Typography>

            {/* Department Sections Dropdown */}
            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearWithValueLabel />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TextField
                select
                fullWidth
                value={selectedSection}
                onChange={handleSectionChange}
                variant="outlined"
                margin="normal"
                label="Select a department section"
              >
                <MenuItem value="">
                  <em>Select a department section</em>
                </MenuItem>
                {sections.map((section) => (
                  <MenuItem key={section.department_and_program_section_id} value={section.department_and_program_section_id}>
                    {section.program_code} - {section.program_description} - {section.description}
                  </MenuItem>
                ))}
              </TextField>
            )}

          </Box>

          <Typography variant="h6" gutterBottom>
            Enrolled Courses
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ display: "none", border: "2px solid maroon" }}>Enrolled Subject ID</TableCell>
                <TableCell style={{ display: "none", border: "2px solid maroon" }}>Subject ID</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>SUBJECT CODE</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>SECTION</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>DAY</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>TIME</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon"}}>ROOM</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>FACULTY</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon"}}>ENROLLED STUDENTS</TableCell>
                <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>Action</TableCell>
              </TableRow>
            </TableHead>




            <TableBody >
              {enrolled.map((e, idx) => (

                <TableRow key={idx} >
                  <TableCell style={{ display: "none", border: "2px solid maroon" }}>{e.id}</TableCell>
                  <TableCell style={{ display: "none", border: "2px solid maroon" }}>{e.course_id}</TableCell>
                  <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>
                    {e.course_code}-{e.section_description}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>
                    {e.program_code}-{e.description}
                  </TableCell>
                  <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{e.day_description}</TableCell>
                  <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>{e.school_time_start}-{e.school_time_end}</TableCell>
                  <TableCell style={{ textAlign: "center" , border: "2px solid maroon"}}>{e.room_description}</TableCell>
                  <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>Prof. {e.lname}</TableCell>
                  <TableCell style={{ textAlign: "center" , border: "2px solid maroon"}}> ({e.number_of_enrolled})</TableCell>
                  <TableCell style={{ textAlign: "center", border: "2px solid maroon" }}>
                    <Button style={{ textAlign: "center",  }} variant="contained" color="error" size="small" onClick={() => deleteFromCart(e.id)}>
                      Unenroll
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>

        </Box>

      </Box>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default CourseTagging;

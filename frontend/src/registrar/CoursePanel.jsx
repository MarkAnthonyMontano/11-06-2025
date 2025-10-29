import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import Unauthorized from "../components/Unauthorized";

const CoursePanel = () => {
  const [course, setCourse] = useState({
    course_code: "",
    course_description: "",
    course_unit: "",
    lab_unit: "",
  });

  const [courseList, setCourseList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
    key: 0,
  });

  // ✅ Helper for showing Snackbar
  const showSnack = (message, severity) => {
    setSnack({
      open: true,
      message,
      severity,
      key: new Date().getTime(), // force re-render
    });
  };

const [userID, setUserID] = useState("");
const [user, setUser] = useState("");
const [userRole, setUserRole] = useState("");
const [hasAccess, setHasAccess] = useState(null);
const pageId = 21;

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

  // ✅ Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/course_list");
      setCourseList(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ Handle input change
  const handleChangesForEverything = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add new course
  const handleAddingCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/adding_course", course);
      setCourse({
        course_code: "",
        course_description: "",
        course_unit: "",
        lab_unit: "",
      });
      showSnack("Course successfully added!", "success");
      fetchCourses();
    } catch (err) {
      console.error(err);
      showSnack("Failed to add course.", "error");
    }
  };

  // ✅ Edit course (load data into form)
  const handleEdit = (item) => {
    setCourse({
      course_code: item.course_code,
      course_description: item.course_description,
      course_unit: item.course_unit,
      lab_unit: item.lab_unit,
    });
    setEditMode(true);
    setEditId(item.course_id);
  };

  // ✅ Update course
  const handleUpdateCourse = async () => {
    try {
      await axios.put(`http://localhost:5000/update_course/${editId}`, {
        ...course,
        course_unit: Number(course.course_unit),
        lab_unit: Number(course.lab_unit),
      });

      // ✅ Update instantly
      setCourseList((prevList) =>
        prevList.map((item) =>
          item.course_id === editId
            ? { ...item, ...course }
            : item
        )
      );

      // ✅ Fetch latest from DB (to ensure sync)
      await fetchCourses();

      showSnack("Course updated successfully!", "success");

      // ✅ Reset form
      setEditMode(false);
      setEditId(null);
      setCourse({
        course_code: "",
        course_description: "",
        course_unit: "",
        lab_unit: "",
      });
    } catch (error) {
      console.error("Update failed:", error);
      showSnack("Failed to update course.", "error");
    }
  };

  // ✅ Delete course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`http://localhost:5000/delete_course/${id}`);
      setCourseList((prevList) => prevList.filter((item) => item.course_id !== id));
      showSnack("Course deleted successfully!", "info");
    } catch (err) {
      console.error(err);
      showSnack("Failed to delete course.", "error");
    }
  };

  // ✅ Close Snackbar
  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
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
          mt: 2,
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
          COURSE PANEL
        </Typography>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      <div style={styles.flexContainer}>
        {/* ✅ FORM SECTION */}
        <div style={styles.leftPane}>
          <h3 style={{ color: "#800000" }}>
            {editMode ? "Edit Course" : "Add New Course"}
          </h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Course Description:</label>
            <input
              type="text"
              name="course_description"
              value={course.course_description}
              onChange={handleChangesForEverything}
              placeholder="Enter Course Description"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Course Code:</label>
            <input
              type="text"
              name="course_code"
              value={course.course_code}
              onChange={handleChangesForEverything}
              placeholder="Enter Course Code"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Course Unit:</label>
            <input
              type="text"
              name="course_unit"
              value={course.course_unit}
              onChange={handleChangesForEverything}
              placeholder="Enter Course Unit"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Laboratory Unit:</label>
            <input
              type="text"
              name="lab_unit"
              value={course.lab_unit}
              onChange={handleChangesForEverything}
              placeholder="Enter Laboratory Unit"
              style={styles.input}
            />
          </div>

          <button
            style={styles.button}
            onClick={editMode ? handleUpdateCourse : handleAddingCourse}
          >
            {editMode ? "Update" : "Insert"}
          </button>
        </div>

        {/* ✅ TABLE SECTION */}
        <div style={styles.rightPane}>
          <h3 style={{ color: "maroon" }}>All Courses</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Code</th>
                  <th>Course Unit</th>
                  <th>Lab Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseList.map((c) => (
                  <tr key={c.course_id}>
                    <td>{c.course_id}</td>
                    <td>{c.course_description}</td>
                    <td>{c.course_code}</td>
                    <td>{c.course_unit}</td>
                    <td>{c.lab_unit}</td>
                    <td>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(c.course_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Snackbar */}
      <Snackbar
        key={snack.key}
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ✅ STYLES
const styles = {
  flexContainer: {
    display: "flex",
    gap: "30px",
    alignItems: "flex-start",
  },
  leftPane: {
    flex: 1,
    padding: 10,
    border: "2px solid maroon",
    borderRadius: 2,
  },
  rightPane: {
    flex: 2,
    padding: 10,
    border: "2px solid maroon",
    borderRadius: 2,
  },
  inputGroup: { marginBottom: "15px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    width: "90%",
    padding: "10px",
    backgroundColor: "maroon",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "block",
    margin: "0 auto",
  },
  editBtn: {
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    marginRight: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "maroon",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  tableContainer: {
    maxHeight: "400px",
    overflowY: "auto",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default CoursePanel;

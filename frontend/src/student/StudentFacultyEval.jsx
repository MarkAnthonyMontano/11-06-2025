import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import axios from "axios";

const StudentFacultyEvaluation = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [studentCourses, setStudentCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [studentNumber, setStudentNumber] = useState("");

  // ✅ On page load: check user session and fetch student data
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
        fetchCourseData(storedID);
        fetchQuestions();
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  // ✅ Fetch questions
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/get_questions_for_evaluation"
      );
      setQuestions(response.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // ✅ Fetch student courses
  const fetchCourseData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student_course/${id}`);
      setStudentCourses(res.data);
      if (res.data.length > 0) {
        setStudentNumber(res.data[0].student_number);
      }
      console.log("Courses:", res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // ✅ Handle course selection
  const handleSelectedCourse = (event) => {
    const selected = event.target.value;
    setSelectedCourse(selected);
  };

  // ✅ Handle answer change
  const handleAnswerChange = (question_id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [question_id]: value,
    }));
  };

  // ✅ Get selected professor for display
  const selectedProfessor = studentCourses.find(
    (prof) => prof.course_id === selectedCourse
  );

  // ✅ Save evaluation for all questions
  const SaveEvaluation = async () => {
    if (!selectedProfessor) {
      alert("Please select a course before submitting.");
      return;
    }

    try {
      for (const [question_id, answer] of Object.entries(answers)) {
        await axios.post("http://localhost:5000/api/student_evaluation", {
          student_number: studentNumber,
          school_year_id: selectedProfessor.active_school_year_id,
          prof_id: selectedProfessor.prof_id,
          course_id: selectedProfessor.course_id,
          question_id,
          answer,
        });
      }

      alert("Evaluation submitted successfully!");
      setAnswers({});
      setSelectedCourse("");
      fetchCourseData(userID);
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert("Failed to save evaluation.");
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
    <Box
      sx={{
        
        ml: "-2rem",
        paddingRight: 8,
        height: "calc(100vh - 150px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
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
          sx={{
            fontWeight: "bold",
            color: "maroon",
            fontSize: "36px",
          }}
        >
          FACULTY EVALUATION FORM
        </Typography>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      {/* Course Select */}
      <FormControl sx={{ mt: 3, minWidth: "600px" }}>
        <InputLabel>Select Course</InputLabel>
        <Select
          label="Select Course"
          value={selectedCourse}
          onChange={handleSelectedCourse}
        >
          {studentCourses.map((prof) => (
            <MenuItem key={prof.course_id} value={prof.course_id}>
              <Box style={{ display: "flex", gap: "1rem" }}>
                <Typography
                  sx={{
                    width: "100px",
                    borderRight: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {prof.course_code}
                </Typography>
                {prof.course_description}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Show professor info */}
      {selectedProfessor && (
        <TextField
          disabled
          sx={{ mt: 3, ml: 2, minWidth: "500px" }}
          value={`Professor: ${selectedProfessor.fname} ${selectedProfessor.mname} ${selectedProfessor.lname}`}
        />
      )}

      {/* Show questions only if professor selected */}
      {selectedProfessor && (
        <Paper sx={{ mt: 4, p: 3, border: "2px solid maroon" }}>
          <Typography variant="h6" gutterBottom>
            Evaluation Questions
          </Typography>

          {/* Questions */}
          {questions.map((q) => (
            <Box key={q.question_id} sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                {q.question_description}
              </Typography>
              <RadioGroup
                row
                value={answers[q.question_id] || ""}
                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
              >
                {[q.first_choice, q.second_choice, q.third_choice, q.fourth_choice, q.fifth_choice]
                  .filter(Boolean)
                  .map((choice, i) => (
                    <FormControlLabel
                      key={i}
                      value={choice}
                      control={<Radio />}
                      label={choice}
                    />
                  ))}
              </RadioGroup>
            </Box>
          ))}

          {/* Submit Button */}
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={SaveEvaluation}
          >
            Submit Evaluation
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default StudentFacultyEvaluation;

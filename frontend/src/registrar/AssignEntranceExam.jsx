import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Grid, MenuItem, TextField, Typography, Paper, Card } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PeopleIcon from "@mui/icons-material/People";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";


const AssignEntranceExam = () => {

  const tabs = [
    {
      label: <>Admission Process for <br /> Registrar</>,
      to: "/applicant_list_admin",
      icon: <SchoolIcon fontSize="large" />
    },
    { label: "Applicant Form", to: "/admin_dashboard1", icon: <DashboardIcon fontSize="large" /> },
    { label: "Student Requirements", to: "/student_requirements", icon: <AssignmentIcon fontSize="large" /> },
    { label: "Entrance Exam Room Assignment", to: "/assign_entrance_exam", icon: <MeetingRoomIcon fontSize="large" /> },
    { label: "Entrance Exam Schedule Management", to: "/assign_schedule_applicant", icon: <ScheduleIcon fontSize="large" /> },
    { label: "Examination Profile", to: "/registrar_examination_profile", icon: <PersonSearchIcon fontSize="large" /> },
    { label: "Proctor's Applicant List", to: "/proctor_applicant_list", icon: <PeopleIcon fontSize="large" /> },
    { label: "Entrance Examination Scores", to: "/applicant_scoring", icon: <FactCheckIcon fontSize="large" /> },
  ];


  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(3);
  const [clickedSteps, setClickedSteps] = useState(Array(tabs.length).fill(false));


  const handleStepClick = (index, to) => {
    setActiveStep(index);
    navigate(to); // this will actually change the page
  };

  const [day, setDay] = useState("");
  const [roomId, setRoomId] = useState("");            // store selected room_id
  const [rooms, setRooms] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [roomQuota, setRoomQuota] = useState("");
  const [proctor, setProctor] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [roomName, setRoomName] = useState("");
  const [buildingName, setBuildingName] = useState("");




  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/room_list");

        setRooms(res.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setMessage("Could not load rooms. Check backend /room_list.");
      }
    };
    fetchRooms();
  }, []);

  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get("http://localhost:5000/exam_schedules_with_count");
        setSchedules(res.data);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    fetchSchedules();
  }, []);

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageId = 12;

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

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setMessage("");

    const sel = rooms.find((r) => String(r.room_id) === String(roomId));
    if (!sel) {
      setMessage("Please select a valid building and room.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/insert_exam_schedule", {
        day_description: day,
        building_description: sel.building_description,
        room_description: sel.room_description,
        start_time: startTime,
        end_time: endTime,
        proctor,
        room_quota: roomQuota || 40,
      });

      // ✅ Success
      setMessage("Entrance Exam schedule saved successfully ✅");
      setDay("");
      setRoomId("");
      setRoomName("");
      setStartTime("");
      setEndTime("");
      setProctor("");
      setRoomQuota("");

      // 🔄 Refresh schedules so conflicts and occupancy counts update
      const res = await axios.get("http://localhost:5000/exam_schedules_with_count");
      setSchedules(res.data);

    } catch (err) {
      console.error("Error saving schedule:", err);

      if (err.response && err.response.data && err.response.data.error) {
        // Show backend error (like conflict)
        setMessage(err.response.data.error);
      } else {
        setMessage("Failed to save schedule ❌");
      }
    }
  };

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

  return (
    <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent" }}>

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
          ENTRANCE EXAM ROOM ASSIGNMENT
        </Typography>


      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />

      <br />


      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "nowrap", // ❌ prevent wrapping
          width: "100%",
          mt: 3,
          gap: 2,
        }}
      >
        {tabs.map((tab, index) => (
          <Card
            key={index}
            onClick={() => handleStepClick(index, tab.to)}
            sx={{
              flex: `1 1 ${100 / tabs.length}%`, // evenly divide row
              height: 120,
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
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ fontSize: 40, mb: 1 }}>{tab.icon}</Box>
              <Typography sx={{ fontSize: 14, fontWeight: "bold", textAlign: "center" }}>
                {tab.label}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        width="100%"
        mt={3}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 500,
            width: "100%",
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "3px solid maroon", // keep the maroon border
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={2}
            textAlign="center"
            color="maroon"
          >
            ADD SCHEDULE
          </Typography>

          <form onSubmit={handleSaveSchedule}>
            <Grid container spacing={2}>

              {/* Exam Date */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  Exam Date
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  type="date"
                  name="examDate"
                  required
                  value={day || ""}
                  onChange={(e) => setDay(e.target.value)}
                />
              </Grid>

              {/* Building */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  Building
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="medium"
                  variant="outlined"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                >
                  {[...new Set(
                    rooms
                      .map(r => r.building_description)
                      .filter(b => b && b.trim() !== "")
                  )].map((b, i) => (
                    <MenuItem key={i} value={b}>{b}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Room */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  Room
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="medium"
                  variant="outlined"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                >
                  {rooms
                    .filter(r => r.building_description === buildingName || !buildingName)
                    .map(room => (
                      <MenuItem key={room.room_id} value={room.room_id}>
                        {room.room_description}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>

              {/* Start Time */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  Start Time
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  inputProps={{ step: 300 }}
                  required
                />
              </Grid>

              {/* End Time */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  End Time
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  inputProps={{ step: 300 }}
                  required
                />
              </Grid>

              {/* Proctor */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  Proctor
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  value={proctor}
                  onChange={(e) => setProctor(e.target.value)}
                  required
                  placeholder="Enter Proctor Name"
                />
              </Grid>

              {/* Room Quota */}
              <Grid item xs={12}>
                <Typography fontWeight={500} mb={0.5}>
                  Room Quota
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  type="number"
                  value={roomQuota}
                  onChange={(e) => setRoomQuota(e.target.value)}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#800000",
                    "&:hover": { bgcolor: "#a00000" },
                    px: 6,
                    py: 1.5,
                    mt: 2,
                    borderRadius: 2,
                  }}
                >
                  Save Schedule
                </Button>
              </Grid>

              {/* Message */}
              {message && (
                <Grid item xs={12}>
                  <Typography textAlign="center" color="maroon">
                    {message}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </form>

        </Paper>
      </Box>
    </Box>
  );
};

export default AssignEntranceExam;

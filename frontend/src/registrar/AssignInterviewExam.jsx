import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Grid, MenuItem, TextField, Typography, Paper, Card } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import Unauthorized from "../components/Unauthorized";

import { useNavigate } from "react-router-dom";

const AssignInterviewExam = () => {
    const tabs = [
            { label: "Admission Process For College", to: "/applicant_list", icon: <SchoolIcon fontSize="large" /> },
        { label: "Applicant Form", to: "/registrar_dashboard1", icon: <AssignmentIcon fontSize="large" /> },
        { label: "Student Requirements", to: "/registrar_requirements", icon: <AssignmentTurnedInIcon fontSize="large" /> },
        { label: "Interview Room Assignment", to: "/assign_interview_exam", icon: <MeetingRoomIcon fontSize="large" /> },
        { label: "Interview Schedule Management", to: "/assign_schedule_applicants_interview", icon: <ScheduleIcon fontSize="large" /> },
        { label: "Interviewer Applicant's List", to: "/interviewer_applicant_list", icon: <PeopleIcon fontSize="large" /> },
        { label: "Qualifying Exam Score", to: "/qualifying_exam_scores", icon: <PersonSearchIcon fontSize="large" /> },
        { label: "Student Numbering", to: "/student_numbering_per_college", icon: <DashboardIcon fontSize="large" /> },
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
    const [interviewer, setInterviewer] = useState("");
    const [roomNo, setRoomNo] = useState("");
    const [roomName, setRoomName] = useState("");
    const [buildingName, setBuildingName] = useState("");




    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axios.get("http://localhost:5000/room_list");
                // expect res.data = [{ room_id: 1, room_description: "Room A" }, ...]
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
                const res = await axios.get("http://localhost:5000/interview_schedules_with_count");

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
    const pageId = 14;

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
            await axios.post("http://localhost:5000/insert_interview_schedule", {
                day_description: day,
                building_description: sel.building_description,
                room_description: sel.room_description,
                start_time: startTime,
                end_time: endTime,
                interviewer,
                room_quota: roomQuota || 40,
            });

            // ✅ Success
            setMessage("Interview schedule saved successfully ✅");
            setDay("");
            setRoomId("");
            setStartTime("");
            setEndTime("");
            setInterviewer("");
            setRoomQuota("");

            // 🔄 Refresh schedules
            const res = await axios.get("http://localhost:5000/interview_schedules_with_count");
            setSchedules(res.data);

        } catch (err) {
            console.error("Error saving schedule:", err);

            if (err.response && err.response.data && err.response.data.error) {
                // ✅ Display backend-provided error (like conflict)
                setMessage(err.response.data.error);
            } else {
                setMessage("Failed to save schedule ❌");
            }
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
                    INTERVIEW ROOM ASSIGNMENT
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
                        <Grid container spacing={1}>
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

                            {/* Interviewer */}
                            <Grid item xs={12}>
                                <Typography fontWeight={500} mb={0.5}>
                                    Interviewer
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="medium"
                                    value={interviewer}
                                    onChange={(e) => setInterviewer(e.target.value)}
                                    required
                                    placeholder="Enter Interviewer Name"
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

export default AssignInterviewExam;

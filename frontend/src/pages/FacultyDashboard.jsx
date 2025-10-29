import React, {useState, useEffect} from "react";
import '../styles/TempStyles.css';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import { Dialog } from "@mui/material";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import PersonIcon from "@mui/icons-material/Person";
import {Link} from "react-router-dom";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const FacultyDashboard = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [personData, setPerson] = useState({
    prof_id: "",
    lname: "",
    fname: "",
    mname: "",
    profile_image: "",
  });
  const [openImage, setOpenImage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole !== "faculty") {
        window.location.href = "/dashboard";
      } else {
        fetchPersonData(storedID);
      }
    } else {
      window.location.href = "/login";
    }
  }, []);
  
const fetchPersonData = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/get_prof_data/${id}`)
      const first = res.data[0];
      const profInfo = {
        prof_id: first.prof_id,
        fname: first.fname,
        mname: first.mname,
        lname: first.lname,
        profile_image: first.profile_image,
      };
      setPerson(profInfo);
    } catch (err) {
        setMessage("Error Fetching Professor Personal Data");
    }
  }


const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/announcements/faculty");
        setAnnouncements(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements]);

    const [date, setDate] = useState(new Date());
  
    const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  
    const year = date.getFullYear();
    const month = date.getMonth();
  
    // Get today's date in Manila timezone (UTC+8)
    const now = new Date();
    const manilaDate = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    const today = manilaDate.getDate();
    const thisMonth = manilaDate.getMonth();
    const thisYear = manilaDate.getFullYear();
  
    // First day of the month
    const firstDay = new Date(year, month, 1).getDay();
    // Total days in the month
    const totalDays = new Date(year, month + 1, 0).getDate();
  
    // Build weeks array
    const weeks = [];
    let currentDay = 1 - firstDay;
  
    while (currentDay <= totalDays) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        if (currentDay > 0 && currentDay <= totalDays) {
          week.push(currentDay);
        } else {
          week.push(null);
        }
        currentDay++;
      }
      weeks.push(week);
    }
  
    // Handle month navigation
    const handlePrevMonth = () => {
      setDate(new Date(year, month - 1, 1));
    };
  
    const handleNextMonth = () => {
      setDate(new Date(year, month + 1, 1));
    };

    const [holidays, setHolidays] = useState({});

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
        const lookup = {};
        res.data.forEach(h => {
          lookup[h.date] = h;
        });
        setHolidays(lookup);
      } catch (err) {
        console.error("❌ Failed to fetch PH holidays:", err);
        setHolidays({});
      }
    };

    fetchHolidays();
  }, [year]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Box sx={{ p: 4, marginLeft: "-2rem", paddingRight: 8, height: "calc(100vh - 150px)", overflowY: "auto" }}>
      <Grid item xs={12}>
          <Card sx={{
            borderRadius: 1, boxShadow: 3, p: 1, border: "2px solid maroon", height: "130px", transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: 6,

            },
            marginLeft: "10px"
          }}>
            <CardContent>
              {/* Header Row */}
              <Stack
                direction="row"
                alignItems="center"

                justifyContent="space-between" // Pushes date to right
                mb={2}
              >
                {/* Left side: Avatar + Name */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  {!personData?.profile_image ? (
                    <PersonIcon sx={{ color: "maroon" }} fontSize="large" />
                  ) : (
                    <Avatar
                      src={`http://localhost:5000/uploads/${personData.profile_image}`}
                      sx={{ width: 80, height: 80, border: "2px solid maroon" }}
                    />
                  )}
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="maroon">
                      Welcome back! {personData.lname}, {personData.fname} {personData.mname}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Employee ID. : 
                    </Typography>
                  </Box>
                </Stack>

                {/* Right side: Date */}
                <Typography
                  variant="body3"
                  color="#000000"
                  sx={{ fontWeight: 500, marginTop: "-10px" }}
                >
                  Date: {formattedDate}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      <Box style={{display: "flex", gap: "1rem" ,marginTop: "1rem"}}>
        <Grid item xs="auto">
          <Card
            sx={{
              borderRadius: 3,
              marginLeft: "10px",
              boxShadow: 3,
              p: 2,
              width: "71.2rem",
              height: "615px",
              border: "2px solid #800000",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Typography sx={{ textAlign: "center", marginTop: "-1rem"}} variant="h6" gutterBottom>
                Announcements
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {announcements.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  No active announcements.
                </Typography>
                ) : (
                  <Box sx={{ position: "relative", height: "31rem", overflow: "hidden" }}>
                    {/* Display current announcement */}
                    {announcements.length > 0 && (
                      <Box
                        key={announcements[currentIndex].id}
                        sx={{
                          transition: "opacity 0.6s ease",
                          opacity: 1,
                          position: "absolute",
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "maroon", fontWeight: "bold" }}
                        >
                          {announcements[currentIndex].title}
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {announcements[currentIndex].content}
                        </Typography>

                        {announcements[currentIndex].file_path && (
                          <>
                            <img
                              src={`http://localhost:5000/uploads/${announcements[currentIndex].file_path}`}
                              alt={announcements[currentIndex].title}
                              style={{
                                width: "100%",
                                maxHeight: "25rem",
                                objectFit: "cover",
                                borderRadius: "6px",
                                marginBottom: "6px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setOpenImage(
                                  `http://localhost:5000/uploads/${announcements[currentIndex].file_path}`
                                )
                              }
                            />
                            <Dialog
                            open={Boolean(openImage)}
                            onClose={() => setOpenImage(null)}
                            fullScreen
                            PaperProps={{
                              style: {
                                backgroundColor: "transparent", // fully transparent background
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                                boxShadow: "none",
                                cursor: "pointer", // indicate clickable outside
                              },
                            }}
                          >
                            {/* Clicking outside image closes dialog */}
                            <Box
                              onClick={() => setOpenImage(null)}
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                zIndex: 1,
                              }}
                            />
                            {/* 🔙 Back Button on Top-Left */}
                            <IconButton
                              onClick={() => setOpenImage(null)}
                              sx={{
                                position: "absolute",
                                top: 20,
                                left: 20,
                                backgroundColor: "white",
                                width: 55,
                                height: 55,
                                padding: "5px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 2, // above clickable backdrop
                                "&:hover": { backgroundColor: "#f5f5f5" },
                              }}
                            >
                              <KeyboardBackspaceIcon sx={{ fontSize: 40, color: "black" }} />
                            </IconButton>
                            {/* Fullscreen Image */}
                            <Box
                              onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
                              sx={{
                                position: "relative",
                                zIndex: 2,
                                display: "flex",  
                                justifyContent: "center",
                                alignItems: "center",
                                maxWidth: "100%",
                                maxHeight: "100%",
                              }}
                            >
                              <img
                                src={openImage}
                                alt="Preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "90%",
                                  objectFit: "contain",
                                }}
                              />
                            </Box>
                          </Dialog>
                          </>
                        )}

                        <Typography variant="caption" color="text.secondary">
                          Expires:{" "}
                          {new Date(
                            announcements[currentIndex].expires_at
                          ).toLocaleDateString("en-US")}
                        </Typography>
                      </Box>
                    )}

                    {/* Navigation Buttons */}
                    {announcements.length > 1 && (
                      <>
                        <IconButton
                          onClick={() =>
                            setCurrentIndex(
                              (prev) => (prev - 1 + announcements.length) % announcements.length
                            )
                          }
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: 10,
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(255,255,255,0.8)",
                            "&:hover": { backgroundColor: "#fff" },
                          }}
                        >
                          <KeyboardBackspaceIcon sx={{ color: "maroon", fontSize: 28 }} />
                        </IconButton>

                        <IconButton
                          onClick={() =>
                            setCurrentIndex((prev) => (prev + 1) % announcements.length)
                          }
                          sx={{
                            position: "absolute",
                            top: "50%",
                            right: 10,
                            transform: "translateY(-50%) rotate(180deg)",
                            backgroundColor: "rgba(255,255,255,0.8)",
                            "&:hover": { backgroundColor: "#fff" },
                          }}
                        >
                          <KeyboardBackspaceIcon sx={{ color: "maroon", fontSize: 28 }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Box>
          <Grid item xs="auto">
            <Card
              sx={{
                border: "2px solid maroon",
                marginLeft: "10px",
                boxShadow: 3,
                p: 2,
                width: "425px",
                height: "335px",
                transition: "transform 0.2s ease",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.03)" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ p: 0, width: "100%" }}>
                {/* Header with month + year + arrows */}
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor: "maroon",
                    color: "white",
                    borderRadius: "6px 6px 0 0",
                    padding: "4px 8px",
                  }}
                >
                  <Grid item>
                    <IconButton size="small" onClick={handlePrevMonth} sx={{ color: "white" }}>
                      <ArrowBackIos fontSize="small" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {date.toLocaleString("default", { month: "long" })} {year}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton size="small" onClick={handleNextMonth} sx={{ color: "white" }}>
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
                {/* Days of Week */}
                <Divider />
                <Grid container spacing={0.5} sx={{ mt: 1 }}>
                  {days.map((day, idx) => (
                    <Grid item xs key={idx}>
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                {/* Dates */}
                {weeks.map((week, i) => (
                  <Grid container spacing={0.5} key={i}>
                    {week.map((day, j) => {
                      if (!day) {
                        return <Grid item xs key={j}></Grid>;
                      }
                      const isToday = day === today && month === thisMonth && year === thisYear;
                      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isHoliday = holidays[dateKey];
                      return (
                        <Grid item xs key={j}>
                          <Typography
                            variant="body2"
                            align="center"
                            sx={{
                              color: isToday ? "white" : "black",
                              backgroundColor: isToday
                                ? "maroon"
                                : isHoliday
                                  ? "#E8C999"
                                  : "transparent",
                              borderRadius: "50%",
                              width: 45,
                              height: 38,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: isHoliday ? "bold" : "500",
                              margin: "0 auto",
                            }}
                            title={isHoliday ? isHoliday.localName : ""}
                          >
                            {day}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs="auto">
            <Card
              sx={{
                border: "2px solid maroon",
                marginLeft: "10px",
                boxShadow: 3,
                p: 2,
                width: "425px",
                height: "260px",
                marginTop: "1rem",
                transition: "transform 0.2s ease",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.03)" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <CardContent sx={{ p: 0, width: "100%", height: "100%"}}>
                <Box
                  sx={{
                    textAlign: "center",
                    backgroundColor: "maroon",
                    color: "white",
                    borderRadius: "6px 6px 0 0",
                    padding: "4px 8px",
                    fontWeight: "bold",
                  }}>
                  Workload
                </Box>
                <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}>
                  <Link to={"/faculty_workload"}>
                    <Button style={{background: "maroon", color: "white", padding: "15px 20px"}}>
                      Open My Workload
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default FacultyDashboard;

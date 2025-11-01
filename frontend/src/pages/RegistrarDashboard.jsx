import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  IconButton,
  Select,
  InputLabel,
  Avatar,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import AddIcon from "@mui/icons-material/Add";
import ExaminationProfile from "../registrar/ExaminationProfile";


const Dashboard = () => {
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [professorCount, setProfessorCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [yearLevelCounts, setYearLevelCounts] = useState([]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole !== "registrar") {
        window.location.href = "/applicant_dashboard";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/enrolled-count")
      .then(res => setEnrolledCount(res.data.total))
      .catch(err => console.error("Failed to fetch enrolled count", err));

    axios.get("http://localhost:5000/api/professors")
      .then(res => setProfessorCount(Array.isArray(res.data) ? res.data.length : 0))
      .catch(err => console.error("Failed to fetch professor count", err));

    axios.get("http://localhost:5000/api/accepted-students-count")
      .then(res => setAcceptedCount(res.data.total))
      .catch(err => console.error("Failed to fetch accepted count", err));

    axios.get("http://localhost:5000/api/departments")
      .then(res => setDepartments(res.data))
      .catch(err => console.error("Failed to fetch departments", err));
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      axios.get(`http://localhost:5000/statistics/student_count/department/${selectedDepartment}`)
        .then(res => setStudentCount(res.data.count))
        .catch(err => console.error("Failed to fetch student count", err));

      axios.get(`http://localhost:5000/statistics/student_count/department/${selectedDepartment}/by_year_level`)
        .then(res => setYearLevelCounts(res.data))
        .catch(err => console.error("Failed to fetch year level counts", err));
    }
  }, [selectedDepartment]);

  const stats = [
    {
      label: "Total Applicants",
      value: enrolledCount,
      icon: <GroupIcon fontSize="large" />,
      color: "#F6D167",
    },
    {
      label: "Enrolled Students",
      value: acceptedCount,
      icon: <SchoolIcon fontSize="large" />,
      color: "#84B082",
    },
    {
      label: "Professors",
      value: professorCount,
      icon: <PersonIcon fontSize="large" />,
      color: "#A3C4F3",
    },
  ];

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
  }, [year]);  // 👈 refetch when year changes

  const [monthlyApplicants, setMonthlyApplicants] = useState([]);


  // After fetching monthlyApplicants from API
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/applicants-per-month")
      .then((res) => {
        const currentYear = new Date().getFullYear();

        // Build an array for all 12 months of the current year
        const months = Array.from({ length: 12 }, (_, i) => {
          const month = String(i + 1).padStart(2, "0"); // 01 → 12
          return `${currentYear}-${month}`;
        });

        // Merge API data with all months
        const filledData = months.map((m) => {
          const found = res.data.find((item) => item.month === m);
          return found ? found : { month: m, total: 0 };
        });

        setMonthlyApplicants(filledData);
      })
      .catch((err) =>
        console.error("Failed to fetch applicants per month", err)
      );
  }, []);


  const [personData, setPersonData] = useState(null);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const person_id = localStorage.getItem("person_id");
    const role = localStorage.getItem("role");

    if (person_id && role) {
      axios
        .get(`http://localhost:5000/api/person_data/${person_id}/${role}`)
        .then((res) => setPersonData(res.data))
        .catch((err) => console.error("Failed to fetch person data:", err));
    }
  }, []);

 const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // ✅ Get the logged-in role (registrar, admin, etc.)
    const role = localStorage.getItem("role");

    // ✅ Get the registrar’s user_account_id using person_id
    const accountRes = await axios.get(
      `http://localhost:5000/api/get_user_account_id/${personData.person_id}`
    );
    const user_account_id = accountRes.data.user_account_id;

    const formData = new FormData();
    formData.append("profile_picture", file);

    // ✅ Use your backend route
    await axios.post(
      `http://localhost:5000/update_registrar/${user_account_id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // ✅ Refresh the data (using correct role)
    const refreshed = await axios.get(
      `http://localhost:5000/api/person_data/${personData.person_id}/${role}`
    );
    setPersonData(refreshed.data);

    console.log("✅ Profile updated successfully!");
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
};


  return (
    <Box
      sx={{
        p: 4,
        marginLeft: "-2rem",
        paddingRight: 8,
        height: "calc(100vh - 150px)",
        overflowY: "auto",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              border: "2px solid maroon",
              boxShadow: 3,
              height: "140px",
              marginLeft: "10px",
              p: 2,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">

                {/* 👤 Left Section - Avatar + Welcome */}
                <Box display="flex" alignItems="center">

                  {/* Avatar */}
                  <Box
                    position="relative"
                    display="inline-block"
                    mr={2}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                  >
                    <Avatar
                      src={
                        personData?.profile_image
                          ? `http://localhost:5000/uploads/${personData.profile_image}`
                          : undefined
                      }
                      alt={personData?.fname}
                      sx={{
                        width: 90,
                        height: 90,
                        border: "2px solid maroon",
                        cursor: "pointer",
                        mt: -1.5,
                      }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      {personData?.fname?.[0]}
                    </Avatar>

                    {/* Hover upload button */}
                    {hovered && (
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          bgcolor: "maroon",
                          color: "white",
                          "&:hover": { bgcolor: "#6D2323" },
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    )}

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </Box>

                  {/* Welcome text and Employee info */}
                  <Box sx={{ color: "maroon" }}>
                    <Typography variant="h4" fontWeight="bold" mt={-1}>
                      Welcome back!  {personData
                        ? `${personData.lname}, ${personData.fname} ${personData.mname || ""}`
                        : ""}
                    </Typography>

                    <Typography variant="body1" color="black" fontSize={20}>
                      <b>Employee ID:</b> {personData?.employee_id || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* 📅 Right Section - Date */}
                <Box textAlign="right" sx={{ color: "black" }}>
                  <Typography variant="body1" fontSize="20px">
                    {formattedDate}
                  </Typography>
                </Box>

              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>




      {/* Stats Section */}
      <Grid container spacing={1}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} mt={2} key={i}>
            <Card
              sx={{
                display: "flex",
                border: "2px solid maroon",
                alignItems: "center",
                marginLeft: "10px",
                backgroundColor: "#fef9e1",

                height: "100px",
                p: 3,
                borderRadius: 3,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.03)" },
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",

                  backgroundColor: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="maroon" fontSize={20} fontWeight={1200}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Department Section */}
      <Grid container spacing={3} sx={{ mt: 6 }}>
        {/* Department Overview Title */}
        <Grid item xs={12}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ color: "maroon", fontWeight: "bold", textAlign: "center", marginLeft: "-210px", marginTop: "-50px" }}
          >
            Department Overview
          </Typography>
        </Grid>

        {/* Calendar Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              border: "2px solid maroon",
              marginLeft: "10px",
              boxShadow: 3,
              p: 2,
              width: 480,
              height: 325,
              marginTop: "-70px",
              display: "flex",
              transition: "transform 0.2s ease",
              boxShadow: 3,
              "&:hover": { transform: "scale(1.03)" },
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

              <Divider />
              <Grid container spacing={0.5} sx={{ mt: 1 }}>
                {days.map((day, idx) => (
                  <Grid item xs key={idx}>
                    <Typography variant="body2" align="center" sx={{ fontWeight: "bold", }}>
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {weeks.map((week, i) => (
                <Grid container spacing={0.5} key={i}>
                  {week.map((day, j) => {
                    if (!day) return <Grid item xs key={j}></Grid>;

                    const isToday = day === today && month === thisMonth && year === thisYear;
                    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                      day
                    ).padStart(2, "0")}`;
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

          {/* Applicants Per Month */}
          <Grid item xs={12} md={12} sx={{ mt: 5 }}>
            <Card
              sx={{
                p: 2,
                marginLeft: "10px",
                marginTop: "-20px",
                borderRadius: 3,
                width: 480,
                height: 290,
                border: "2px solid maroon",
                transition: "transform 0.2s ease",
                boxShadow: 3,
                "&:hover": { transform: "scale(1.03)" },
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ height: "100%", p: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={1}
                  sx={{ color: "maroon", pl: 2, pt: 2 }}
                >
                  Applicants Per Month
                </Typography>

                {/* Chart takes the rest of card height */}
                <Box sx={{ height: "calc(100% - 40px)", px: 2, pb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyApplicants}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(month) => {
                          const [year, m] = month.split("-");
                          return new Date(`${year}-${m}-01`).toLocaleString("default", {
                            month: "short",
                          });
                        }}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total">
                        {monthlyApplicants.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              "#FF0000",
                              "#00C853",
                              "#2196F3",
                              "#FFD600",
                              "#FF6D00",
                            ][index % 5]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>


        </Grid>


        {/* Department Select */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 1,
              borderRadius: 3,
              border: "2px solid maroon",
              height: 600,
              backgroundColor: "#f1f1f1",
              marginTop: "-30px",
              transition: "transform 0.2s ease",
              boxShadow: 3,
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            <CardContent>
              <Typography fontWeight="bold" mb={2}>
                Select Department
              </Typography>
              <FormControl
                style={{ border: "2px solid maroon", borderRadius: "5px", backgroundColor: "white" }}
                fullWidth
              >
                <InputLabel>Select Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Select Department"
                >
                  <MenuItem value="">
                    <em>- Select -</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.dprtmnt_id} value={dept.dprtmnt_id}>
                      {dept.dprtmnt_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Student Summary */}
        {/* Student Summary */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 1,
              borderRadius: 3,
              border: "2px solid maroon",
              height: 600,
              backgroundColor: "#f1f1f1",
              marginTop: "-30px",
              transition: "transform 0.2s ease",
              boxShadow: 3,
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            <CardContent>
              <Typography fontWeight="bold" mb={2}>
                Student Summary
              </Typography>

              {/* Styled like a TextField */}
              <Box
                sx={{
                  border: "2px solid maroon",
                  borderRadius: "5px",
                  height: "58px",
                  display: "flex",              // flexbox for alignment
                  alignItems: "center",         // vertical center
                  px: 2,                        // padding left/right
                  mb: 2,
                  bgcolor: "white",             // same as TextField background
                }}
              >
                <Typography variant="body1">
                  Total Enrolled Students:{" "}
                  <Typography component="span" fontWeight="bold" color="primary">
                    {selectedDepartment ? studentCount : "—"}
                  </Typography>
                </Typography>
              </Box>

              {yearLevelCounts.length > 0 ? (
                yearLevelCounts.map((item) => (
                  <Typography key={item.year_level_id} variant="body2" mb={1}>
                    {item.year_level_description}:{" "}
                    <Typography component="span" fontWeight="bold" color="maroon">
                      {item.student_count}
                    </Typography>
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No year level data available.
                </Typography>


              )}
              <Typography variant="body2" color="textSecondary">
                Regular Students:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Irregular Students:
              </Typography>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

    </Box>
  );
};

export default Dashboard;

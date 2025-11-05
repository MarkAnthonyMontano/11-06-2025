import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dashboard,
  Apartment,
  Business,
  LibraryBooks,
  People,
  LogoutOutlined,
  Settings,
  AccountCircle,
  AccountCircleOutlined,
  Token,
} from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LockResetIcon from "@mui/icons-material/LockReset";
import { HistoryOutlined } from "@mui/icons-material";
import "../styles/SideBar.css";
import { Avatar, Typography } from "@mui/material";
import axios from "axios";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GradeIcon from "@mui/icons-material/Grade";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PersonIcon from "@mui/icons-material/Person";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddCircleIcon from "@mui/icons-material/AddCircle";


const SideBar = ({ setIsAuthenticated, profileImage, setProfileImage }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [personData, setPersonData] = useState({
    profile_image: "",
    fname: "",
    lname: "",
    role: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (token && savedRole && storedID) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("person_id");
          setIsAuthenticated(false);
          navigate("/");
        } else {
          setRole(savedRole); // ✅ Load from saved value
          fetchPersonData(storedID, savedRole);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.log("Token decode error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsAuthenticated(false);
        navigate("/");
      }
    } else {
      console.log("Missing token or role");
      setIsAuthenticated(false);
      navigate("/");
    }
  }, []);

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/");
  };

  const fetchPersonData = async (person_id, role) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/person_data/${person_id}/${role}`
      );
      setPersonData(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div className="h-full w-enough hidden-print">
      <ul className="bg-white h-full border-r-[3px] border-maroon-500 p-3 px-5 text-maroon-500 w-full gap-2 ">
        <div className="flex items-center flex-col mt-24 mb-4 relative">
          {/* 🧑 Profile Picture */}
          {!personData?.profile_image ? (
            <Avatar
              sx={{
                width: 106,
                height: 106,
                border: "3px solid maroon",
                color: "maroon",
                bgcolor: "transparent",
                marginBottom: "25px",
              }}
            />
          ) : (
            <Avatar
              src={profileImage || `http://localhost:5000/uploads/${personData.profile_image}`}
              sx={{
                width: 116,
                height: 116,
                mx: "auto",
                border: "maroon 2px solid",
              }}
            />
          )}

          {/* ➕ Plus Icon Overlay */}
          {role === "registrar" && (
            <>
              <label
                htmlFor="sidebar-profile-upload"
                style={{
                  position: "absolute",
                  bottom: "64px",
                  right: "calc(50% - 55px)",
                  cursor: "pointer",
                }}
              >
                <AddCircleIcon
                  sx={{
                    color: "#800000",
                    fontSize: 32,
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
              </label>
              <input
                id="sidebar-profile-upload"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  try {
                    const person_id = localStorage.getItem("person_id");
                    const role = localStorage.getItem("role");

                    // ✅ Get user_account_id
                    const res = await axios.get(
                      `http://localhost:5000/api/get_user_account_id/${person_id}`
                    );
                    const user_account_id = res.data.user_account_id;

                    const formData = new FormData();
                    formData.append("profile_picture", file);

                    // ✅ Upload image using same backend API
                    await axios.post(
                      `http://localhost:5000/update_registrar/${user_account_id}`,
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    // ✅ Refresh profile info to display the new image
                    const updated = await axios.get(
                      `http://localhost:5000/api/person_data/${person_id}/${role}`
                    );
                    setPersonData(updated.data);
                    const baseUrl = `http://localhost:5000/uploads/${updated.data.profile_image}`;
                    setProfileImage(`${baseUrl}?t=${Date.now()}`);
                  } catch (error) {
                    console.error("❌ Upload failed:", error);
                  }
                }}
                style={{ display: "none" }}
              />
            </>
          )}
          {role === "applicant" && (
            <>
              <label
                htmlFor="sidebar-profile-upload"
                style={{
                  position: "absolute",
                  bottom: "64px",
                  right: "calc(50% - 55px)",
                  cursor: "pointer",
                }}
              >
                <AddCircleIcon
                  sx={{
                    color: "#800000",
                    fontSize: 32,
                    backgroundColor: "white",
                    borderRadius: "50%",
                  }}
                />
              </label>
              <input
                id="sidebar-profile-upload"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  try {
                    const person_id = localStorage.getItem("person_id");
                    const role = localStorage.getItem("role");

                    // ✅ Get user_account_id
                    const res = await axios.get(
                      `http://localhost:5000/api/get_applicant_account_id/${person_id}`
                    );
                    const user_account_id = res.data.user_account_id;

                    const formData = new FormData();
                    formData.append("profile_picture", file);

                    // ✅ Upload image using same backend API
                    await axios.post(
                      `http://localhost:5000/update_applicant/${user_account_id}`,
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } }
                    );

                    // ✅ Refresh profile info to display the new image
                    const updated = await axios.get(
                      `http://localhost:5000/api/person_data/${person_id}/${role}`
                    );
                    setPersonData(updated.data);
                    fetchPersonData(person_id, role);
                    
                    const baseUrl = `http://localhost:5000/uploads/${updated.data.profile_image}`;
                    setProfileImage(`${baseUrl}?t=${Date.now()}`);
                  } catch (error) {
                    console.error("❌ Upload failed:", error);
                  }
                }}
                style={{ display: "none" }}
              />
            </>
          )}

          {/* 👤 Role + Name Display */}
          {role === "registrar" && (
            <span className="mt-4 text-center">
              {personData && (personData.fname || personData.lname) ? (
                <>
                  <Typography variant="h6">
                    {personData.fname} {personData.lname}
                  </Typography>
                  <Typography variant="body2" color="maroon">
                    {personData.role.charAt(0).toUpperCase() +
                      personData.role.slice(1)}
                  </Typography>
                </>
              ) : (
                <span>Administrator</span>
              )}
            </span>
          )}
          {role === "applicant" && (
            <span className="mt-4 text-center">
              {personData && (personData.fname || personData.lname) ? (
                <>
                  <Typography variant="h6">
                    {personData.fname} {personData.lname}
                  </Typography>
                  <Typography variant="body2" color="maroon">
                    {personData.role.charAt(0).toUpperCase() +
                      personData.role.slice(1)}
                  </Typography>
                </>
              ) : (
                <span>Applicant</span>
              )}
            </span>
          )}
          {role === "faculty" && (
            <span className="mt-4 text-center">
              {personData && (personData.fname || personData.lname) ? (
                <>
                  <Typography variant="h6">
                    {personData.fname} {personData.lname}
                  </Typography>
                  <Typography variant="body2" color="maroon">
                    {personData.role.charAt(0).toUpperCase() +
                      personData.role.slice(1)}
                  </Typography>
                </>
              ) : (
                <span>Faculty</span>
              )}
            </span>
          )}
          {role === "student" && (
            <span className="mt-4 text-center">
              {personData && (personData.fname || personData.lname) ? (
                <>
                  <Typography variant="h6">
                    {personData.fname} {personData.lname}
                  </Typography>
                  <Typography variant="body2" color="maroon">
                    {personData.role.charAt(0).toUpperCase() +
                      personData.role.slice(1)}
                  </Typography>
                </>
              ) : (
                <span>Student</span>
              )}
            </span>
          )}
        </div>

        <br />
        <hr className="bg-maroon-500" />
        <br />
        {role === "registrar" && (
          <>
            <Link to="/registrar_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded button-hover ${location.pathname === "/registrar_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <Dashboard />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Dashboard
                </span>
              </li>
            </Link>

            <Link to="/admission_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/admission_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <Business />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Admission Management
                </span>
              </li>
            </Link>

            <Link to="/course_management">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/course_management"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <LibraryBooks />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Courses Management
                </span>
              </li>
            </Link>

            <Link to="/department_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/department_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <Apartment />
                <span className="pl-4 p-2 px-0 mr-2 pointer-events-none">
                  Department Management
                </span>
              </li>
            </Link>

            <Link to="/system_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/system_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <Settings />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  System Management
                </span>
              </li>
            </Link>

            <Link to="/account_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/account_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <People />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Accounts
                </span>
              </li>
            </Link>
            <Link to="/history_logs">
              <li className="w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 cursor-pointer button-hover">
                <HistoryOutlined />
                <button className="pl-4 p-2 px-0 pointer-events-none">
                  History Logs
                </button>
              </li>
            </Link>
          </>
        )}
        {role === "applicant" && (
          <>
            {/* Dashboard */}
            <Link to="/applicant_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover 
          ${location.pathname.startsWith("/applicant_dashboard")
                    ? "bg-maroon-500 text-white"
                    : ""
                  }`}
              >
                <DashboardIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Dashboard
                </span>
              </li>
            </Link>

            {/* Applicant Form */}
            <Link
              onClick={() => {
                let keys = JSON.parse(localStorage.getItem("dashboardKeys"));
                if (!keys) {
                  const generateKey = () => Math.random().toString(36).substring(2, 10);
                  keys = {
                    step1: generateKey(),
                    step2: generateKey(),
                    step3: generateKey(),
                    step4: generateKey(),
                    step5: generateKey(),
                  };
                  localStorage.setItem("dashboardKeys", JSON.stringify(keys));
                }
                window.location.href = `/dashboard/${keys.step1}`;
              }}
            >
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover 
      ${location.pathname.startsWith("/dashboard/") ? "bg-maroon-500 text-white" : ""}
    `}
              >
                <AssignmentIndIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">Applicant Form</span>
              </li>
            </Link>


            {/* Upload Requirements */}
            <Link to="/requirements_uploader">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover 
          ${location.pathname.startsWith("/requirements_uploader")
                    ? "bg-maroon-500 text-white"
                    : ""
                  }`}
              >
                <CloudUploadIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Upload Requirements
                </span>
              </li>
            </Link>

            {/* Change Password */}
            <Link to="/applicant_reset_password">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover 
          ${location.pathname.startsWith("/applicant_reset_password")
                    ? "bg-maroon-500 text-white"
                    : ""
                  }`}
              >
                <LockResetIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Change Password
                </span>
              </li>
            </Link>
          </>
        )}
        {role === "faculty" && (
          <>
            <Link to="/faculty_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded button-hover ${location.pathname === "/faculty_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <DashboardIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">Dashboard</span>
              </li>
            </Link>

            <Link to="/grading_sheet">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/grading_sheet"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <AssignmentTurnedInIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Grading Management
                </span>
              </li>
            </Link>

            <Link to="/faculty_masterlist">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/faculty_masterlist"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <ListAltIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">Class List</span>
              </li>
            </Link>

            <Link to="/faculty_workload">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/faculty_workload"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <WorkIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">Workload</span>
              </li>
            </Link>

            <Link to="/faculty_evaluation">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/faculty_evaluation"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <SchoolIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Faculty Evaluation
                </span>
              </li>
            </Link>

            <Link to="/program_evaluation">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/program_evaluation"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <AssessmentIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Program Evaluation
                </span>
              </li>
            </Link>

            <Link to="/faculty_reset_password">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/faculty_reset_password"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <LockResetIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Reset Password
                </span>
              </li>
            </Link>
          </>
        )}
        {role === "student" && (
          <>
            <Link to="/student_dashboard">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded button-hover ${location.pathname === "/student_dashboard"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <DashboardIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Dashboard
                </span>
              </li>
            </Link>

            <Link to="/student_schedule">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/student_schedule"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <EventNoteIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Schedule
                </span>
              </li>
            </Link>

            <Link to="/grades_page">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/grades_page"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <GradeIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Grades
                </span>
              </li>
            </Link>

            <Link to="/student_faculty_evaluation">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/student_faculty_evaluation"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <AssignmentTurnedInIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Faculty Evaluation
                </span>
              </li>
            </Link>

            <Link to="/student_dashboard1">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${/^\/student_dashboard[1-5]$/.test(location.pathname)
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <PersonIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Student Profile
                </span>
              </li>
            </Link>


            <Link to="/student_reset_password">
              <li
                className={`w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 button-hover ${location.pathname === "/student_reset_password"
                  ? "bg-maroon-500 text-white"
                  : ""
                  }`}
              >
                <LockResetIcon />
                <span className="pl-4 p-2 px-0 pointer-events-none">
                  Reset Password
                </span>
              </li>
            </Link>
          </>
        )}

        <li
          className="w-full flex items-center border border-maroon-500 px-2 rounded m-2 mx-0 cursor-pointer button-hover"
          onClick={Logout}
        >
          <LogoutOutlined />
          <button className="pl-4 p-2 px-0 pointer-events-none">Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
import React, { useEffect, useState } from "react";
import axios from "axios";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  CollectionsBookmark,
  School,
  Info,
  Replay,
  Description,
  Assignment,
  Schedule,
  AssignmentInd,
  ListAlt,
  Score,
  Assessment,
  MeetingRoom,
  EventAvailable,
  Group,
  LocalHospital,
  AssignmentTurnedIn,
  People,
  Transform,
  FormatListNumbered,
  Numbers,
  Class,
  Search,
  Payment,
} from "@mui/icons-material";

import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const AdmissionDashboardPanel = () => {

  // Also put it at the very top
  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");

  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);


  const pageId = 96;

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










  // Put this at the very bottom before the return 
  if (loading || hasAccess === null) {
    return <LoadingOverlay open={loading} message="Check Access" />;
  }

  if (!hasAccess) {
    return (
      <Unauthorized />
    );
  }


  // Each item: title, link, icon
  const menuItems = [
    {
      title: "ADMISSION OFFICE ",
      link: "/applicant_list_admin",
      icon: <CollectionsBookmark className="text-maroon-500 text-2xl" />,
    },
    {
      title: "ENROLLMENT OFFICER ",
      link: "/applicant_list",
      icon: <CollectionsBookmark className="text-maroon-500 text-2xl" />,
    },
    {
      title: "MEDICAL APPLICANT LIST",
      link: "/medical_applicant_list",
      icon: <People className="text-maroon-500 text-2xl" />,
    },
    {
      title: "ADMISSION PROCESS FOR REGISTRAR",
      link: "/super_admin_applicant_list",
      icon: <CollectionsBookmark className="text-maroon-500 text-2xl" />,
    },
    {
      title: "APPLICATION PROCESS FOR COLLEGE",
      link: "/applicant_list_admin",
      icon: <School className="text-maroon-500 text-2xl" />,
    },

    {
      title: "READMISSION",
      link: "/readmission_dashboard1",
      icon: <Replay className="text-maroon-500 text-2xl" />,
    },
    {
      title: "DOCUMENTS SUBMITTED",
      link: "/student_requirements",
      icon: <Description className="text-maroon-500 text-2xl" />,
    },
    {
      title: "ASSIGN ENTRANCE EXAM",
      link: "/assign_entrance_exam",
      icon: <Assignment className="text-maroon-500 text-2xl" />,
    },
    {
      title: "ASSIGN SCHEDULE TO APPLICANTS",
      link: "/assign_schedule_applicant",
      icon: <Schedule className="text-maroon-500 text-2xl" />,
    },
    {
      title: "EXAMINATION PERMIT",
      link: "/registrar_examination_profile",
      icon: <AssignmentInd className="text-maroon-500 text-2xl" />,
    },
    {
      title: "PROCTOR APPLICANT LIST",
      link: "/proctor_applicant_list",
      icon: <ListAlt className="text-maroon-500 text-2xl" />,
    },
    {
      title: "ENTRANCE EXAMINATION SCORES",
      link: "/applicant_scoring",
      icon: <Score className="text-maroon-500 text-2xl" />,
    },
    {
      title: "QUALIFYING / INTEVIEW EXAMINATION SCORES",
      link: "/qualifying_exam_scores",
      icon: <Assessment className="text-maroon-500 text-2xl" />,
    },
    {
      title: "ROOM SCHEDULING INTERVIEW EXAM",
      link: "/assign_interview_exam",
      icon: <MeetingRoom className="text-maroon-500 text-2xl" />,
    },
    {
      title: "APPLICANTS INTERVIEW SCHEDULING",
      link: "/assign_schedule_applicants_interview",
      icon: <EventAvailable className="text-maroon-500 text-2xl" />,
    },
    {
      title: "INTERVIEWER APPLICANTS LIST",
      link: "/interviewer_applicant_list",
      icon: <Group className="text-maroon-500 text-2xl" />,
    },
    {
      title: "MEDICAL REQUIREMENTS",
      link: "/medical_requirements_form",
      icon: <Group className="text-maroon-500 text-2xl" />,
    },
    {
      title: "DENTAL ASSESSMENT",
      link: "/dental_assessment",
      icon: <Group className="text-maroon-500 text-2xl" />,
    },
    {
      title: "PHYSICAL AND NEUROLOGICAL EXAM",
      link: "/physical_neuro_exam",
      icon: <Group className="text-maroon-500 text-2xl" />,
    },
    {
      title: "HEALTH RECORDS CERTIFICATE",
      link: "/health_records",
      icon: <Group className="text-maroon-500 text-2xl" />,
    },
      {
      title: "MEDICAL CERTIFICATE",
      link: "/medical_certificate",
      icon: <Group className="text-maroon-500 text-2xl" />,
    },
    {
      title: "TRANSCRIPT OF RECORDS",
      link: "/transcript_of_records",
      icon: <People className="text-maroon-500 text-2xl" />,
    },

    {
      title: "CLASS LIST",
      link: "/class_roster",
      icon: <People className="text-maroon-500 text-2xl" />,
    },
    {
      title: "REPORT OF GRADES",
      link: "/report_of_grades",
      icon: <CollectionsBookmark className="text-maroon-500 text-2xl" />,
    },
    {
      title: "TRANSFER FORM",
      link: "/admin_dashboard1",
      icon: <Transform className="text-maroon-500 text-2xl" />,
    },
    {
      title: "STUDENT NUMBERING PANEL",
      link: "/student_numbering",
      icon: <FormatListNumbered className="text-maroon-500 text-2xl" />,
    },
    {
      title: "STUDENT NUMBERING PER COLLEGE",
      link: "/student_numbering_per_college",
      icon: <Numbers className="text-maroon-500 text-2xl" />,
    },
    {
      title: "COURSE TAGGING FORM",
      link: "/course_tagging",
      icon: <Class className="text-maroon-500 text-2xl" />,
    },
    {
      title: "SEARCH STUDENT COR",
      link: "/search_cor",
      icon: <Search className="text-maroon-500 text-2xl" />,
    },
    {
      title: "PAYMENT MODULE",
      link: "/draft_load_form",
      icon: <Payment className="text-maroon-500 text-2xl" />,
    },
  ];

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        paddingRight: 1,
        backgroundColor: "transparent",
      }}
    >
      <div className="p-2 px-10 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuItems.map((item, idx) => (
          <div className="relative" key={idx}>
            <Link to={item.link}>
              <div className="bg-white p-4 border-4 rounded-lg border-solid border-maroon-500 absolute left-16 top-12 w-enough">
                {item.icon}
              </div>
              <button className="bg-white text-maroon-500 border-4 rounded-lg border-solid border-maroon-500 p-4 w-80 h-32 font-medium mr-4 mt-20 ml-8 flex items-end justify-center">
                {item.title}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default AdmissionDashboardPanel;

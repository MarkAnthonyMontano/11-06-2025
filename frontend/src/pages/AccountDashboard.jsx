import {
  ListAlt,
  PersonAdd,
  LockReset,
  People,
  AssignmentInd,
  TableChart,
  Security,
  School,
  SupervisorAccount,
  AdminPanelSettings,
  Info,
} from "@mui/icons-material";
import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

const AccountDashboard = () => {
  const menuItems = [
    {
      label: "ADD FACULTY ACCOUNTS",
      icon: <PersonAdd className="text-maroon-500 text-2xl" />,
      path: "/register_prof",
    },
    {
      label: "ADD REGISTRAR'S ACCOUNT",
      icon: <PersonAdd className="text-maroon-500 text-2xl" />,
      path: "/register_registrar",
    },
      {
      label: "ADD STUDENT'S ACCOUNT",
      icon: <PersonAdd className="text-maroon-500 text-2xl" />,
      path: "/register_student",
    },
    {
      label: "APPLICANT INFORMATION",
      path: "/super_admin_applicant_dashboard1",
      icon: <Info className="text-maroon-500 text-2xl" />,
    },
    {
      label: "STUDENT INFORMATION",
      path: "/super_admin_student_dashboard1",
      icon: <Info className="text-maroon-500 text-2xl" />,
    },
    {
      label: "DEPARTMENT SECTION PANEL",
      icon: <AssignmentInd className="text-maroon-500 text-2xl" />,
      path: "/department_section_panel",
    },
    {
      label: "USER PAGE ACCESS",
      icon: <Security className="text-maroon-500 text-2xl" />,
      path: "/user_page_access",
    },
    {
      label: "PAGE TABLE",
      icon: <TableChart className="text-maroon-500 text-2xl" />,
      path: "/page_crud",
    },
    {
      label: "RESET PASSWORD",
      icon: <LockReset className="text-maroon-500 text-2xl" />,
      path: "/registrar_reset_password",
    },
    {
      label: "APPLICANT RESET PASSWORD",
      icon: <People className="text-maroon-500 text-2xl" />,
      path: "/superadmin_applicant_reset_password",
    },
    {
      label: "STUDENT RESET PASSWORD",
      icon: <School className="text-maroon-500 text-2xl" />,
      path: "/superadmin_student_reset_password",
    },
    {
      label: "FACULTY RESET PASSWORD",
      icon: <SupervisorAccount className="text-maroon-500 text-2xl" />,
      path: "/superadmin_faculty_reset_password",
    },
    {
      label: "REGISTRAR RESET PASSWORD",
      icon: <AdminPanelSettings className="text-maroon-500 text-2xl" />,
      path: "/superadmin_registrar_reset_password",
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
    <div className="p-2 px-10 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuItems.map((item, index) => (
          <div className="relative" key={index}>
            <Link to={item.path}>
              <div className="bg-white p-4 border-4 rounded-lg border-maroon-500 absolute left-16 top-12 w-enough">
                {item.icon}
              </div>
              <button className="bg-white text-maroon-500 border-4 rounded-lg border-maroon-500 p-4 w-80 h-32 font-medium mt-20 ml-8 flex items-end justify-center">
                {item.label}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
    </Box>
  );
};

export default AccountDashboard;

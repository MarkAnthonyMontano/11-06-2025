import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material'; // ✅ Import MUI components
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

const ChangeGradingPeriod = () => {
  const [gradingPeriod, setGradingPeriod] = useState([]);

  const fetchYearPeriod = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-grading-period');
      setGradingPeriod(response.data);
    } catch (error) {
      console.error("Error in Fetching Data", error);
    }
  };

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageId = 17;

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

  useEffect(() => {
    fetchYearPeriod();
  }, []);

  const handlePeriodActivate = async (id) => {
    try {
      await axios.post(`http://localhost:5000/grade_period_activate/${id}`);
      alert("Grading period activated!");
      fetchYearPeriod();
    } catch (error) {
      console.error("Error activating grading period:", error);
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
          GRADING PERIOD
        </Typography>




      </Box>
      <hr style={{ border: "1px solid #ccc", width: "100%" }} />

      <br />


      <div style={styles.periodList}>
        {gradingPeriod.map((period) => (
          <div key={period.id} style={styles.periodItem}>
            <div style={styles.periodDescription}>{period.description}</div>
            <div style={styles.buttonContainer}>
              {period.status === 1 ? (
                <span style={styles.activatedStatus}>Activated</span>
              ) : (
                <button
                  style={styles.activateButton}
                  onClick={() => handlePeriodActivate(period.id)}
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

// ✅ Styling object
const styles = {
  container: {
    maxWidth: 900,
    margin: '30px auto',

    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  periodList: {
    marginTop: '20px',
  },
  periodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: "2px solid maroon",
    padding: '15px',
    backgroundColor: '#fff',
    margin: '20px auto',   // 🔹 auto centers horizontally
    width: "50%",
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },

  periodDescription: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#333',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  activateButton: {
    padding: '8px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  activatedStatus: {
    color: '#757575',
    fontSize: '16px',
  },
};

export default ChangeGradingPeriod;

import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Box, Typography } from "@mui/material";
import Unauthorized from "../components/Unauthorized";


const CurriculumPanel = () => {
    const [curriculum, setCurriculum] = useState({ year_id: '', program_id: '' });
    const [yearList, setYearList] = useState([]);
    const [programList, setProgramList] = useState([]);
    const [curriculumList, setCurriculumList] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');

const [userID, setUserID] = useState("");
const [user, setUser] = useState("");
const [userRole, setUserRole] = useState("");
const [hasAccess, setHasAccess] = useState(null);
const pageId = 23;

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

    useEffect(() => {
        fetchYear();
        fetchProgram();
        fetchCurriculum();
    }, []);

    const fetchYear = async () => {
        try {
            const res = await axios.get('http://localhost:5000/year_table');
            setYearList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProgram = async () => {
        try {
            const res = await axios.get('http://localhost:5000/get_program');
            setProgramList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCurriculum = async () => {
        try {
            const res = await axios.get('http://localhost:5000/get_curriculum');
            setCurriculumList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurriculum(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCurriculum = async () => {
        if (!curriculum.year_id || !curriculum.program_id) {
            alert("Please fill all fields");
            return;
        }

        try {
            await axios.post('http://localhost:5000/curriculum', curriculum);
            setCurriculum({ year_id: '', program_id: '' });
            setSuccessMsg("Curriculum successfully added!");
            fetchCurriculum();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await axios.put(`http://localhost:5000/update_curriculum/${id}`, {
                lock_status: newStatus,
            });
            fetchCurriculum(); // Refresh list
            setSuccessMsg(`Curriculum #${id} is now ${newStatus === 1 ? "Active" : "Inactive"}`);
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update curriculum status");
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
                    CURRICULUM PANEL
                </Typography>




            </Box>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />

            <br />


            <div style={styles.container}>
                {/* Left side: Form */}
                <div style={styles.panel}>
                  <h2 style={{ ...styles.header, color: "maroon", fontWeight: "bold" }}>Add Curriculum</h2>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Curriculum Year:</label>
                        <select name="year_id" value={curriculum.year_id} onChange={handleChange} style={styles.select}>
                            <option value="">Choose Year</option>
                            {yearList.map(year => (
                                <option key={year.year_id} value={year.year_id}>
                                    {year.year_description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Program:</label>
                        <select name="program_id" value={curriculum.program_id} onChange={handleChange} style={styles.select}>
                            <option value="">Choose Program</option>
                            {programList.map(program => (
                                <option key={program.program_id} value={program.program_id}>
                                    {program.program_description} | {program.program_code}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button style={styles.button} onClick={handleAddCurriculum}>Insert</button>
                    {successMsg && <p style={styles.success}>{successMsg}</p>}
                </div>

                {/* Right side: Curriculum List */}
                <div style={styles.listPanel}>
                    <h3 style={{ ...styles.listHeader, color: "maroon", fontWeight: "bold" }}>Curriculum List</h3>

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ border: "2px solid maroon" }}>ID</th>
                                <th style={{ border: "2px solid maroon" }}>Year</th>
                                <th style={{ border: "2px solid maroon" }}>Program</th>
                                <th style={{ border: "2px solid maroon" }}>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {curriculumList.map(item => (
                                <tr key={item.curriculum_id}>
                                    <td style={{ border: "2px solid maroon", textAlign: "center", width: "50px" }}>{item.curriculum_id}</td>
                                    <td style={{ border: "2px solid maroon", textAlign: "center", width: "50px" }}>{item.year_description}</td>
                                    <td style={{ border: "2px solid maroon", textAlign: "left", width: "700px" }}>{item.program_description} ({item.program_code})</td>
                                    <td style={{ border: "2px solid maroon", textAlign: "center", width: "50px" }}>
                                        <button
                                            onClick={() => handleUpdateStatus(item.curriculum_id, item.lock_status)}
                                            style={{
                                                backgroundColor: item.lock_status === 1 ? "green" : "maroon", // ✅ Maroon for inactive
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                width: "100px",        // ✅ Same width
                                                height: "36px",        // ✅ Same height
                                                fontWeight: "bold",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                transition: "0.3s ease",
                                            }}
                                            onMouseOver={e => e.target.style.opacity = "0.85"}
                                            onMouseOut={e => e.target.style.opacity = "1"}
                                        >
                                            {item.lock_status === 1 ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </Box>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        padding: '30px',
        fontFamily: 'Arial, sans-serif'
    },
    panel: {
        flex: 1,
        padding: '20px',

        borderRadius: '8px',
        backgroundColor: '#fff',
        border: "2px solid maroon",
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    },
    listPanel: {
        flex: 2,
        padding: '20px',
        borderRadius: '8px',
        border: "2px solid maroon",
        backgroundColor: '#f9f9f9',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',

    },
    header: {
        marginBottom: '20px',
        color: '#800000'
    },
    inputGroup: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold'
    },
    select: {
        width: '100%',
        padding: '8px',
        border: "2px solid maroon",
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: 'maroon',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    success: {
        marginTop: '15px',
        color: 'green',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    listHeader: {
        marginBottom: '10px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'

    },
    tableHeader: {
        backgroundColor: '#eee',

    },
    tableCell: {
        border: "2px solid maroon",
        padding: '8px',
        textAlign: 'left'
    }
};

export default CurriculumPanel;
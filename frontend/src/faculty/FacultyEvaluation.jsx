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
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Card,
    CardContent,
    Grid
} from "@mui/material";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import LoadingOverlay from '../components/LoadingOverlay';
import { Message } from "@mui/icons-material";

const FacultyEvaluation = () => {
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [studentCourses, setStudentCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [studentNumber, setStudentNumber] = useState("");
    const [chartData, setChartData] = useState([]); // ✅ added
    const [loading, setLoading] = useState(true);
    const [schoolYears, setSchoolYears] = useState([]);
    const [schoolSemester, setSchoolSemester] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState('');
    const [selectedActiveSchoolYear, setSelectedActiveSchoolYear] = useState('');
    const [profData, setPerson] = useState({
        prof_id: "",
        fname: "",
        mname: "",
        lname: "",
        profile_image: "",
    });

    // ✅ On page load: check user session and fetch student data
    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);

            if (storedRole !== "faculty") {
                window.location.href = "/login";
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
            console.error("Error Fetching Professor Personal Data");
        }
    }

    useEffect(() => {
        axios
            .get(`http://localhost:5000/get_school_year/`)
            .then((res) => setSchoolYears(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`http://localhost:5000/get_school_semester/`)
            .then((res) => setSchoolSemester(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`http://localhost:5000/active_school_year`)
            .then((res) => {
                if (res.data.length > 0) {
                    setSelectedSchoolYear(res.data[0].year_id);
                    setSelectedSchoolSemester(res.data[0].semester_id);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedSchoolYear && selectedSchoolSemester) {
            axios
                .get(`http://localhost:5000/get_selecterd_year/${selectedSchoolYear}/${selectedSchoolSemester}`)
                .then((res) => {
                    if (res.data.length > 0) {
                        setSelectedActiveSchoolYear(res.data[0].school_year_id);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [selectedSchoolYear, selectedSchoolSemester]);

    useEffect(() => {
        if (selectedSchoolYear && selectedSchoolSemester) {
            fetchFacultyData();
        }
    }, [selectedSchoolYear, selectedSchoolSemester]);

    const fetchFacultyData = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/faculty_evaluation", {
                params: {
                    prof_id: profData.prof_id,
                    year_id: selectedSchoolYear,
                    semester_id: selectedSchoolSemester,
                },
            });
            const data = res.data;

            const formatted = data.map(course => ({
                courseID: course.course_id,
                course_code: course.course_code,
                chartData: [
                    { name: "Rating 1", total: course.answered_one_count },
                    { name: "Rating 2", total: course.answered_two_count },
                    { name: "Rating 3", total: course.answered_three_count },
                    { name: "Rating 4", total: course.answered_four_count },
                    { name: "Rating 5", total: course.answered_five_count },
                ]
            }));

            setChartData(formatted);
        } catch (err) {
            setChartData([]);

        } finally {
            setLoading(false);
        }
    };

    const handleSchoolYearChange = (event) => {
        setSelectedSchoolYear(event.target.value);
    };

    const handleSchoolSemesterChange = (event) => {
        setSelectedSchoolSemester(event.target.value);
    };

    const AuditLog = async () => {

        try {
            const page_name = "Faculty Evaluation Report";
            const fullName = `${profData.lname}, ${profData.fname} ${profData.mname}`;
            const type = "Printing"

            await axios.post(`http://localhost:5000/insert-logs/faculty/${profData.prof_id}`, {
                message: `User #${profData.prof_id} - ${fullName} printed ${page_name}`, type: type,
            });

            alert("Audit log inserted successfully!");
        } catch (err) {
            console.error("Error inserting audit log:", err);
            alert("Failed to insert audit log.");
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
        <Box sx={{ height: 'calc(100vh - 150px)', overflowY: 'auto', pr: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" fontWeight="bold" color="maroon">
                    FACULTY EVALUATION
                </Typography>
            </Box>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />

            <br />

            <TableContainer component={Paper} sx={{ width: '99%', }}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: '#6D2323', color: "white" }}>
                        <TableRow>
                            <TableCell colSpan={10} sx={{ border: "2px solid maroon", py: 0.5, height: "40px", backgroundColor: '#6D2323', color: "white" }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">

                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
            <TableContainer component={Paper} sx={{ width: '99%', border: "2px solid maroon", p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "1rem 0", padding: "0 1rem", }} gap={5}>
                    <Box style={{ display: "flex", alignItems: "center", minWidth: "500px" }}>
                        <Typography fontSize={13} sx={{ minWidth: "100px" }}>Print: </Typography>
                        <Button style={{ background: "maroon", color: "white", width: "220px", height: "55px" }} onClick={AuditLog}>Print Evaluation</Button>
                    </Box>
                    <Box display="flex" gap={2} sx={{ minWidth: "450px" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "100px" }}>School Year:</Typography>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">School Years</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    style={{ width: "200px" }}
                                    value={selectedSchoolYear}
                                    label="School Years"
                                    onChange={handleSchoolYearChange}
                                >
                                    {schoolYears.length > 0 ? (
                                        schoolYears.map((sy) => (
                                            <MenuItem value={sy.year_id} key={sy.year_id}>
                                                {sy.current_year} - {sy.next_year}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>School Year is not found</MenuItem>
                                    )
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} sx={{ minWidth: "100px" }}>Semester: </Typography>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">School Semester</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    style={{ width: "200px", }}
                                    value={selectedSchoolSemester}
                                    label="School Semester"
                                    onChange={handleSchoolSemesterChange}
                                >
                                    {schoolSemester.length > 0 ? (
                                        schoolSemester.map((sem) => (
                                            <MenuItem value={sem.semester_id} key={sem.semester_id}>
                                                {sem.semester_description}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>School Semester is not found</MenuItem>
                                    )
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </TableContainer>
            <Grid container spacing={3} sx={{ mt: 3, gap: "2rem", justifyContent: "center", display: "flex", flexWrap: "wrap", }}>
                {chartData.length > 0 ? (
                    chartData.map((entry, index) => (
                        <Grid item xs={12} md={12} lg={5} key={index}>
                            <Card
                                sx={{
                                    p: 2,
                                    marginLeft: "10px",
                                    marginTop: "-20px",
                                    borderRadius: 3,
                                    width: 550,
                                    height: 400,
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
                                        sx={{ color: "maroon", textAlign: "center", pl: 2, pt: 2 }}
                                    >
                                        EVALUATION FOR COURSE {entry.course_code}
                                    </Typography>
                                    {/* Chart takes the rest of card height */}
                                    <Box sx={{ height: "calc(100% - 40px)", px: 2, pb: 2 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={entry.chartData}
                                                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    interval={0}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    ticks={[0, 10, 20, 30, 40, 50, 60]}
                                                    domain={[0, 60]}
                                                    label={{
                                                        value: 'Number of Responses',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        dy: 90,
                                                        dx: 10
                                                    }}
                                                />
                                                <Tooltip />
                                                <Bar dataKey="total">
                                                    {entry.chartData.map((_, i) => (
                                                        <Cell
                                                            key={`cell-${i}`}
                                                            fill={[
                                                                "#FF0000",
                                                                "#00C853",
                                                                "#2196F3",
                                                                "#FFD600",
                                                                "#FF6D00",
                                                            ][i % 5]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))) : (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, ml: 1, width: '97%', border: "1px solid maroon", p: 10, textAlign: "center" }}>
                        There's no evaluation in this term.
                    </Typography>
                )}
            </Grid>
        </Box>

    )
}

export default FacultyEvaluation    
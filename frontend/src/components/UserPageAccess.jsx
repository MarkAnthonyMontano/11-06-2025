import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { IoMdSearch } from "react-icons/io";
import { FaRegMoon, FaMoon } from "react-icons/fa";

const UserPageAccess = () => {
  const [userFound, setUserFound] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageAccess, setPageAccess] = useState({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("light");
  const [userID, setUserID] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const mainColor = "#7E0000";

 
  // 🔍 Search for user access
  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!userID) return;

    setLoading(true);
    try {
      const { data: allPages } = await axios.get("http://localhost:5000/api/pages");
      const { data: accessRows } = await axios.get(`http://localhost:5000/api/page_access/${userID}`);

      const accessMap = accessRows.reduce((acc, curr) => {
        acc[curr.page_id] = curr.page_privilege === 1;
        return acc;
      }, {});

      allPages.forEach((page) => {
        if (accessMap[page.id] === undefined) accessMap[page.id] = false;
      });

      setUserFound({ id: userID });
      setPages(allPages);
      setPageAccess(accessMap);
      setSnackbar({ open: true, message: "User found successfully!", type: "success" });
    } catch (error) {
      console.error("Error searching user:", error);
      setUserFound(null);
      setSnackbar({ open: true, message: "User not found or error loading data", type: "error" });
    }
    setLoading(false);
  };

  // 🔄 Refresh pages and access
  const fetchPages = async () => {
    try {
      const { data: allPages } = await axios.get("http://localhost:5000/api/pages");
      const { data: accessRows } = await axios.get(`http://localhost:5000/api/page_access/${userID}`);

      const accessMap = accessRows.reduce((acc, curr) => {
        acc[curr.page_id] = curr.page_privilege === 1;
        return acc;
      }, {});

      allPages.forEach((page) => {
        if (accessMap[page.id] === undefined) accessMap[page.id] = false;
      });

      setPages(allPages);
      setPageAccess(accessMap);
    } catch (err) {
      console.error("Error fetching pages:", err);
    }
  };

  // ✅ Toggle access privileges
  const handleToggleChange = async (pageId, hasAccess) => {
    const newAccessState = !hasAccess;
    try {
      if (newAccessState) {
        await axios.post(`http://localhost:5000/api/page_access/${userID}/${pageId}`);
      } else {
        await axios.delete(`http://localhost:5000/api/page_access/${userID}/${pageId}`);
      }
      await fetchPages();
      setSnackbar({
        open: true,
        message: `Access ${newAccessState ? "granted" : "revoked"} successfully!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating access:", error);
      setSnackbar({ open: true, message: "Error updating access", type: "error" });
    }
  };

  // Prevent inspect shortcut
  useEffect(() => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      const blocked =
        e.key === "F12" ||
        e.key === "F11" ||
        (e.ctrlKey && e.shiftKey && ["i", "j"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && ["u", "p"].includes(e.key.toLowerCase()));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }, []);

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        paddingRight: 1,
        backgroundColor: "transparent",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mt: 2,
          mb: 2,
          px: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: mainColor,
            fontSize: "36px",
          }}
        >
          USER PAGE ACCESS
        </Typography>

        
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      {/* Search User Form */}
      <Box
        component="form"
        onSubmit={handleSearchUser}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
          px: 2,
        }}
      >
        <TextField
          label="Enter User ID"
          variant="outlined"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          required
          sx={{ width: "250px" }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<IoMdSearch size={20} />}
          sx={{
            bgcolor: mainColor,
            "&:hover": { bgcolor: `${mainColor}CC` },
            borderRadius: "10px",
            textTransform: "none",
            px: 3,
            py: 1,
            fontSize: "16px",
          }}
        >
          Search User
        </Button>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Access Table */}
      {userFound && (
        <Paper
          elevation={4}
          sx={{
            border: `2px solid ${mainColor}`,
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: mainColor }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${mainColor}` }}>#</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${mainColor}` }}>
                    Page Description
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", border: `2px solid ${mainColor}` }}>
                    Page Group
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold", border: `2px solid ${mainColor}` }}
                  >
                    Access
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pages.length > 0 ? (
                  pages.map((page, index) => {
                    const hasAccess = !!pageAccess[page.id];
                    return (
                      <TableRow key={page.id} hover>
                        <TableCell style={{ border: `2px solid ${mainColor}` }}>{index + 1}</TableCell>
                        <TableCell style={{ border: `2px solid ${mainColor}` }}>{page.page_description}</TableCell>
                        <TableCell style={{ border: `2px solid ${mainColor}` }}>{page.page_group}</TableCell>
                        <TableCell
                          align="center"
                          style={{ border: `2px solid ${mainColor}` }}
                        >
                          <Switch
                            checked={hasAccess}
                            onChange={() => handleToggleChange(page.id, hasAccess)}
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No pages found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserPageAccess;

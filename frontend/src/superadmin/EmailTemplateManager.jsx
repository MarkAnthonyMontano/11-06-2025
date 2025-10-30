import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";

const API = "http://localhost:5000/api/email-templates";

export default function EmailTemplateManager() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ sender_name: "", is_active: true });
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // ✅ Fetch templates on load
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await axios.get(API);
      setRows(res.data || []);
    } catch (err) {
      console.error("Failed to load templates:", err);
      showSnack("Failed to load templates", "error");
    }
  };

  const showSnack = (message, severity = "info") =>
    setSnack({ open: true, message, severity });

  // ✅ Add template
  const handleAdd = async () => {
    if (!form.sender_name.trim()) {
      showSnack("Sender name is required", "warning");
      return;
    }

    try {
      await axios.post(API, form);
      showSnack("Template successfully added", "success");
      setForm({ sender_name: "", is_active: true });
      loadTemplates();
    } catch (err) {
      console.error("Error adding template:", err);
      showSnack("Failed to add template", "error");
    }
  };

  // ✅ Edit template
  const handleEdit = (row) => {
    setEditing(row.template_id);
    setForm({ sender_name: row.sender_name, is_active: !!row.is_active });
  };

  // ✅ Update template
  const handleUpdate = async () => {
    if (!editing) return;

    try {
      await axios.put(`${API}/${editing}`, form);
      showSnack("Template updated successfully", "success");
      setEditing(null);
      setForm({ sender_name: "", is_active: true });
      loadTemplates();
    } catch (err) {
      console.error("Error updating template:", err);
      showSnack("Failed to update template", "error");
    }
  };

  // ✅ Delete template
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;

    try {
      await axios.delete(`${API}/${id}`);
      showSnack("Template deleted successfully", "success");
      loadTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      showSnack("Failed to delete template", "error");
    }
  };

  const handleCloseSnack = (_, reason) => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  // 🔒 Disable right-click + block dev tools
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    const isBlocked =
      e.key === "F12" ||
      e.key === "F11" ||
      (e.ctrlKey &&
        e.shiftKey &&
        (e.key.toLowerCase() === "i" || e.key.toLowerCase() === "j")) ||
      (e.ctrlKey && e.key.toLowerCase() === "u") ||
      (e.ctrlKey && e.key.toLowerCase() === "p");
    if (isBlocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

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
       
          mb: 2,
     
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "maroon",
            fontSize: "36px",
          }}
        >
          EMAIL TEMPLATE MANAGER
        </Typography>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      <Grid container spacing={4}>
        {/* ✅ Form Section */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{ p: 3, border: "2px solid maroon", borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "#800000" }}>
              {editing ? "Edit Email Template" : "Register New Template"}
            </Typography>

            <Typography fontWeight={500}>Sender Name:</Typography>
            <TextField
              fullWidth
              label="Sender Name"
              variant="outlined"
              value={form.sender_name}
              onChange={(e) =>
                setForm({ ...form, sender_name: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
              }
              label="Active"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={editing ? handleUpdate : handleAdd}
              sx={{
                backgroundColor: "#800000",
                "&:hover": { backgroundColor: "#a00000" },
              }}
            >
              {editing ? "Update Template" : "Save"}
            </Button>
          </Paper>
        </Grid>

        {/* ✅ Table Section */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{ p: 3, border: "2px solid maroon", borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "#800000" }}>
              Registered Templates
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Gmail Account
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Active</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No templates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.template_id}>
                        <TableCell>{r.sender_name}</TableCell>
                        <TableCell>{r.is_active ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "#4CAF50",
                              color: "white",
                              marginRight: 1,
                              "&:hover": { backgroundColor: "#45A049" },
                            }}
                            onClick={() => handleEdit(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "#B22222",
                              color: "white",
                              "&:hover": { backgroundColor: "#8B0000" },
                            }}
                            onClick={() => handleDelete(r.template_id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Snackbar Notification */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={handleCloseSnack}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

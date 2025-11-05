const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const XLSX = require("xlsx");
const webtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyparser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const QRCode = require("qrcode");

require("dotenv").config();
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});



async function getPersonIdByApplicantNumber(applicant_number) {
  const [rows] = await db.query(
    "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
    [applicant_number]
  );
  return rows.length ? rows[0].person_id : null;
}

//MIDDLEWARE
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",   // ✅ Explicitly allow Vite dev server
  credentials: true                  // ✅ Allow credentials (cookies, auth)
}));

app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));


const uploadPath = path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadPath));

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: async function (req, file, cb) {
    const person_id = req.body.person_id;
    const requirements_id = req.body.requirements_id;

    // Get requirement label from DB
    const [reqRows] = await db.query("SELECT description FROM requirements_table WHERE id = ?", [requirements_id]);
    const description = reqRows[0]?.description || "Unknown";
    const shortLabel = getShortLabel(description);

    // Get applicant_number using person_id
    const [applicantRows] = await db.query("SELECT applicant_number FROM applicant_numbering_table WHERE person_id = ?", [person_id]);
    const applicant_number = applicantRows[0]?.applicant_number || `PID${person_id}`;

    const timestamp = new Date().getFullYear();
    const ext = path.extname(file.originalname);

    const filename = `${applicant_number}_${shortLabel}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

// ---------------- PROFILE UPLOAD (Registrar) ----------------
// ---------------- PROFILE UPLOAD (Registrar) ----------------
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    const { id } = req.params;

    try {
      // ✅ Get registrar info
      const [rows] = await db3.query(
        "SELECT employee_id, role, profile_picture FROM user_accounts WHERE id = ?",
        [id]
      );

      if (!rows.length) return cb(new Error("Registrar not found"));

      const registrar = rows[0];
      const ext = path.extname(file.originalname).toLowerCase();

      // ✅ Get Philippine year
      const philTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
      const year = new Date(philTime).getFullYear();

      // ✅ Construct filename based on employee_id + year
      const employeeID = registrar.employee_id || "unknown";
      const filename = `${employeeID}_profile_image_${year}${ext}`;

      cb(null, filename);
    } catch (err) {
      console.error("❌ Error generating filename:", err);
      cb(err);
    }
  },
});

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // We’ll handle renaming AFTER upload (multer doesn’t await async)
      cb(null, "temp_" + Date.now() + path.extname(file.originalname));
    },
  }),
});


const announcementStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    // Temporary filename, will rename after DB insert
    cb(null, `temp_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const announcementUpload = multer({ storage: announcementStorage });

const upload = multer({ storage: multer.memoryStorage() });


const nodemailer = require("nodemailer");

// Middleware to check if user can access a step
const checkStepAccess = (requiredStep) => {
  return async (req, res, next) => {
    const { id } = req.params; // person_id
    try {
      const [rows] = await db.execute(
        "SELECT current_step FROM person_table WHERE person_id = ?",
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Person not found" });
      }

      const currentStep = rows[0].current_step;

      if (currentStep < requiredStep) {
        return res.status(403).json({ error: "You cannot access this step yet." });
      }

      next();
    } catch (err) {
      console.error("Step check error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
};


// ---------------- TRANSPORTER ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verify transporter at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter is ready");
  }
});


//MYSQL CONNECTION FOR ADMISSION
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "admission",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


//MYSQL CONNECTION FOR ROOM MANAGEMENT AND OTHERS
const db3 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "enrollment",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.query(`
  CREATE TABLE IF NOT EXISTS faculty_evaluation_table (
    eval_id INT AUTO_INCREMENT PRIMARY KEY,         
    prof_id INT NOT NULL,                           
    course_id INT NOT NULL,                         
    curriculum_id INT NOT NULL,                     
    active_school_year_id INT NOT NULL,             
    num1 INT DEFAULT 0,                             
    num2 INT DEFAULT 0,                             
    num3 INT DEFAULT 0,                             
    eval_status TINYINT DEFAULT 0,                  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`);
//----------------------------Settings----------------------------//
const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];

const settingsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Invalid file type. Only PNG, JPG, JPEG, or PDF allowed."));
    }

    if (file.fieldname === "logo") {
      cb(null, "Logo" + ext);
    } else if (file.fieldname === "bg_image") {
      cb(null, "Background" + ext);
    } else {
      cb(null, Date.now() + ext);
    }
  },
});

const settingsUpload = multer({ storage: settingsStorage });

// ✅ Delete old image safely
const deleteOldFile = (fileUrl) => {
  if (!fileUrl) return;
  const filePath = path.join(__dirname, fileUrl.replace(/^\//, ""));
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Error deleting old file: ${err.message}`);
    else console.log(`Deleted old file: ${filePath}`);
  });
};

// ✅ GET Settings
app.get("/api/settings", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM company_settings WHERE id = 1");
    if (rows.length === 0) {
      return res.json({
        company_name: "",
        short_term: "",
        address: "",
        header_color: "#ffffff",
        footer_text: "",
        footer_color: "#ffffff",
        logo_url: null,
        bg_image: null,
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST Settings
app.post(
  "/api/settings",
  settingsUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const companyName = req.body.company_name || "";
      const shortTerm = req.body.short_term || ""; // <-- new field
      const address = req.body.address || "";
      const headerColor = req.body.header_color || "#ffffff";
      const footerText = req.body.footer_text || "";
      const footerColor = req.body.footer_color || "#ffffff";

      const logoUrl = req.files["logo"] ? `/uploads/${req.files["logo"][0].filename}` : null;
      const bgImageUrl = req.files["bg_image"] ? `/uploads/${req.files["bg_image"][0].filename}` : null;

      const [rows] = await db.query("SELECT * FROM company_settings WHERE id = 1");

      if (rows.length > 0) {
        const oldLogo = rows[0].logo_url;
        const oldBg = rows[0].bg_image;

        let query = `
          UPDATE company_settings 
          SET company_name=?, short_term=?, address=?, header_color=?, footer_text=?, footer_color=?`;
        const params = [companyName, shortTerm, address, headerColor, footerText, footerColor];

        if (logoUrl) {
          query += ", logo_url=?";
          params.push(logoUrl);
        }
        if (bgImageUrl) {
          query += ", bg_image=?";
          params.push(bgImageUrl);
        }

        query += " WHERE id=1";
        await db.query(query, params);

        if (logoUrl && oldLogo && oldLogo !== logoUrl) deleteOldFile(oldLogo);
        if (bgImageUrl && oldBg && oldBg !== bgImageUrl) deleteOldFile(oldBg);

        return res.json({ success: true, message: "Settings updated successfully." });
      } else {
        const insertQuery = `
          INSERT INTO company_settings 
          (company_name, short_term, address, header_color, footer_text, footer_color, logo_url, bg_image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(insertQuery, [
          companyName,
          shortTerm,
          address,
          headerColor,
          footerText,
          footerColor,
          logoUrl,
          bgImageUrl,
        ]);
        res.json({ success: true, message: "Settings created successfully." });
      }
    } catch (err) {
      console.error("❌ Error in /api/settings:", err);
      res.status(500).json({ error: err.message });
    }
  }
);
//----------------------------End Settings----------------------------//

/*---------------------------------START---------------------------------------*/
// ----------------- REGISTER -----------------
app.post("/register", async (req, res) => {
  const { email, password, campus } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill up all required fields" });
  }

  let person_id = null;

  try {
    // ✅ 1️⃣ Fetch company name (to be used as default campus label)
    const [[company]] = await db.query(
      "SELECT company_name FROM company_settings WHERE id = 1"
    );
    const companyName = company?.company_name || "Main Campus";

    // ✅ 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🚫 3️⃣ Check if email already exists
    const [existingUser] = await db.query(
      "SELECT * FROM user_accounts WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // ✅ 4️⃣ Determine campus value dynamically
    // If no campus specified, fallback to companyName
    const campusValue = campus?.trim()
      ? campus.trim()
      : `${companyName} - Main`;

    // ✅ 5️⃣ Insert new person record
    const [personResult] = await db.query(
      "INSERT INTO person_table (campus) VALUES (?)",
      [campusValue]
    );
    person_id = personResult.insertId;

    // ✅ 6️⃣ Insert into user_accounts
    await db.query(
      "INSERT INTO user_accounts (person_id, email, password, role) VALUES (?, ?, ?, 'applicant')",
      [person_id, email.trim().toLowerCase(), hashedPassword]
    );

    // ✅ 7️⃣ Get active school year + semester
    const [activeYearResult] = await db3.query(`
      SELECT yt.year_description, st.semester_code
      FROM active_school_year_table sy
      JOIN year_table yt ON yt.year_id = sy.year_id
      JOIN semester_table st ON st.semester_id = sy.semester_id
      WHERE sy.astatus = 1
      LIMIT 1
    `);

    if (activeYearResult.length === 0) {
      throw new Error("No active school year/semester found.");
    }

    const year = String(activeYearResult[0].year_description).split("-")[0];
    const semCode = activeYearResult[0].semester_code;

    // ✅ 8️⃣ Generate applicant number
    const [countRes] = await db.query("SELECT COUNT(*) AS count FROM applicant_numbering_table");
    const padded = String(countRes[0].count + 1).padStart(5, "0");
    const applicant_number = `${year}${semCode}${padded}`;

    // ✅ 9️⃣ Insert applicant number
    await db.query(
      "INSERT INTO applicant_numbering_table (applicant_number, person_id) VALUES (?, ?)",
      [applicant_number, person_id]
    );

    // ✅ 🔟 Generate QR Codes
    const qrData = `http://localhost:5173/examination_profile/${applicant_number}`;
    const qrData2 = `http://localhost:5173/applicant_profile/${applicant_number}`;
    const qrFilename = `${applicant_number}_qrcode.png`;
    const qrFilename2 = `${applicant_number}_qrcode2.png`;
    const qrPath = path.join(__dirname, "uploads", qrFilename);
    const qrPath2 = path.join(__dirname, "uploads", qrFilename2);

    await QRCode.toFile(qrPath, qrData, {
      color: { dark: "#000", light: "#FFF" },
      width: 300,
    });

    await QRCode.toFile(qrPath2, qrData2, {
      color: { dark: "#000", light: "#FFF" },
      width: 300,
    });

    // ✅ 11️⃣ Save QR filename
    await db.query(
      "UPDATE applicant_numbering_table SET qr_code = ? WHERE applicant_number = ?",
      [qrFilename, applicant_number]
    );

    // ✅ 12️⃣ Insert initial applicant statuses
    await db.query(
      `INSERT INTO person_status_table 
       (person_id, applicant_id, exam_status, requirements, residency, student_registration_status, exam_result, hs_ave, qualifying_result, interview_result)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [person_id, applicant_number, 0, 0, 0, 0, 0, 0, 0, 0]
    );

    await db.query(
      "INSERT INTO interview_applicants (schedule_id, applicant_id, email_sent, status) VALUES (?, ?, ?, ?)",
      [null, applicant_number, 0, "Waiting List"]
    );

    // ✅ 13️⃣ Respond success
    res.status(201).json({
      message: "Registered Successfully",
      person_id,
      applicant_number,
      qr_code: qrFilename,
      campus: campusValue,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    if (person_id) {
      await db.query("DELETE FROM person_table WHERE person_id = ?", [person_id]);
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.post("/register_registrar", async (req, res) => {
  const { employee_id, last_name, middle_name, first_name, role, email, password, status, dprtmnt_id } = req.body;

  if (!employee_id || !last_name || !first_name || !role || !email || !password || !dprtmnt_id) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const [existing] = await db3.query("SELECT * FROM user_accounts WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [personInsert] = await db3.query("INSERT INTO person_table () VALUES ()");
    const person_id = personInsert.insertId;

    const sql = `
      INSERT INTO user_accounts 
      (person_id, employee_id, last_name, middle_name, first_name, role, email, password, status, dprtmnt_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db3.query(sql, [
      person_id,
      employee_id,
      last_name,
      middle_name || null,
      first_name,
      role,
      email.toLowerCase(),
      hashedPassword,
      status || 1,
      dprtmnt_id
    ]);

    res.status(201).json({ message: "Registrar account created successfully!" });
  } catch (error) {
    console.error("❌ Error creating registrar account:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.get("/api/registrars", async (req, res) => {
  try {
    const sql = `
      SELECT 
        ua.id,
        ua.employee_id,
        ua.profile_picture,
        ua.first_name,
        ua.middle_name,
        ua.last_name,
        ua.email,
        ua.role,
        ua.status,
        d.dprtmnt_name,
        d.dprtmnt_code
      FROM user_accounts ua
      LEFT JOIN dprtmnt_table d ON ua.dprtmnt_id = d.dprtmnt_id
      WHERE ua.role = 'registrar';
    `;

    // ✅ Since db3 is a promise-based connection, use await
    const [results] = await db3.query(sql);
    res.json(results);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Actual upload + database update route
app.post("/update_registrar/:id", profileUpload.single("profile_picture"), async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const file = req.file;

  try {
    const [existing] = await db3.query("SELECT * FROM user_accounts WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Registrar not found" });

    const current = existing[0];

    let finalFilename = current.profile_picture; // fallback to existing if no new file

    if (file) {
      // ✅ Get employee_id for filename
      const employee_id = current.employee_id || "unknown";

      // ✅ Get current Philippine year
      const philTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
      const year = new Date(philTime).getFullYear();

      // ✅ Build final filename
      const ext = path.extname(file.originalname).toLowerCase();
      finalFilename = `${employee_id}_profile_image_${year}${ext}`;

      // ✅ Paths
      const uploadDir = path.join(__dirname, "uploads");
      const tempPath = path.join(uploadDir, file.filename);
      const newPath = path.join(uploadDir, finalFilename);

      // ✅ Delete old image if exists
      if (current.profile_picture) {
        const oldPath = path.join(uploadDir, current.profile_picture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // ✅ Rename temp file to proper name
      fs.renameSync(tempPath, newPath);
    }

    // ✅ Update registrar data in DB
    const updated = {
      employee_id: data.employee_id ?? current.employee_id,
      last_name: data.last_name ?? current.last_name,
      middle_name: data.middle_name ?? current.middle_name,
      first_name: data.first_name ?? current.first_name,
      role: data.role ?? current.role,
      email: data.email ?? current.email,
      dprtmnt_id: data.dprtmnt_id ?? current.dprtmnt_id,
      profile_picture: finalFilename,
      status:
        data.status === "0" || data.status === 0
          ? 0
          : data.status === "1" || data.status === 1
            ? 1
            : current.status,
    };

    const sql = `
      UPDATE user_accounts 
      SET employee_id=?, last_name=?, middle_name=?, first_name=?, role=?, email=?, status=?, dprtmnt_id=?, profile_picture=?
      WHERE id=?`;
    const values = [
      updated.employee_id,
      updated.last_name,
      updated.middle_name,
      updated.first_name,
      updated.role,
      updated.email.toLowerCase(),
      updated.status,
      updated.dprtmnt_id,
      updated.profile_picture,
      id,
    ];

    await db3.query(sql, values);

    res.json({
      success: true,
      message: "Registrar updated successfully!",
      updated,
    });
  } catch (error) {
    console.error("❌ Error updating registrar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get user_accounts.id using person_id
app.get("/api/get_user_account_id/:person_id", async (req, res) => {
  const { person_id } = req.params;
  try {
    const [rows] = await db3.query(
      "SELECT id FROM user_accounts WHERE person_id = ? LIMIT 1",
      [person_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ user_account_id: rows[0].id });
  } catch (err) {
    console.error("❌ Error fetching user_account_id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//DISPLAY
app.get("/api/students", async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT
        ua.id AS user_id,
        ua.employee_id,
        ua.profile_picture,
        pt.first_name,
        pt.middle_name,
        pt.last_name,
        ua.email,
        ua.role,
        ua.status,
        ct.program_id,
        d.dprtmnt_id,
        d.dprtmnt_name,
        d.dprtmnt_code, snt.student_number, sct.curriculum_id, ct.program_id, pgt.program_description, pgt.program_code,
		ylt.year_level_description
      FROM user_accounts ua
      LEFT JOIN dprtmnt_curriculum_table dct ON ua.dprtmnt_id = dct.dprtmnt_id
      LEFT JOIN dprtmnt_table d ON dct.dprtmnt_id = d.dprtmnt_id
      INNER JOIN student_curriculum_table sct ON dct.curriculum_id = sct.curriculum_id
      LEFT JOIN curriculum_table ct ON sct.curriculum_id = ct.curriculum_id
      LEFT JOIN program_table pgt ON ct.program_id = pgt.program_id
      LEFT JOIN person_table pt ON ua.person_id = pt.person_id
      LEFT JOIN student_numbering_table snt ON pt.person_id = snt.person_id
      LEFT JOIN student_status_table sst ON snt.student_number = sst.student_number
      LEFT JOIN year_level_table ylt ON sst.year_level_id = ylt.year_level_id
      WHERE ua.role = 'student' ;
    `;

    // ✅ Since db3 is a promise-based connection, use await
    const [results] = await db3.query(sql);
    res.json(results);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


//CREATE
app.post("/register_student", profileUpload.single("profile_picture"), async (req, res) => {
  const { student_number, last_name, middle_name, first_name, email, password, status, dprtmnt_id, curriculum_id } = req.body;
  console.log("Student Number: ", student_number);
  console.log("Last Name: ", last_name);
  console.log("Middle Name: ", middle_name);
  console.log("First Name: ", first_name);
  console.log("Email: ", email);
  console.log("Status: ", status);
  console.log("Departments: ", dprtmnt_id);
  console.log("Curriculum: ", curriculum_id);

  try {
    const [existing] = await db3.query("SELECT * FROM user_accounts WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [personInsert] = await db3.query(
      "INSERT INTO person_table (first_name, middle_name, last_name, emailAddress) VALUES (?, ?, ?, ?)",
      [first_name, middle_name || null, last_name, email]
    );
    const person_id = personInsert.insertId;

    await db3.query(
      `INSERT INTO user_accounts 
       (person_id, role, last_name, middle_name, first_name, email, password, status, dprtmnt_id) 
       VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?)`,
      [person_id, last_name, middle_name || null, first_name, email.toLowerCase(), hashedPassword, status || 1, dprtmnt_id]
    );

    const [studentNumInsert] = await db3.query(`
      INSERT INTO student_numbering_table (student_number, person_id) VALUES (?, ?)
    `, [student_number, person_id]);

    const student_numbering_id = studentNumInsert.insertId;

    await db3.query(`
      INSERT INTO student_curriculum_table (student_numbering_id, curriculum_id) VALUES (?, ?)
    `, [student_numbering_id, curriculum_id])

    res.status(201).json({ message: "Registrar account created successfully!" });
  } catch (error) {
    console.error("❌ Error creating registrar account:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

//UPDATE
app.put("/update_student/:id", profileUpload.single("profile_picture"), async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const file = req.file;

  try {
    const [existing] = await db3.query(
      `
      SELECT DISTINCT
        ua.id AS user_id,
        ua.person_id,
        ua.employee_id,
        ua.profile_picture,
        pt.first_name,
        pt.middle_name,
        pt.last_name,
        ua.email,
        ua.role,
        ua.status,
        d.dprtmnt_name,
        d.dprtmnt_code, snt.student_number,ct.curriculum_id, ct.program_id, pgt.program_code,
		ylt.year_level_description
      FROM user_accounts ua
      LEFT JOIN dprtmnt_curriculum_table dct ON ua.dprtmnt_id = dct.dprtmnt_id
      LEFT JOIN dprtmnt_table d ON dct.dprtmnt_id = d.dprtmnt_id
      LEFT JOIN curriculum_table ct ON dct.curriculum_id = ct.curriculum_id
      LEFT JOIN program_table pgt ON ct.program_id = pgt.program_id
      LEFT JOIN person_table pt ON ua.person_id = pt.person_id
      LEFT JOIN student_numbering_table snt ON pt.person_id = snt.person_id
      LEFT JOIN student_status_table sst ON snt.student_number = sst.student_number
      LEFT JOIN year_level_table ylt ON sst.year_level_id = ylt.year_level_id
      WHERE ua.role = 'student' AND ua.id = ?;
      `
      , [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Student not found" });

    const current = existing[0];

    const updated = {
      student_number: data.student_number ?? current.student_number,
      last_name: data.last_name ?? current.last_name,
      middle_name: data.middle_name ?? current.middle_name,
      first_name: data.first_name ?? current.first_name,
      email: data.email ?? current.email,
      dprtmnt_id: data.dprtmnt_id ?? current.dprtmnt_id,
      profile_picture: file ? file.filename : current.profile_picture,
      status: data.status != null ? Number(data.status) : current.status,
      curriculum_id: data.curriculum_id
    };

    await db3.query(
      `UPDATE user_accounts 
       SET email=?, status=?, dprtmnt_id=?, profile_picture=? 
       WHERE id=?`,
      [
        updated.email.toLowerCase(),
        updated.status,
        updated.dprtmnt_id,
        updated.profile_picture,
        id,
      ]
    );

    // Optionally update person_table
    await db3.query(
      `UPDATE person_table 
       SET first_name=?, middle_name=?, last_name=? 
       WHERE person_id=?`,
      [updated.first_name, updated.middle_name, updated.last_name, current.person_id]
    );

    await db3.query(
      `UPDATE student_numbering_table 
       SET student_number = ?
       WHERE person_id = ?
      `,
      [updated.student_number, current.person_id]
    )

    await db3.query(`
      UPDATE student_curriculum_table 
      SET curriculum_id = ? 
      WHERE student_numbering_id = (
        SELECT id FROM student_numbering_table WHERE person_id = ?
      )
    `, [updated.curriculum_id, current.person_id]);

    res.json({ success: true, message: "Student updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//TOGGLE STATUS
app.put("/update_student_status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log("User ID: ", id);
  try {
    await db3.query(`UPDATE user_accounts SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: `Student status updated to ${status}` });
  } catch (error) {
    console.error("❌ Error updating student status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//IMPORT
app.post("/import_xslx_student", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // ✅ Read from memory buffer instead of path
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const row of sheetData) {
      const student_number =
        row["Student Number"] ||
        row["student_number"] ||
        row["student number"] ||
        null;

      const email =
        row["email address"] ||
        row["emailAddress"] ||
        row["Email Address"] ||
        row["Email"] ||
        row["email"] ||
        null;

      const first_name =
        row["First Name"] || row["first_name"] || row["Firstname"] || null;
      const middle_name =
        row["Middle Name"] || row["middle_name"] || row["Middlename"] || null;
      const last_name =
        row["Last Name"] || row["last_name"] || row["Lastname"] || null;

      if (!student_number || !email || !first_name || !last_name) {
        skippedCount++;
        continue;
      }

      // ✅ Avoid duplicates
      const [existing] = await db3.query(
        "SELECT * FROM person_table WHERE emailAddress = ?",
        [email]
      );
      if (existing.length > 0) {
        skippedCount++;
        continue;
      }

      // ✅ Insert into person_table
      const [personInsert] = await db3.query(
        `INSERT INTO person_table (first_name, middle_name, last_name, emailAddress)
         VALUES (?, ?, ?, ?)`,
        [first_name, middle_name, last_name, email]
      );

      const person_id = personInsert.insertId;

      // ✅ Insert into student_numbering_table
      await db3.query(
        `INSERT INTO student_numbering_table (student_number, person_id)
         VALUES (?, ?)`,
        [student_number, person_id]
      );

      insertedCount++;
    }

    res.json({
      message: `✅ Import complete. ${insertedCount} records added, ${skippedCount} skipped.`,
    });
  } catch (error) {
    console.error("❌ Import error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//GET ADMITTED USERS (UPDATED!)
app.get("/admitted_users", async (req, res) => {
  try {
    const query = "SELECT * FROM user_accounts";
    const [result] = await db.query(query);

    res.status(200).send(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "INTERNAL SERVER ERROR!!" });
  }
});

//TRANSFER ENROLLED USER INTO ENROLLMENT (UPDATED!)
app.post("/transfer", async (req, res) => {
  const { person_id } = req.body;

  try {
    const fetchQuery = "SELECT * FROM user_accounts WHERE person_id = ?";
    const [result1] = await db.query(fetchQuery, [person_id]);

    if (result1.length === 0) {
      return res.status(404).send({ message: "User not found in the database" });
    }

    const user = result1[0];

    const insertPersonQuery = "INSERT INTO person_table (first_name, middle_name, last_name) VALUES (?, ?, ?)";
    const [personResult] = await db3.query(insertPersonQuery, [user.first_name, user.middle_name, user.last_name]);

    const newPersonId = personResult.insertId;

    const insertUserQuery = "INSERT INTO user_accounts (person_id, email, password) VALUES (?, ?, ?)";
    await db3.query(insertUserQuery, [newPersonId, user.email, user.password]);

    console.log("User transferred successfully:", user.email);
    return res.status(200).send({ message: "User transferred successfully", email: user.email });
  } catch (error) {
    console.error("ERROR: ", error);
    return res.status(500).send({ message: "Something went wrong in the server", error });
  }
});


// REGISTER API (NEW)
// app.post("/register_account", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Check if user already exists
//     const checkUserSql = "SELECT * FROM user_accounts WHERE email = ?";
//     const [existingUsers] = await db.query(checkUserSql, [email]);

//     if (existingUsers.length > 0) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Insert blank record into person_table and get inserted person_id
//     const insertPersonSql = "INSERT INTO person_table () VALUES ()";
//     const [personResult] = await db.query(insertPersonSql);

//     // Step 1: Get the active_school_year_id
//     const activeYearSql = `SELECT asy.id, st.semester_code FROM active_school_year_table AS asy
//     LEFT JOIN
//     semester_table AS st ON asy.semester_id = st.semester_id WHERE astatus = 1 LIMIT 1`;
//     const [yearResult] = await db3.query(activeYearSql);

//     if (yearResult.length === 0) {
//       return res.status(404).json({ error: "No active school year found" });
//     }

//     const activeSchoolYearId = yearResult[0].id;
//     const semester_code = yearResult[0].semester_code;

//     const person_id = personResult.insertId;

//     // Insert user with person_id
//     const insertUserSql = "INSERT INTO user_accounts (email, person_id, password, role) VALUES (?, ?, ?, 'applicant')";
//     await db.query(insertUserSql, [email, person_id, hashedPassword]);

//     res.status(201).json({ message: "User registered successfully", person_id });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ message: "Registration failed" });
//   }
// });



// Get applicant_number by person_id
app.get("/api/applicant_number/:person_id", async (req, res) => {
  const { person_id } = req.params;

  try {
    const [rows] = await db.query("SELECT applicant_number FROM applicant_numbering_table WHERE person_id = ?", [person_id]);

    if (!rows.length) {
      return res.status(404).json({ message: "Applicant number not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching applicant number:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 11:19AM 10-08-2025 --------------- APPLICANT SIDE ----------- THIS PART SHOULD BE NOT HARD CODED -------------- //

// // 📌 Converts full requirement description to short label
// const getShortLabel = (desc) => {
//   const lower = desc.toLowerCase();
//   if (lower.includes("form 138")) return "Form138";
//   if (lower.includes("good moral")) return "GoodMoralCharacter";
//   if (lower.includes("birth certificate")) return "BirthCertificate";
//   if (lower.includes("belonging to graduating class")) return "CertificateOfGraduatingClass";
//   if (lower.includes("vaccine card")) return "VaccineCard";
//   return "Unknown";
// };

// 📌 Converts full requirement description to short label dynamically from DB
const getShortLabel = async (desc) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        "SELECT short_label FROM requirements_table WHERE LOWER(description) LIKE CONCAT('%', LOWER(?), '%') LIMIT 1",
        [desc]
      );

    if (rows.length > 0) {
      return rows[0].short_label; // ✅ return short_label directly from DB
    } else {
      return "Unknown"; // no match found
    }
  } catch (error) {
    console.error("Error fetching short_label:", error);
    return "Unknown";
  }
};


app.post("/upload", upload.single("file"), async (req, res) => {
  const { requirements_id, person_id } = req.body;

  if (!req.file || !person_id || !requirements_id) {
    return res.status(400).json({ message: "Missing file, person_id, or requirements_id" });
  }

  try {
    // ✅ Fetch description & short_label in one query
    const [rows] = await db.query(
      "SELECT description, short_label FROM requirements_table WHERE id = ?",
      [requirements_id]
    );

    if (!rows.length) return res.status(404).json({ message: "Requirement not found" });

    // ✅ Use short_label directly from DB
    const shortLabel = await getShortLabel(rows[0].description);

    const year = new Date().getFullYear();
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ✅ Fetch applicant number
    const [appRows] = await db.query(
      "SELECT applicant_number FROM applicant_numbering_table WHERE person_id = ?",
      [person_id]
    );

    if (!appRows.length) {
      return res.status(404).json({ message: `Applicant number not found for person_id ${person_id}` });
    }

    const applicant_number = appRows[0].applicant_number;

    // ✅ Construct final filename using short_label from DB
    const filename = `${applicant_number}_${shortLabel}_${year}${ext}`;
    const finalPath = path.join(__dirname, "uploads", filename);

    // ✅ Remove existing file if exists
    const [existingFiles] = await db.query(
      `SELECT upload_id, file_path FROM requirement_uploads 
       WHERE person_id = ? AND requirements_id = ? AND file_path LIKE ?`,
      [person_id, requirements_id, `%${shortLabel}_${year}%`]
    );

    for (const file of existingFiles) {
      const fullFilePath = path.join(__dirname, "uploads", file.file_path);
      try {
        await fs.promises.unlink(fullFilePath);
      } catch (err) {
        console.warn("File delete warning:", err.message);
      }
      await db.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [file.upload_id]);
    }

    // ✅ Write file to disk
    await fs.promises.writeFile(finalPath, req.file.buffer);

    const filePath = `${filename}`;
    const originalName = req.file.originalname;

    await db.query(
      "INSERT INTO requirement_uploads (requirements_id, person_id, file_path, original_name) VALUES (?, ?, ?, ?)",
      [requirements_id, person_id, filePath, originalName]
    );

    res.status(201).json({ message: "Upload successful", filename });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});


// 11:19AM 10-08-2025 --------------- APPLICANT SIDE ----------- THIS PART SHOULD BE NOT HARD CODED -------------- //

// REQUIREMENTS PANEL (UPDATED!) ADMIN
// ✅ REQUIREMENTS PANEL (UPDATED!) ADMIN
app.post("/requirements", async (req, res) => {
  const { requirements_description, category, short_label } = req.body;

  if (!requirements_description) {
    return res.status(400).json({ error: "Description required" });
  }

  const query = `
    INSERT INTO requirements_table 
    (description, short_label, category) 
    VALUES (?, ?, ?)
  `;

  try {
    const [result] = await db.execute(query, [
      requirements_description,
      short_label || null,
      category || "Regular",
    ]);

    res.status(201).json({ requirements_id: result.insertId });
  } catch (err) {
    console.error("Insert error:", err);
    return res.status(500).json({ error: "Failed to save requirement" });
  }
});



// GET THE REQUIREMENTS (UPDATED!)
app.get("/requirements", async (req, res) => {
  const query = "SELECT * FROM requirements_table";

  try {
    const [results] = await db.execute(query);
    res.json(results);
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch requirements" });
  }
});



// DELETE (REQUIREMENT PANEL)
app.delete("/requirements/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM requirements_table WHERE id = ?";

  try {
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Requirement not found" });
    }

    res.status(200).json({ message: "Requirement deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete requirement" });
  }
});

// ✅ Upload Route

// 📌 Helper function to fetch actor info
async function getActorInfo(user_person_id) {
  let actorEmail = "earistmis@gmail.com";
  let actorName = "SYSTEM";

  if (user_person_id) {
    const [actorRows] = await db3.query(
      `SELECT email, role, last_name, first_name, middle_name 
       FROM user_accounts 
       WHERE person_id = ? LIMIT 1`,
      [user_person_id]
    );

    if (actorRows.length > 0) {
      const actor = actorRows[0];
      actorEmail = actor.email || actorEmail;
      actorName = actor.last_name
        ? `${actor.role.toUpperCase()} - ${actor.last_name}, ${actor.first_name || ""} ${actor.middle_name || ""}`.trim()
        : (actor.role ? actor.role.toUpperCase() : actorName);
    }
  }

  return { actorEmail, actorName };
}



app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { requirements_id, person_id, remarks } = req.body;

  if (!requirements_id || !person_id || !req.file) {
    return res.status(400).json({ error: "Missing required fields or file" });
  }

  try {
    // 🔹 Applicant info
    const [[appInfo]] = await db.query(`
      SELECT ant.applicant_number, pt.last_name, pt.first_name, pt.middle_name
      FROM applicant_numbering_table ant
      JOIN person_table pt ON ant.person_id = pt.person_id
      WHERE ant.person_id = ?
    `, [person_id]);

    const applicant_number = appInfo?.applicant_number || "Unknown";
    const fullName = `${appInfo?.last_name || ""}, ${appInfo?.first_name || ""} ${appInfo?.middle_name?.charAt(0) || ""}.`;

    // 🔹 Requirement description + short label
    const [descRows] = await db.query(
      "SELECT description, short_label FROM requirements_table WHERE id = ?",
      [requirements_id]
    );

    if (!descRows.length) return res.status(404).json({ message: "Requirement not found" });

    const { description, short_label } = descRows[0];

    // ✅ Use the short_label directly from DB
    const shortLabel = short_label || "Unknown";

    const year = new Date().getFullYear();
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ✅ Construct filename
    const filename = `${applicant_number}_${shortLabel}_${year}${ext}`;
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const finalPath = path.join(uploadDir, filename);

    // 🔹 Delete any existing file for the same applicant + requirement
    const [existingFiles] = await db.query(
      `SELECT upload_id, file_path FROM requirement_uploads
       WHERE person_id = ? AND requirements_id = ?`,
      [person_id, requirements_id]
    );

    for (const file of existingFiles) {
      const oldPath = path.join(__dirname, "uploads", file.file_path);

      try {
        await fs.promises.unlink(oldPath);
      } catch (err) {
        if (err.code !== "ENOENT") console.warn("File delete warning:", err.message);
      }

      await db.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [file.upload_id]);
    }

    // 🔹 Save new file
    await fs.promises.writeFile(finalPath, req.file.buffer);

    await db.query(
      `INSERT INTO requirement_uploads 
        (requirements_id, person_id, file_path, original_name, status, remarks) 
       VALUES (?, ?, ?, ?, 0, ?)`,
      [requirements_id, person_id, filename, req.file.originalname, remarks || null]
    );

    res.status(201).json({ message: "✅ Upload successful" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to save upload", details: err.message });
  }
});



// ✅ ADMIN DELETE
app.delete("/admin/uploads/:uploadId", async (req, res) => {
  const { uploadId } = req.params;

  try {
    // 1️⃣ Get upload row (file + person_id)
    const [uploadRows] = await db.query(
      "SELECT person_id, file_path FROM requirement_uploads WHERE upload_id = ?",
      [uploadId]
    );
    if (!uploadRows.length) {
      return res.status(404).json({ error: "Upload not found." });
    }

    const { person_id: personId, file_path: filePath } = uploadRows[0];

    // 2️⃣ Applicant info
    const [[appInfo]] = await db.query(`
      SELECT ant.applicant_number, pt.last_name, pt.first_name, pt.middle_name
      FROM applicant_numbering_table ant
      JOIN person_table pt ON ant.person_id = pt.person_id
      WHERE ant.person_id = ?
    `, [personId]);

    const applicant_number = appInfo?.applicant_number || "Unknown";
    const fullName = `${appInfo?.last_name || ""}, ${appInfo?.first_name || ""} ${appInfo?.middle_name?.charAt(0) || ""}.`;

    // 3️⃣ Actor (admin performing the action)
    const user_person_id = req.headers["x-person-id"];
    const { actorEmail, actorName } = await getActorInfo(user_person_id);

    // 4️⃣ Delete physical file
    if (filePath) {
      const fullPath = path.join(__dirname, "uploads", filePath);
      try {
        await fs.promises.unlink(fullPath);
        console.log("🗑️ File deleted:", fullPath);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.warn("⚠️ File already missing:", fullPath);
        } else {
          console.error("File delete error:", err);
        }
      }
    }

    // 5️⃣ Delete DB record
    await db.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [uploadId]);

    // 6️⃣ Log notification
    const message = `🗑️ Deleted document (Applicant #${applicant_number} - ${fullName})`;
    await db.query(
      "INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp) VALUES (?, ?, ?, ?, ?, NOW())",
      ["delete", message, applicant_number, actorEmail, actorName]
    );

    io.emit("notification", {
      type: "delete",
      message,
      applicant_number,
      actor_email: actorEmail,
      actor_name: actorName,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ message: "✅ Upload deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete the upload." });
  }
});



// ✅ Updated: Return uploads joined with requirement details
app.get("/uploads", async (req, res) => {
  const personId = req.headers["x-person-id"];
  if (!personId) return res.status(400).json({ error: "Missing person ID" });

  try {
    const [results] = await db.query(`
      SELECT 
        ru.upload_id,
        ru.requirements_id,
        ru.person_id,
        ru.file_path,
        ru.original_name,
        ru.remarks,
        ru.status,
        rt.description,
        rt.short_label
      FROM requirement_uploads ru
      LEFT JOIN requirements_table rt ON ru.requirements_id = rt.id
      WHERE ru.person_id = ?
      ORDER BY ru.upload_id DESC
    `, [personId]);

    res.json(results);
  } catch (err) {
    console.error("Fetch uploads failed:", err);
    res.status(500).json({ error: "Failed to fetch uploads" });
  }
});

app.get("/api/requirements/by-status/:status", async (req, res) => {
  const { status } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM requirements_table WHERE category = 'Regular'",
      [status]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching requirements by status:", err);
    res.status(500).send("Server error");
  }
});



// ✅ DELETE (only own files)
app.delete("/uploads/:id", async (req, res) => {
  const person_id = req.headers["x-person-id"];
  const { id } = req.params;

  if (!person_id) {
    return res.status(401).json({ message: "Unauthorized: Missing person ID" });
  }

  try {
    const [results] = await db.query(
      "SELECT file_path FROM requirement_uploads WHERE upload_id = ? AND person_id = ?",
      [id, person_id]
    );

    if (!results.length) {
      return res.status(403).json({ error: "Unauthorized or file not found" });
    }

    const filePath = path.join(__dirname, "uploads", results[0].file_path);


    fs.unlink(filePath, (err) => {
      if (err) console.error("File delete error:", err);
    });

    await db.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [id]);

    res.json({ message: "Requirement deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete requirement" });
  }
});

app.put("/api/interview_applicants/:applicant_id/status", async (req, res) => {
  const { applicant_id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE interview_applicants SET status = ? WHERE applicant_id = ?",
      [status, applicant_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating applicant status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE Remarks ONLY (no notification, no io.emit, no evaluator lookup)
// ✅ Update remarks only
app.put("/uploads/remarks/:upload_id", async (req, res) => {
  const { upload_id } = req.params;
  const { remarks, user_id } = req.body;

  try {
    await db.query(
      `UPDATE requirement_uploads 
       SET remarks = ?, last_updated_by = ?
       WHERE upload_id = ?`,
      [remarks || null, user_id, upload_id]
    );

    res.json({ message: "Remarks updated successfully." });
  } catch (err) {
    console.error("Error updating remarks:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Update status only
app.put("/uploads/status/:upload_id", async (req, res) => {
  const { upload_id } = req.params;
  const { status, user_id } = req.body;

  try {
    await db.query(
      `UPDATE requirement_uploads 
       SET status = ?, last_updated_by = ?
       WHERE upload_id = ?`,
      [status, user_id, upload_id]
    );

    res.json({ message: "Status updated successfully." });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// ✅ Update registrar_status and remarks for ALL docs of the applicant
app.put("/api/registrar-status/:person_id", async (req, res) => {
  const { person_id } = req.params;
  const { registrar_status } = req.body;

  const allowed = [0, 1, 2];
  if (!allowed.includes(Number(registrar_status))) {
    return res.status(400).json({ error: "registrar_status must be 0, 1, or 2" });
  }

  try {
    if (Number(registrar_status) === 1) {
      // ✅ Registrar Submitted → mark ALL applicant docs as submitted
      await db.query(
        `UPDATE admission.requirement_uploads
         SET registrar_status = 1,
             submitted_documents = 1,
             remarks = 1,
             missing_documents = '[]'
         WHERE person_id = ?`,
        [person_id]
      );
    } else {
      // ❌ Registrar Unsubmitted → reset ALL applicant docs
      await db.query(
        `UPDATE admission.requirement_uploads
         SET registrar_status = 0,
             submitted_documents = 0,
             remarks = 0,
             missing_documents = NULL
         WHERE person_id = ?`,
        [person_id]
      );
    }

    res.json({ message: "✅ Registrar status updated for all docs", registrar_status });
  } catch (err) {
    console.error("❌ Error updating registrar status:", err);
    res.status(500).json({ error: "Failed to update registrar status" });
  }
});


// ✅ Update submitted_documents by upload_id (but apply to ALL docs of that applicant)
app.put("/api/submitted-documents/:upload_id", async (req, res) => {
  const { upload_id } = req.params;
  const { submitted_documents, user_person_id } = req.body;

  try {
    // 1️⃣ Find person_id
    const [[row]] = await db.query(
      "SELECT person_id FROM admission.requirement_uploads WHERE upload_id = ?",
      [upload_id]
    );
    if (!row) return res.status(404).json({ error: "Upload not found" });
    const person_id = row.person_id;

    // 2️⃣ Applicant info
    const [[appInfo]] = await db.query(`
      SELECT ant.applicant_number, pt.last_name, pt.first_name, pt.middle_name
      FROM applicant_numbering_table ant
      JOIN person_table pt ON ant.person_id = pt.person_id
      WHERE ant.person_id = ?
    `, [person_id]);

    const applicant_number = appInfo?.applicant_number || "Unknown";
    const fullName = `${appInfo?.last_name || ""}, ${appInfo?.first_name || ""} ${appInfo?.middle_name?.charAt(0) || ""}.`;

    // 3️⃣ Actor info
    let actorEmail = "earistmis@gmail.com";
    let actorFullName = "SYSTEM";
    if (user_person_id) {
      const [actorRows] = await db3.query(
        "SELECT email, role FROM user_accounts WHERE person_id = ? LIMIT 1",
        [user_person_id]
      );
      if (actorRows.length > 0) {
        actorEmail = actorRows[0].email;
        actorFullName = actorRows[0].role
          ? actorRows[0].role.toUpperCase()
          : actorEmail;
      }
    }

    // 4️⃣ Toggle + Log
    let type, message;
    if (submitted_documents === 1) {
      await db.query(`
        UPDATE admission.requirement_uploads
        SET submitted_documents = 1,
            registrar_status = 1,
            remarks = 1,
            missing_documents = '[]'
        WHERE person_id = ?`, [person_id]);

      type = "submit";
      message = `✅ Applicant #${applicant_number} - ${fullName} submitted all requirements.`;

    } else {
      await db.query(`
        UPDATE admission.requirement_uploads
        SET submitted_documents = 0,
            registrar_status = 0,
            remarks = 0,
            missing_documents = NULL
        WHERE person_id = ?`, [person_id]);

      type = "unsubmit";
      message = `↩️ Applicant #${applicant_number} - ${fullName} was unsubmitted.`;
    }

    // 5️⃣ Save log
    await db.query(
      `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type, message, applicant_number, actorEmail, actorFullName]
    );

    io.emit("notification", {
      type,
      message,
      applicant_number,
      actor_email: actorEmail,
      actor_name: actorFullName,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message });
  } catch (err) {
    console.error("❌ Error toggling submitted documents:", err);
    res.status(500).json({ error: "Failed to toggle submitted documents" });
  }
});

app.get("/api/verified-exam-applicants", async (req, res) => {
  try {
    // 1️⃣ Get all verifiable Regular requirement IDs dynamically
    const [reqRows] = await db.query(`
      SELECT id 
      FROM requirements_table 
      WHERE category = 'Regular' 
      AND is_verifiable = 1
    `);

    // 2️⃣ Convert the list of IDs into an array
    const requirementIds = reqRows.map(r => r.id);

    if (requirementIds.length === 0) {
      return res.status(400).json({ error: "No verifiable Regular requirements found." });
    }

    // 3️⃣ Construct placeholders for the IN clause dynamically
    const placeholders = requirementIds.map(() => "?").join(",");

    // 4️⃣ Use those IDs in the main query
    const [rows] = await db.query(
      `
      SELECT 
          ea.id AS exam_applicant_id,
          ea.applicant_id,
          ant.person_id,
          p.last_name,
          p.first_name,
          p.middle_name,
          p.emailAddress,
          p.program,
          ea.schedule_id
      FROM exam_applicants ea
      JOIN applicant_numbering_table ant 
          ON ea.applicant_id = ant.applicant_number
      JOIN person_table p 
          ON ant.person_id = p.person_id
      WHERE ant.person_id IN (
          SELECT person_id
          FROM requirement_uploads
          WHERE document_status = 'Documents Verified & ECAT'
            AND requirements_id IN (${placeholders})
          GROUP BY person_id
          HAVING COUNT(DISTINCT requirements_id) = ?
      )
      ORDER BY p.last_name ASC, p.first_name ASC
      `,
      [...requirementIds, requirementIds.length]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching verified exam applicants:", err);
    res.status(500).json({ error: "Failed to fetch verified exam applicants" });
  }
});



// Update requirements when submitted documents are checked
app.put("/api/update-requirements/:person_id", async (req, res) => {
  const { person_id } = req.params;
  const { requirements } = req.body;

  try {
    await db.query(
      "UPDATE admission.person_status_table SET requirements = ? WHERE person_id = ?",
      [requirements, person_id]
    );
    res.json({ success: true, message: "Requirements updated" });
  } catch (error) {
    console.error("❌ Error updating requirements:", error);
    res.status(500).json({ success: false, error: "Failed to update requirements" });
  }
});





app.put("/uploads/document-status/:upload_id", async (req, res) => {
  const { upload_id } = req.params;
  const { document_status, user_id } = req.body;

  if (!document_status || !user_id) {
    return res.status(400).json({ error: "document_status and user_id are required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE requirement_uploads SET document_status = ?, last_updated_by = ? WHERE upload_id = ?",
      [document_status, user_id, upload_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Upload not found" });
    }

    res.json({ success: true, message: "Document status updated" });
  } catch (err) {
    console.error("❌ Failed to update document status:", err);
    res.status(500).json({ error: "Failed to update document status" });
  }
});

// Update person.document_status directly
// ✅ Update vaccine docs only
app.put("/uploads/vaccine-status/:upload_id", async (req, res) => {
  const { status, remarks, document_status, user_id } = req.body;
  const { upload_id } = req.params;

  try {
    await db.query(
      `UPDATE requirement_uploads 
       SET status = ?, 
           remarks = ?, 
           document_status = COALESCE(?, document_status), 
           last_updated_by = ?
       WHERE upload_id = ? AND file_path LIKE '%VaccineCard%'`,
      [status, remarks || null, document_status, user_id, upload_id]
    );
    res.json({ success: true, message: "Vaccine status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating vaccine status" });
  }
});



// ✅ Fetch all applicant uploads (admin use)
app.get('/uploads/all', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        ru.upload_id,
        ru.requirements_id,
        ru.person_id,
        ru.file_path,
        ru.original_name,
        ru.remarks,
        ru.status,    
        ru.document_status,
        ru.registrar_status,
        ru.created_at,
        rt.description,
        p.applicant_number,
        p.first_name,
        p.middle_name,
        p.last_name,
       ua.email AS evaluator_email,
       ua.role AS evaluator_role
      FROM requirement_uploads ru
      JOIN requirements_table rt ON ru.requirements_id = rt.id
      JOIN person_table p ON ru.person_id = p.person_id
    `);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching all uploads:', err);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Update document_status and store who updated it
app.put("/uploads/document-status/:id", async (req, res) => {
  const { document_status, user_id } = req.body;
  const uploadId = req.params.id;

  try {
    const sql = `
      UPDATE requirement_uploads
      SET document_status = ?, last_updated_by = ?
      WHERE upload_id = ?
    `;
    await db.query(sql, [document_status, user_id, uploadId]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating document status:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



// === Upload for Medical Clearance (Vaccination Card only) ===
app.post("/api/upload/vaccine", upload.single("file"), async (req, res) => {
  try {
    const { person_id, remarks } = req.body;

    if (!person_id) {
      return res.status(400).json({ message: "Missing person_id" });
    }

    // ✅ Find requirement ID for Vaccine Card dynamically
    const [rows] = await db.query(
      "SELECT id, description FROM requirements_table WHERE LOWER(description) LIKE '%vaccine%' LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Vaccination Card requirement not found" });
    }

    const vaccineRequirementId = rows[0].id;
    const description = rows[0].description;
    const year = new Date().getFullYear();
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ✅ Fetch applicant_number for filename
    const [[applicant]] = await db.query(
      "SELECT applicant_number FROM applicant_numbering_table WHERE person_id = ?",
      [person_id]
    );

    if (!applicant) {
      return res.status(404).json({ message: "Applicant number not found" });
    }

    const applicant_number = applicant.applicant_number;

    // ✅ Standardized short label
    const filename = `${applicant_number}_VaccineCard_${year}${ext}`;
    const finalPath = path.join(__dirname, "uploads", filename);

    // ✅ Remove old vaccine uploads for this applicant
    const [existingFiles] = await db.query(
      "SELECT upload_id, file_path FROM requirement_uploads WHERE person_id = ? AND requirements_id = ?",
      [person_id, vaccineRequirementId]
    );

    for (const file of existingFiles) {
      try {
        await fs.promises.unlink(path.join(__dirname, "uploads", file.file_path));
      } catch (err) {
        console.warn("File delete warning:", err.message);
      }
      await db.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [file.upload_id]);
    }

    // ✅ Save file physically
    await fs.promises.writeFile(finalPath, req.file.buffer);

    // ✅ Insert into DB with proper path
    await db.query(
      "INSERT INTO requirement_uploads (requirements_id, person_id, file_path, original_name, remarks, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        vaccineRequirementId,
        person_id,
        filename, // ✅ store just the filename (not null)
        req.file.originalname,
        remarks || "",
        "0"
      ]
    );

    res.status(200).json({ message: "✅ Vaccine Card uploaded successfully" });
  } catch (err) {
    console.error("❌ Vaccine upload failed:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// ✅ Get uploads by applicant_number (Admin use)
app.get("/uploads/by-applicant/:applicant_number", async (req, res) => {
  const applicant_number = req.params.applicant_number;

  try {
    const [personResult] = await db.query(
      "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
      [applicant_number]
    );

    if (personResult.length === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const person_id = personResult[0].person_id;

    const [uploads] = await db.query(`
      SELECT 
        ru.upload_id,
        ru.requirements_id,
        ru.person_id,
        ru.file_path,
        ru.original_name,
        ru.remarks,
        ru.status,
        ru.document_status,
        ru.registrar_status,
        ru.created_at,
        rt.description,
        CASE
          WHEN LOWER(rt.description) LIKE '%form 138%' THEN 'Form138'
          WHEN LOWER(rt.description) LIKE '%good moral%' THEN 'GoodMoralCharacter'
          WHEN LOWER(rt.description) LIKE '%birth certificate%' THEN 'BirthCertificate'
          WHEN LOWER(rt.description) LIKE '%graduating class%' THEN 'CertificateOfGraduatingClass'
          WHEN LOWER(rt.description) LIKE '%vaccine card%' THEN 'VaccineCard'
          ELSE 'Unknown'
        END AS short_label,
        ua.email AS evaluator_email,
        ua.role  AS evaluator_role,
        pr.lname AS evaluator_lname,
        pr.fname AS evaluator_fname,
        pr.mname AS evaluator_mname
      FROM requirement_uploads ru
      JOIN requirements_table rt 
        ON ru.requirements_id = rt.id
      LEFT JOIN enrollment.user_accounts ua 
        ON ru.last_updated_by = ua.person_id
      LEFT JOIN enrollment.prof_table pr 
        ON ua.person_id = pr.person_id
      WHERE ru.person_id = ?
    `, [person_id]);

    res.status(200).json(uploads);
  } catch (err) {
    console.error("Error fetching uploads by applicant number:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



// ✅ Update document status and track who edited
app.put('/uploads/document-status/:uploadId', (req, res) => {
  const { document_status } = req.body;
  const { uploadId } = req.params;

  // 👇 Example: take user_id from authenticated user
  const registrarPersonId = req.user.person_id; // middleware should set this from JWT

  if (!document_status || !registrarPersonId) {
    return res.status(400).json({ error: "document_status and registrar is required" });
  }

  const sql = `
    UPDATE requirement_uploads 
    SET document_status = ?, last_updated_by = ?, registrar_status = 1, created_at = NOW()
    WHERE upload_id = ?
  `;

  db3.query(sql, [document_status, registrarPersonId, uploadId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update document status:", err);
      return res.status(500).json({ error: "Failed to update document status" });
    }
    res.json({ success: true, message: "Document status updated", result });
  });
});


// ✅ Get uploads with evaluator info



// Add to server.js
// 📌 GET persons and their applicant numbers for AdminRequirementsPanel.jsx
app.get("/api/upload_documents", async (req, res) => {
  try {
    const [persons] = await db.query(`
      SELECT 
        pt.person_id,
        pt.first_name,
        pt.middle_name,
        pt.last_name,
        pt.profile_img,
        pt.height,
        pt.generalAverage1,
        pt.emailAddress,
        ant.applicant_number
      FROM person_table pt
      LEFT JOIN applicant_numbering_table ant ON pt.person_id = ant.person_id
    `);

    res.status(200).json(persons);
  } catch (error) {
    console.error("❌ Error fetching upload documents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/api/notifications", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications ORDER BY timestamp DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});




// -------------------------------------------- GET APPLICANT ADMISSION DATA ------------------------------------------------//
app.get("/api/all-applicants", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        snt.student_number,
        p.person_id,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.extension,
        p.program,
        p.emailAddress,
        p.generalAverage1,
        p.campus,
        p.created_at,
        p.birthOfDate,
        p.gender,
        a.applicant_number,
        SUBSTRING(a.applicant_number, 5, 1) AS middle_code,
        ea.schedule_id,
        ees.day_description AS exam_day,
        ees.room_description AS exam_room,
        ees.start_time AS exam_start_time,
        ees.end_time AS exam_end_time,

        /* latest prioritized upload id for this person */
        ruprio.upload_id AS upload_id,
        ruprio.submitted_medical,

        /* ✅ allow NULL values to pass through */
        ruprio.submitted_documents,
        ruprio.registrar_status,

        /* collect missing_documents across uploads if you still want to show aggregated missing docs */
        ruagg.all_missing_docs,

        ruprio.document_status,
        ruprio.created_at AS last_updated,
        ps.exam_status,

        /* ✅ NEW: how many required docs are verified */
        COALESCE(vdocs.verified_count, 0) AS required_docs_verified

      FROM admission.person_table AS p
      LEFT JOIN admission.applicant_numbering_table AS a
        ON p.person_id = a.person_id
      LEFT JOIN admission.exam_applicants AS ea
        ON a.applicant_number = ea.applicant_id
      LEFT JOIN admission.entrance_exam_schedule AS ees
        ON ea.schedule_id = ees.schedule_id
      LEFT JOIN enrollment.student_numbering_table AS snt
        ON p.person_id = snt.person_id

      /* get aggregated missing_documents for display only */
      LEFT JOIN (
        SELECT
          person_id,
          GROUP_CONCAT(missing_documents SEPARATOR '||') AS all_missing_docs
        FROM admission.requirement_uploads
        GROUP BY person_id
      ) AS ruagg ON ruagg.person_id = p.person_id

      /* ✅ get the prioritized row per applicant */
      LEFT JOIN admission.requirement_uploads AS ruprio
        ON ruprio.upload_id = (
          SELECT ru2.upload_id
          FROM admission.requirement_uploads ru2
          WHERE ru2.person_id = p.person_id
          ORDER BY 
            CASE 
              WHEN ru2.document_status = 'Disapproved' THEN 1
              WHEN ru2.document_status = 'Program Closed' THEN 2
              WHEN ru2.document_status = 'Documents Verified & ECAT' THEN 3
              WHEN ru2.document_status = 'On process' THEN 4
              ELSE 5
            END ASC,
            ru2.upload_id DESC
          LIMIT 1
        )

      LEFT JOIN admission.person_status_table AS ps
        ON p.person_id = ps.person_id

      /* ✅ subquery: count verified docs for this applicant */
      LEFT JOIN (
        SELECT person_id, COUNT(DISTINCT requirements_id) AS verified_count
        FROM admission.requirement_uploads
        WHERE document_status = 'Documents Verified & ECAT'
          AND requirements_id IN (1,2,3,4)
        GROUP BY person_id
      ) AS vdocs ON vdocs.person_id = p.person_id

      ORDER BY p.last_name ASC, p.first_name ASC
    `);

    // Parse aggregated missing_documents into array (if present)
    const merged = rows.map(r => {
      let mergedDocs = [];
      if (r.all_missing_docs) {
        const parts = r.all_missing_docs.split('||');
        const all = parts.flatMap(item => {
          try {
            if (!item || item === 'null') return [];
            return JSON.parse(item);
          } catch {
            return [];
          }
        });
        mergedDocs = [...new Set(all)];
      }
      return {
        ...r,
        missing_documents: mergedDocs
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("❌ Error fetching all applicants:", err);
    res.status(500).send("Server error");
  }
});

// ================= VERIFIED & ECAT APPLICANTS =================
// ================= VERIFIED & ECAT APPLICANTS =================
app.get("/api/verified-ecat-applicants", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT
        p.person_id,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.extension,
        p.emailAddress,
        p.program,
        p.created_at,
        a.applicant_number,
        SUBSTRING(a.applicant_number, 5, 1) AS middle_code,
        ea.schedule_id,
        ea.email_sent,
        ees.day_description,
        ees.room_description,
        ees.start_time,
        ees.end_time,
        ps.exam_status
      FROM admission.person_table AS p
      LEFT JOIN admission.applicant_numbering_table AS a 
        ON p.person_id = a.person_id
      LEFT JOIN admission.exam_applicants AS ea 
        ON a.applicant_number = ea.applicant_id
      LEFT JOIN admission.entrance_exam_schedule AS ees
        ON ea.schedule_id = ees.schedule_id
      LEFT JOIN admission.person_status_table AS ps 
        ON p.person_id = ps.person_id
      WHERE p.person_id IN (
        SELECT ru.person_id
        FROM admission.requirement_uploads ru
        WHERE ru.document_status = 'Documents Verified & ECAT'
          AND ru.requirements_id IN (1,2,3,4)
        GROUP BY ru.person_id
        HAVING COUNT(DISTINCT ru.requirements_id) = 4
      )
      AND (ea.email_sent IS NULL OR ea.email_sent = 0)   -- ⬅️ only show those not yet emailed
      ORDER BY p.last_name ASC, p.first_name ASC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching verified ECAT applicants:", err);
    res.status(500).send("Server error");
  }
});


// ================= ENTRANCE EXAM SCHEDULE =================

// Get all schedules (rooms + times)
app.get("/exam_schedules", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        schedule_id,
        day_description,
        room_description,
        start_time,
        end_time,
        room_quota
      FROM admission.entrance_exam_schedule
      ORDER BY day_description, start_time
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching exam schedules:", err);
    res.status(500).send("Server error");
  }
});

// Get schedules with current occupancy count
app.get("/exam_schedules_with_count", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        ees.schedule_id,
        ees.day_description,
        ees.building_description,
        ees.room_description,
        ees.start_time,
        ees.proctor,
        ees.end_time,
        ees.room_quota,
        ees.created_at,
        COUNT(ea.applicant_id) AS current_occupancy
      FROM admission.entrance_exam_schedule ees
      LEFT JOIN admission.exam_applicants ea
        ON ees.schedule_id = ea.schedule_id
      GROUP BY ees.schedule_id
      ORDER BY ees.day_description, ees.start_time
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching exam schedules with count:", err);
    res.status(500).send("Server error");
  }
});

// 📌 Import Excel to person_status_table
// 📌 Import Excel to person_status_table + log notifications
app.post("/api/qualifying_exam/import", async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];
    if (rows.length === 0) return res.status(400).json({ success: false, error: "No rows found" });

    const applicantNumbers = rows.map(r => r.applicant_number).filter(n => n);
    if (!applicantNumbers.length) return res.status(400).json({ success: false, error: "No valid applicant numbers" });

    const [matches] = await db.query(
      `SELECT person_id, applicant_number FROM applicant_numbering_table WHERE applicant_number IN (?)`,
      [applicantNumbers]
    );

    const applicantMap = {};
    matches.forEach(m => { applicantMap[m.applicant_number] = m.person_id; });

    const values = [];
    for (const row of rows) {
      const personId = applicantMap[row.applicant_number];
      if (!personId) continue;

      const qExam = Number(row.qualifying_exam_score) || 0;
      const qInterview = Number(row.qualifying_interview_score) || 0;
      const totalAve = Number(row.total_ave) || (qExam + qInterview) / 2;

      values.push([personId, qExam, qInterview, totalAve]);
    }

    if (!values.length) return res.status(400).json({ success: false, error: "No valid data to import" });

    await db.query(
      `INSERT INTO person_status_table (person_id, qualifying_result, interview_result, exam_result)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         qualifying_result = VALUES(qualifying_result),
         interview_result = VALUES(interview_result),
         exam_result = VALUES(exam_result)`,
      [values]
    );

    // ✅ Use user_accounts instead of prof_table
    const [registrarRows] = await db3.query(
      "SELECT last_name, first_name, middle_name, email, employee_id FROM user_accounts WHERE role = 'registrar' LIMIT 1"
    );
    const registrar = registrarRows[0];
    const registrarEmail = registrar?.email || "earistmis@gmail.com";
    const registrarFullName = registrar
      ? `${registrar.last_name}, ${registrar.first_name} ${registrar.middle_name || ""}`.trim()
      : "Registrar";
    const registrarDisplay = `REGISTRAR (${registrar?.employee_id || "N/A"}) - ${registrarFullName} - ${registrarEmail}`;

    // ✅ Log notification
    const message = `📊 Bulk Qualifying/Interview Exam Scores uploaded by ${registrarDisplay}`;
    await db.query(
      "INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp) VALUES (?, ?, ?, ?, ?, NOW())",
      ["upload", message, null, registrarEmail, registrarFullName]
    );

    io.emit("notification", {
      type: "upload",
      message,
      applicant_number: null,
      actor_email: registrarEmail,
      actor_name: registrarFullName,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: "Excel imported successfully!" });
  } catch (err) {
    console.error("❌ Bulk import error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api-applicant-scoring", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        p.person_id,
        p.campus,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.extension,
        a.applicant_number,
        SUBSTRING(a.applicant_number, 5, 1) AS middle_code,
        p.program,
        p.created_at,

        -- Exam scores
        e.English AS english,
        e.Science AS science,
        e.Filipino AS filipino,
        e.Math AS math,
        e.Abstract AS abstract,
        COALESCE(
          e.final_rating,
          (COALESCE(e.English,0) + COALESCE(e.Science,0) + COALESCE(e.Filipino,0) + COALESCE(e.Math,0) + COALESCE(e.Abstract,0))
        ) AS final_rating,

        -- Exam encoder (admission DB)
        e.user AS exam_user_id,
        ue.email AS exam_user_email,

        -- Registrar (enrollment DB, db3)
        ur.id AS registrar_user_id,
        ur.email AS registrar_user_email,
        ur.role AS registrar_role,

        -- From person_status_table
        COALESCE(ps.exam_result, 0)        AS total_ave,
        COALESCE(ps.qualifying_result, 0)  AS qualifying_exam_score,
        COALESCE(ps.interview_result, 0)   AS qualifying_interview_score,

        -- ✅ College Approval (interview_applicants.status)
        ia.status AS college_approval_status

      FROM admission.person_table p
      INNER JOIN admission.applicant_numbering_table a 
        ON p.person_id = a.person_id
      LEFT JOIN admission.admission_exam e
        ON p.person_id = e.person_id
      LEFT JOIN enrollment.user_accounts ue   -- exam encoder
        ON e.user = ue.id
      LEFT JOIN admission.person_status_table ps
        ON p.person_id = ps.person_id
      LEFT JOIN enrollment.user_accounts ur   -- registrar
        ON ur.role = 'registrar'
      LEFT JOIN admission.interview_applicants ia   -- 👈 add join here
        ON ia.applicant_id = a.applicant_number

      ORDER BY p.person_id ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching applicants with number:", err);
    res.status(500).send("Server error");
  }
});

// Assign Max Slots
app.put("/api/interview_applicants/assign-max", async (req, res) => {
  try {
    const { dprtmnt_id, schoolYear, semester } = req.body;

    if (!dprtmnt_id || !schoolYear || !semester) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get top applicants for that dept, year, sem
    const [topApplicants] = await db.query(
      `SELECT ea.applicant_id
       FROM exam_applicants ea
       WHERE ea.dprtmnt_id = ? AND ea.school_year = ? AND ea.semester = ?
       ORDER BY ea.total_score DESC, ea.exam_date ASC`,
      [dprtmnt_id, schoolYear, semester]
    );

    if (!topApplicants.length) {
      return res.json({ success: false, message: "No applicants found" });
    }

    // Insert/update into interview_applicants with action = 1
    for (const applicant of topApplicants) {
      await db.query(
        `INSERT INTO interview_applicants (applicant_id, action, email_sent)
         VALUES (?, 1, 0)
         ON DUPLICATE KEY UPDATE action = 1`,
        [applicant.applicant_id]
      );
    }

    res.json({ success: true, count: topApplicants.length });
  } catch (err) {
    console.error("Error in assign-max:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Assign Custom Slots
app.put("/api/interview_applicants/assign-custom", async (req, res) => {
  try {
    const { dprtmnt_id, schoolYear, semester, count } = req.body;

    if (!dprtmnt_id || !schoolYear || !semester || !count) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get top N applicants
    const [topApplicants] = await db.query(
      `SELECT ea.applicant_id
       FROM exam_applicants ea
       WHERE ea.dprtmnt_id = ? AND ea.school_year = ? AND ea.semester = ?
       ORDER BY ea.total_score DESC, ea.exam_date ASC
       LIMIT ?`,
      [dprtmnt_id, schoolYear, semester, Number(count)]
    );

    if (!topApplicants.length) {
      return res.json({ success: false, message: "No applicants found" });
    }

    // Insert/update into interview_applicants with action = 1
    for (const applicant of topApplicants) {
      await db.query(
        `INSERT INTO interview_applicants (applicant_id, action, email_sent)
         VALUES (?, 1, 0)
         ON DUPLICATE KEY UPDATE action = 1`,
        [applicant.applicant_id]
      );
    }

    res.json({ success: true, count: topApplicants.length });
  } catch (err) {
    console.error("Error in assign-custom:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/applicants-with-number", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        p.person_id,
        p.campus,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.extension,
        p.emailAddress,
        a.applicant_number,
        SUBSTRING(a.applicant_number, 5, 1) AS middle_code,
        p.program,
        p.created_at,
        ia.status AS interview_status,

        -- Exam scores
        e.English AS english,
        e.Science AS science,
        e.Filipino AS filipino,
        e.Math AS math,
        e.Abstract AS abstract,
        COALESCE(
          e.final_rating,
          (COALESCE(e.English,0) + COALESCE(e.Science,0) + COALESCE(e.Filipino,0) + COALESCE(e.Math,0) + COALESCE(e.Abstract,0))
        ) AS final_rating,

        -- Exam encoder (admission DB)
        e.user AS exam_user_id,
        ue.email AS exam_user_email,

        -- From person_status_table
        COALESCE(ps.exam_result, 0)        AS total_ave,
        COALESCE(ps.qualifying_result, 0)  AS qualifying_exam_score,
        COALESCE(ps.interview_result, 0)   AS qualifying_interview_score,

        -- ✅ College Approval (interview_applicants.status)
        ia.status AS college_approval_status,
        ia.action AS action

      FROM admission.person_table p
      INNER JOIN admission.applicant_numbering_table a 
        ON p.person_id = a.person_id
      LEFT JOIN admission.admission_exam e
        ON p.person_id = e.person_id
      LEFT JOIN enrollment.user_accounts ue   -- exam encoder
        ON e.user = ue.id
      LEFT JOIN admission.person_status_table ps
        ON p.person_id = ps.person_id
      LEFT JOIN admission.interview_applicants ia
        ON ia.applicant_id = a.applicant_number

      ORDER BY p.person_id ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching applicants with number:", err);
    res.status(500).send("Server error");
  }
});

// Get full person info + applicant_number
app.get("/api/person_with_applicant/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [[person]] = await db.query(`
      SELECT 
        pt.*,
        ant.applicant_number
      FROM person_table pt
      JOIN applicant_numbering_table ant ON pt.person_id = ant.person_id
      WHERE pt.person_id = ? OR ant.applicant_number = ?
      LIMIT 1
    `, [id, id]);

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    // get latest document status + evaluator
    const [rows] = await db.query(`
      SELECT 
        ru.document_status    AS upload_document_status,
        rt.id                 AS requirement_id,
        ua.email              AS evaluator_email,
        ua.role               AS evaluator_role,
        pr.fname              AS evaluator_fname,
        pr.mname              AS evaluator_mname,
        pr.lname              AS evaluator_lname,
        ru.created_at,
        ru.last_updated_by
      FROM requirement_uploads AS ru
      LEFT JOIN requirements_table AS rt ON ru.requirements_id = rt.id
      LEFT JOIN enrollment.user_accounts ua ON ru.last_updated_by = ua.person_id
      LEFT JOIN enrollment.prof_table pr   ON ua.person_id = pr.person_id
      WHERE ru.person_id = ?
      ORDER BY ru.created_at DESC
      LIMIT 1
    `, [person.person_id]);

    if (rows.length > 0) {
      person.document_status = rows[0].upload_document_status || "On process";
      person.evaluator = rows[0];
    } else {
      person.document_status = "On process";
      person.evaluator = null;
    }

    res.json(person);

  } catch (err) {
    console.error("❌ Error fetching person_with_applicant:", err);
    res.status(500).json({ error: "Failed to fetch person" });
  }
});





// Count how many applicants are enrolled
app.get("/api/enrolled-count", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS total FROM person_table WHERE classifiedAs = 'Freshman (First Year)' OR classifiedAs = 'Transferee' OR classifiedAs = 'Returnee'"
    );
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error("Error fetching enrolled count:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/notify-submission", async (req, res) => {
  const { person_id } = req.body;

  if (!person_id) {
    return res.status(400).json({ message: "Missing person_id" });
  }

  try {
    const [[appInfo]] = await db.query(`
      SELECT 
        ant.applicant_number,
        pt.last_name,
        pt.first_name,
        pt.middle_name
      FROM applicant_numbering_table ant
      JOIN person_table pt ON ant.person_id = pt.person_id
      WHERE ant.person_id = ?
    `, [person_id]);

    const applicant_number = appInfo?.applicant_number || 'Unknown';
    const fullName = `${appInfo?.last_name || ''}, ${appInfo?.first_name || ''} ${appInfo?.middle_name?.charAt(0) || ''}.`;

    const message = `✅ Applicant #${applicant_number} - ${fullName} submitted their form.`;

    // Save to notifications table
    await db.query(
      "INSERT INTO notifications (type, message, applicant_number) VALUES (?, ?, ?)",
      ['submit', message, applicant_number]
    );

    // Emit notification
    io.emit("notification", {
      type: "submit",
      message,
      applicant_number,
      timestamp: new Date().toISOString()
    });

    res.json({ message: "Submission notification sent." });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Failed to notify", error: err.message });
  }
});
// ✅ GET person details by person_id
app.get("/api/person/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }
});


// ✅ PUT update person details by person_id
// ✅ Unified and Safe PUT update person details by person_id
app.put("/api/person/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // 2️⃣ Clean the incoming data
    const cleanedEntries = Object.entries(req.body)
      // remove undefined keys
      .filter(([_, value]) => value !== undefined)
      // treat empty string as NULL
      .map(([key, value]) => [key, value === "" ? null : value]);

    // 3️⃣ Make sure we have valid data to update
    if (cleanedEntries.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // 4️⃣ Build dynamic SQL
    const setClause = cleanedEntries.map(([key]) => `${key}=?`).join(", ");
    const values = cleanedEntries.map(([_, value]) => value);
    values.push(id); // add person_id for WHERE clause

    const sql = `UPDATE person_table SET ${setClause} WHERE person_id=?`;

    // 5️⃣ Execute query
    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Person not found or no changes made" });
    }

    // 6️⃣ Success
    res.json({ message: "✅ Person updated successfully" });
  } catch (error) {
    console.error("❌ Error updating person:", error);
    res.status(500).json({
      error: "Database error during update",
      details: error.message,
    });
  }
});


app.post("/api/person/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    const dataRows = rawRows.slice(1); // skip header

    let insertedCount = 0;
    const batchSize = 500; // 💡 process small batches
    const columns = [
      "student_number", "profile_img", "campus", "academicProgram", "classifiedAs", "applyingAs",
      "program", "program2", "program3", "yearLevel", "last_name", "first_name", "middle_name",
      "extension", "nickname", "height", "weight", "lrnNumber", "nolrnNumber", "gender", "pwdMember",
      "pwdType", "pwdId", "birthOfDate", "age", "birthPlace", "languageDialectSpoken", "citizenship",
      "religion", "civilStatus", "tribeEthnicGroup", "cellphoneNumber", "emailAddress", "presentStreet",
      "presentBarangay", "presentZipCode", "presentRegion", "presentProvince", "presentMunicipality",
      "presentDswdHouseholdNumber", "sameAsPresentAddress", "permanentStreet", "permanentBarangay",
      "permanentZipCode", "permanentRegion", "permanentProvince", "permanentMunicipality",
      "permanentDswdHouseholdNumber", "solo_parent", "father_deceased", "father_family_name",
      "father_given_name", "father_middle_name", "father_ext", "father_nickname", "father_education",
      "father_education_level", "father_last_school", "father_course", "father_year_graduated",
      "father_school_address", "father_contact", "father_occupation", "father_employer", "father_income",
      "father_email", "mother_deceased", "mother_family_name", "mother_given_name", "mother_middle_name",
      "mother_ext", "mother_nickname", "mother_education", "mother_education_level", "mother_last_school",
      "mother_course", "mother_year_graduated", "mother_school_address", "mother_contact",
      "mother_occupation", "mother_employer", "mother_income", "mother_email", "guardian",
      "guardian_family_name", "guardian_given_name", "guardian_middle_name", "guardian_ext",
      "guardian_nickname", "guardian_address", "guardian_contact", "guardian_email", "annual_income",
      "schoolLevel", "schoolLastAttended", "schoolAddress", "courseProgram", "honor", "generalAverage",
      "yearGraduated", "schoolLevel1", "schoolLastAttended1", "schoolAddress1", "courseProgram1",
      "honor1", "generalAverage1", "yearGraduated1", "strand", "cough", "colds", "fever", "asthma",
      "faintingSpells", "heartDisease", "tuberculosis", "frequentHeadaches", "hernia", "chronicCough",
      "headNeckInjury", "hiv", "highBloodPressure", "diabetesMellitus", "allergies", "cancer",
      "smokingCigarette", "alcoholDrinking", "hospitalized", "hospitalizationDetails", "medications",
      "hadCovid", "covidDate", "vaccine1Brand", "vaccine1Date", "vaccine2Brand", "vaccine2Date",
      "booster1Brand", "booster1Date", "booster2Brand", "booster2Date", "chestXray", "cbc", "urinalysis",
      "otherworkups", "symptomsToday", "remarks", "termsOfAgreement", "created_at"
    ];

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const chunk = dataRows.slice(i, i + batchSize);
      const validPersons = [];
      const numberingRows = [];

      for (const row of chunk) {
        if (!row[0]) continue;
        const studentNumber = row[0].toString().trim();
        if (!/^\d{9,10}$|^\d{3}-\d{3,5}[A-Z]?$/.test(studentNumber)) continue;

        const person = columns.map((_, idx) => (row[idx] ? row[idx] : ""));
        person[columns.length - 1] = row[146] || new Date(); // created_at

        validPersons.push(person);
        numberingRows.push(studentNumber);
      }

      if (validPersons.length === 0) continue;

      const insertQuery = `
        INSERT INTO person_table (${columns.join(",")}) VALUES ?
      `;
      const [result] = await db3.query(insertQuery, [validPersons]);
      insertedCount += result.affectedRows;

      // add numbering
      const studentNumberPairs = numberingRows.map((sn, idx) => [
        sn,
        result.insertId + idx,
      ]);
      await db3.query(
        "INSERT INTO student_numbering_table (student_number, person_id) VALUES ?",
        [studentNumberPairs]
      );

      console.log(`✅ Batch ${i / batchSize + 1} inserted (${validPersons.length} rows)`);
    }

    res.json({
      success: true,
      message: `Excel import done ✅ Total inserted: ${insertedCount}`,
    });
  } catch (err) {
    console.error("❌ Import error:", err);
    res.status(500).json({ error: "Failed to import Excel" });
  }
});

// ✅ Search by student number or name in enrollment db3
app.get("/api/search-person-student", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing search query" });

  try {
    const [rows] = await db3.query(`
      SELECT p.*, s.student_number
      FROM student_numbering_table s
      JOIN person_table p ON s.person_id = p.person_id
      WHERE s.student_number LIKE ?
         OR p.last_name LIKE ?
         OR p.first_name LIKE ?
         OR p.emailAddress LIKE ?
      LIMIT 1
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    if (!rows.length)
      return res.status(404).json({ message: "No matching student found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error searching person (db3):", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// ✅ Fetch full record
app.get("/api/person/:person_id", async (req, res) => {
  const { person_id } = req.params;
  const [rows] = await db3.query(`
    SELECT p.*, s.student_number
    FROM person_table p
    LEFT JOIN student_numbering_table s ON p.person_id = s.person_id
    WHERE p.person_id = ?
  `, [person_id]);
  if (!rows.length) return res.status(404).json({ message: "Person not found" });
  res.json(rows[0]);
});


// ✅ Update person in ENROLLMENT DB (db3)
app.put("/api/enrollment/person/:person_id", async (req, res) => {
  const { person_id } = req.params;
  const updatedData = req.body;

  try {
    const [result] = await db3.query("UPDATE person_table SET ? WHERE person_id = ?", [updatedData, person_id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Person not found in ENROLLMENT" });

    res.json({ success: true, message: "Person updated successfully in ENROLLMENT DB3" });
  } catch (err) {
    console.error("❌ Error updating person in ENROLLMENT DB:", err);
    res.status(500).json({ error: "Failed to update person in ENROLLMENT DB" });
  }
});


// GET for Dashboard1
app.get("/api/dashboard1/:id", checkStepAccess(1), async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id = ?", [id]);
  res.json(rows[0]);
});

// GET for Dashboard2
app.get("/api/dashboard2/:id", checkStepAccess(2), async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id = ?", [id]);
  res.json(rows[0]);
});

// GET for Dashboard3
app.get("/api/dashboard3/:id", checkStepAccess(3), async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id = ?", [id]);
  res.json(rows[0]);
});

// GET for Dashboard4
app.get("/api/dashboard4/:id", checkStepAccess(4), async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id = ?", [id]);
  res.json(rows[0]);
});

// GET for Dashboard5
app.get("/api/dashboard5/:id", checkStepAccess(5), async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id = ?", [id]);
  res.json(rows[0]);
});

app.put("/api/person/:id/progress", async (req, res) => {
  const { id } = req.params;
  const { nextStep } = req.body;

  try {
    await db.execute("UPDATE person_table SET current_step = ? WHERE person_id = ?", [nextStep, id]);
    res.json({ message: "Progress updated" });
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// For Major 
app.get("/api/programs", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM program_table");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/upload-profile-picture", upload.single("profile_picture"), async (req, res) => {
  const { person_id } = req.body;
  if (!person_id || !req.file) {
    return res.status(400).send("Missing person_id or file.");
  }

  try {
    // ✅ Get applicant_number from person_id
    const [rows] = await db.query("SELECT applicant_number FROM applicant_numbering_table WHERE person_id = ?", [person_id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Applicant number not found for person_id " + person_id });
    }

    const applicant_number = rows[0].applicant_number;

    const ext = path.extname(req.file.originalname).toLowerCase();
    const year = new Date().getFullYear();
    const filename = `${applicant_number}_1by1_${year}${ext}`; // ✅ Use applicant number here
    const finalPath = path.join(__dirname, "uploads", filename);

    // ✅ Save file
    await fs.promises.writeFile(finalPath, req.file.buffer);

    // ✅ Save to DB (still use person_id here)
    await db3.query("UPDATE person_table SET profile_img = ? WHERE person_id = ?", [filename, person_id]);

    res.status(200).json({ message: "Uploaded successfully", filename });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Failed to upload image.");
  }
});


// ✅ 2. Get person details by person_id
app.get("/api/person/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM person_table WHERE person_id=?", [id]);

    if (!rows.length) return res.status(404).json({ error: "Person not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ 4. Upload & update profile_img
app.post("/api/person/:id/upload-profile", upload.single("profile_img"), async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = req.file?.filename;

    if (!filePath) return res.status(400).json({ error: "No file uploaded" });

    // Remove old image if exists
    const [rows] = await db.execute("SELECT profile_img FROM person_table WHERE person_id=?", [id]);
    const oldImg = rows[0]?.profile_img;

    if (oldImg) {
      const oldPath = path.join(__dirname, "uploads", oldImg);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.execute("UPDATE person_table SET profile_img=? WHERE person_id=?", [filePath, id]);
    res.json({ message: "Profile image updated", profile_img: filePath });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ 5. Get applied programs list (sample, adjust db name/table)
// server.js
app.get("/api/applied_program", async (req, res) => {
  try {
    const [rows] = await db3.execute(`
      SELECT 
        ct.curriculum_id,
        pt.program_id,
        pt.program_code,
        pt.program_description,
        pt.major,
        d.dprtmnt_id,
        d.dprtmnt_name
      FROM curriculum_table AS ct
      INNER JOIN program_table AS pt ON pt.program_id = ct.program_id
      INNER JOIN dprtmnt_curriculum_table AS dc ON ct.curriculum_id = dc.curriculum_id
      INNER JOIN dprtmnt_table AS d ON dc.dprtmnt_id = d.dprtmnt_id
    `);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No curriculum data found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching curriculum data:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Get all saved school years with semester info
app.get("/api/school_years", async (req, res) => {
  try {
    const [rows] = await db3.query(`
      SELECT 
        yt.year_description,
        st.semester_description,
        sy.astatus
      FROM school_year_table sy
      JOIN year_table yt ON sy.year_id = yt.year_id
      JOIN semester_table st ON sy.semester_id = st.semester_id
      ORDER BY yt.year_description DESC, st.semester_id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching school years:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// ✅ Get year list only
app.get("/api/year_table", async (req, res) => {
  try {
    const [rows] = await db3.query(`SELECT * FROM year_table ORDER BY year_description DESC`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching year_table:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// ✅ Get semester list only
app.get("/api/semester_table", async (req, res) => {
  try {
    const [rows] = await db3.query(`SELECT * FROM semester_table`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching semester_table:", error);
    res.status(500).json({ message: "Database error" });
  }
});


app.get("/api/search-person", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        a.applicant_number
      FROM person_table p
      LEFT JOIN applicant_numbering_table a ON p.person_id = a.person_id
      WHERE a.applicant_number LIKE ? 
         OR p.first_name LIKE ?
         OR p.last_name LIKE ?
         OR p.emailAddress LIKE ?
      LIMIT 1
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No matching applicant found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error searching person:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Update document_status for a person
// Update document_status for all uploads of a person
app.put("/api/uploads/person/:id/document-status", async (req, res) => {
  const { id } = req.params;
  const { document_status } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE requirement_uploads SET document_status = ? WHERE person_id = ?",
      [document_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Uploads for person not found" });
    }

    res.json({ success: true, document_status });
  } catch (err) {
    console.error("Error updating document_status:", err);
    res.status(500).json({ error: "Failed to update document_status" });
  }
});


// server.js
app.post("/api/requirement-uploads", async (req, res) => {
  const {
    requirements_id,
    person_id,
    file_path,
    original_name,
    status,
    document_status,
    missing_documents,
    remarks
  } = req.body;

  try {
    await db.query(
      `INSERT INTO requirement_uploads 
        (requirements_id, person_id, file_path, original_name, status, document_status, missing_documents, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        file_path = VALUES(file_path),
        original_name = VALUES(original_name),
        status = VALUES(status),
        document_status = VALUES(document_status),
        missing_documents = VALUES(missing_documents),
        remarks = VALUES(remarks),
        last_updated_by = VALUES(last_updated_by)`,
      [requirements_id, person_id, file_path, original_name, status, document_status, missing_documents, remarks]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving requirement:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ Update missing_documents for all rows of this person
app.put("/api/missing-documents/:person_id", async (req, res) => {
  const { person_id } = req.params;
  let { missing_documents, user_id } = req.body;

  try {
    if (!Array.isArray(missing_documents)) {
      missing_documents = [];
    }

    const jsonDocs = JSON.stringify(missing_documents);

    await db.query(
      `UPDATE admission.requirement_uploads
       SET missing_documents = ?, last_updated_by = ?
       WHERE person_id = ?`,
      [jsonDocs, user_id || null, person_id]
    );

    res.json({ success: true, message: "Missing documents updated" });
  } catch (err) {
    console.error("❌ Error updating missing_documents:", err);
    res.status(500).json({ success: false, error: "Failed to update missing_documents" });
  }
});


// Update requirement upload (submitted + missing documents)
app.post("/api/update-requirement", async (req, res) => {
  const { person_id, requirements_id, submitted_documents } = req.body;
  let { missing_documents } = req.body;

  try {
    if (Array.isArray(missing_documents)) {
      missing_documents = JSON.stringify(missing_documents);
    } else if (typeof missing_documents !== "string") {
      missing_documents = "[]";
    }

    await db.query(
      `UPDATE requirement_uploads 
       SET submitted_documents = ?, missing_documents = ?
       WHERE person_id = ? AND requirements_id = ?`,
      [submitted_documents, missing_documents, person_id, requirements_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating requirement:", err);
    res.status(500).json({ error: "Failed to update requirement" });
  }
});



/*---------------------------  ENROLLMENT -----------------------*/

// LOGIN PANEL (UPDATED!)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     let user, token, mappings = [];

//     let [rows] = await db3.query(
//       "SELECT * FROM user_accounts WHERE email = ? AND role = 'superadmin'",
//       [email]
//     );
//     if (rows.length > 0) {
//       user = rows[0];
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (isMatch) {
//         token = webtoken.sign(
//           {
//             id: user.id,
//             person_id: user.person_id,
//             email: user.email,
//             role: user.role
//           },
//           process.env.JWT_SECRET,
//           { expiresIn: "1h" }
//         );
//         return res.status(200).json({
//           message: "Superadmin login successful",
//           token,
//           user: {
//             person_id: user.person_id,
//             email: user.email,
//             role: user.role
//           }
//         });
//       }
//     }

//     const facultySQL = `
//       SELECT prof_table.*, time_table.*
//       FROM prof_table
//       LEFT JOIN time_table ON prof_table.prof_id = time_table.professor_id
//       WHERE prof_table.email = ? AND prof_table.role = 'faculty'
//     `;
//     const [facultyRows] = await db3.query(facultySQL, [email]);

//     if (facultyRows.length > 0) {
//       user = facultyRows[0];
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (isMatch) {
//         token = webtoken.sign(
//           {
//             prof_id: user.prof_id,
//             fname: user.fname,
//             mname: user.mname,
//             lname: user.lname,
//             email: user.email,
//             role: user.role,
//             profile_img: user.profile_image,
//             school_year_id: user.school_year_id
//           },
//           process.env.JWT_SECRET,
//           { expiresIn: "1h" }
//         );

//         mappings = facultyRows.map(row => ({
//           department_section_id: row.department_section_id,
//           subject_id: row.course_id
//         }));

//         return res.status(200).json({
//           message: "Faculty login successful",
//           token,
//           prof_id: user.prof_id,
//           fname: user.fname,
//           mname: user.mname,
//           lname: user.lname,
//           email: user.email,
//           role: user.role,
//           profile_img: user.profile_image,
//           subject_section_mappings: mappings,
//           school_year_id: user.school_year_id
//         });
//       }
//     }

//     [rows] = await db.query(
//       "SELECT * FROM user_accounts WHERE email = ? AND role = 'applicant'",
//       [email]
//     );
//     if (rows.length > 0) {
//       user = rows[0];
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (isMatch) {
//         token = webtoken.sign(
//           {
//             id: user.id,
//             person_id: user.person_id,
//             email: user.email,
//             role: user.role
//           },
//           process.env.JWT_SECRET,
//           { expiresIn: "1h" }
//         );

//         return res.status(200).json({
//           message: "Applicant login successful",
//           token,
//           user: {
//             person_id: user.person_id,
//             email: user.email,
//             role: user.role
//           }
//         });
//       }
//     }

//     // If none matched or password was incorrect
//     return res.status(400).json({ message: "Invalid email or password" });

//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
// ----------------- GLOBAL STORES -----------------
let otpStore = {};
// Structure: { email: { otp, expiresAt, cooldownUntil } }

let loginAttempts = {};
// Structure: { emailOrStudentNumber: { count, lockUntil } }

// ----------------- OTP GENERATOR -----------------
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ----------------- REQUEST OTP -----------------
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const now = Date.now();
  const existing = otpStore[email];

  // Prevent spamming OTP (use shorter cooldown if needed)
  if (existing && existing.cooldownUntil > now) {
    const secondsLeft = Math.ceil((existing.cooldownUntil - now) / 1000);
    return res
      .status(429)
      .json({ message: `OTP already sent. Please wait ${secondsLeft}s.` });
  }

  const otp = generateOTP();

  otpStore[email] = {
    otp,
    expiresAt: now + 5 * 60 * 1000, // OTP valid for 5 minutes
    cooldownUntil: now + 60 * 1000, // Allow resend after 1 minute
  };

  try {
    // ✅ Fetch short_term from settings table (fallback to "School")
    const [settings] = await db
      .promise()
      .query("SELECT short_term FROM settings LIMIT 1");
    const shortTerm = settings?.[0]?.short_term || "School";

    // ✅ Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Send OTP Email
    await transporter.sendMail({
      from: `"${shortTerm} OTP Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${shortTerm} OTP Code`,
      text: `Your ${shortTerm} OTP is: ${otp}. It is valid for 5 minutes.`,
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.json({ message: `${shortTerm} OTP sent to your email` });
  } catch (err) {
    console.error("⚠️ OTP email error:", err);
    delete otpStore[email];
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ----------------- VERIFY OTP -----------------
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  const now = Date.now();

  // Retrieve stored OTP data
  const stored = otpStore[email];
  const record = loginAttempts[email] || { count: 0, lockUntil: null };

  // Check if locked due to failed OTPs
  if (record.lockUntil && record.lockUntil > now) {
    const secondsLeft = Math.ceil((record.lockUntil - now) / 1000);
    return res.status(429).json({
      message: `Too many failed attempts. Try again in ${secondsLeft}s.`,
    });
  }

  // Handle missing or expired OTP
  if (!stored) {
    return res.status(400).json({ message: "No OTP request found for this email" });
  }

  if (stored.expiresAt < now) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  }

  // Handle invalid OTP input
  if (stored.otp !== otp.trim()) {
    record.count++;
    if (record.count >= 3) {
      record.lockUntil = now + 3 * 60 * 1000; // Lock for 3 minutes
      loginAttempts[email] = record;
      return res
        .status(429)
        .json({ message: "Too many failed OTP attempts. Locked for 3 minutes." });
    }
    loginAttempts[email] = record;
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  // ✅ OTP is correct — reset state
  delete otpStore[email];
  delete loginAttempts[email];

  res.json({ message: "OTP verified successfully" });
});

// ----------------- VERIFY PASSWORD -----------------
app.post("/api/verify-password", async (req, res) => {
  const { person_id, password } = req.body;

  if (!person_id || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Person ID and password required" });
  }

  try {
    const [rows] = await db3.query(
      "SELECT * FROM user_accounts WHERE person_id = ?",
      [person_id]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("verify-password error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during password verification" });
  }
});


// ----------------- LOGIN -----------------
app.post("/login", async (req, res) => {
  const { email: loginCredentials, password } = req.body;
  if (!loginCredentials || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const now = Date.now();
  const record = loginAttempts[loginCredentials] || { count: 0, lockUntil: null };

  if (record.lockUntil && record.lockUntil > now) {
    const secondsLeft = Math.ceil((record.lockUntil - now) / 1000);
    return res.status(429).json({ message: `Too many failed attempts. Try again in ${secondsLeft}s.` });
  }

  try {
    const query = `(
      SELECT 
        ua.id AS account_id,
        ua.person_id,
        ua.email,
        ua.password,
        ua.role,
        NULL AS profile_image,
        NULL AS fname,
        NULL AS mname,
        NULL AS lname,
        ua.status AS status,
        'user' AS source,
        ua.dprtmnt_id,
        dt.dprtmnt_name
      FROM user_accounts AS ua
      LEFT JOIN dprtmnt_table AS dt ON ua.dprtmnt_id = dt.dprtmnt_id
      LEFT JOIN student_numbering_table AS snt ON snt.person_id = ua.person_id
      WHERE (ua.email = ? OR snt.student_number = ?)
    )
    UNION ALL
    (
      SELECT 
        ua.prof_id AS account_id,
        ua.person_id,
        ua.email,
        ua.password,
        ua.role,
        ua.profile_image,
        ua.fname,
        ua.mname,
        ua.lname,
        ua.status,
        'prof' AS source,
        NULL AS dprtmnt_id,
        NULL AS dprtmnt_name
      FROM prof_table AS ua
      LEFT JOIN person_prof_table AS pt ON pt.person_id = ua.person_id
      WHERE ua.email = ?
    );`;

    const [results] = await db3.query(query, [loginCredentials, loginCredentials, loginCredentials]);

    if (results.length === 0) {
      record.count++;
      if (record.count >= 3) {
        record.lockUntil = now + 3 * 60 * 1000;
        loginAttempts[loginCredentials] = record;
        return res.status(429).json({ message: "Too many failed attempts. Locked for 3 minutes." });
      }
      loginAttempts[loginCredentials] = record;
      return res.status(400).json({ message: "Invalid email or student number" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      record.count++;
      let remaining = 3 - record.count;

      if (record.count >= 3) {
        record.lockUntil = now + 3 * 60 * 1000;
        loginAttempts[loginCredentials] = record;
        return res.status(429).json({ message: "Too many failed attempts. Locked for 3 minutes." });
      }

      loginAttempts[loginCredentials] = record;
      return res.status(400).json({
        message: `Invalid password. You have ${remaining} attempt(s) remaining.`,
        remaining,
      });
    }

    if ((user.source === "prof" || user.source === "user") && user.status === 0) {
      return res.status(400).json({ message: "The Account is Inactive" });
    }

    // ✅ Generate OTP
    const otp = generateOTP();
    otpStore[user.email] = {
      otp,
      expiresAt: now + 5 * 60 * 1000, // 5 minutes
      cooldownUntil: now + 5 * 60 * 1000,
    };

    try {
      // ✅ Fetch short_term from company_settings
      const [companyResult] = await db.query("SELECT short_term FROM company_settings WHERE id = 1");
      const shortTerm = companyResult?.[0]?.short_term || "School";

      // ✅ Configure mail transport
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      // ✅ Use dynamic short term in subject and body
      await transporter.sendMail({
        from: `"${shortTerm} - OTP Verification" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `${shortTerm} OTP Code`,
        text: `Your ${shortTerm} - OTP is: ${otp} (Valid for 5 minutes)`,
      });

      console.log(`✅ Sent ${shortTerm} OTP to ${user.email}`);
    } catch (err) {
      console.error("⚠️ Failed to send OTP email:", err.message);
    }

    // ✅ Generate JWT
    const token = webtoken.sign(
      { person_id: user.person_id, email: user.email, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "OTP sent to registered email",
      token,
      email: user.email,
      role: user.role,
      person_id: user.person_id,
      department: user.dprtmnt_id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});


// ----------------- LOGIN (Applicant) -----------------
app.post("/login_applicant", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // ✅ Fetch user
    const query = `
      SELECT * FROM user_accounts AS ua
      LEFT JOIN person_table AS pt ON pt.person_id = ua.person_id
      WHERE email = ?
    `;
    const [results] = await db.query(query, [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === 0) {
      return res.status(400).json({ message: "The Account is Inactive" });
    }

    const person_id = user.person_id;

    // ✅ Check if applicant_number already exists
    const [existing] = await db.query(
      "SELECT applicant_number, qr_code FROM applicant_numbering_table WHERE person_id = ?",
      [person_id]
    );

    let applicantNumber, qrFilename;

    if (existing.length === 0) {
      // ✅ No applicant_number yet → create one
      const [activeYear] = await db3.query(`
        SELECT yt.year_description, st.semester_description, st.semester_code
        FROM active_school_year_table AS sy
        JOIN year_table AS yt ON yt.year_id = sy.year_id
        JOIN semester_table AS st ON st.semester_id = sy.semester_id
        WHERE sy.astatus = 1
        LIMIT 1
      `);

      if (activeYear.length === 0) {
        return res.status(500).json({ message: "No active school year found" });
      }

      const year = String(activeYear[0].year_description).split("-")[0];
      const semCode = activeYear[0].semester_code;

      const [countRes] = await db.query("SELECT COUNT(*) AS count FROM applicant_numbering_table");
      const padded = String(countRes[0].count + 1).padStart(5, "0");
      applicantNumber = `${year}${semCode}${padded}`;

      // Insert applicant_number
      await db.query(
        "INSERT INTO applicant_numbering_table (applicant_number, person_id) VALUES (?, ?)",
        [applicantNumber, person_id]
      );

      // Generate QR code
      const qrData = `http://localhost:5173/examination_profile/${applicantNumber}`;
      qrFilename = `${applicantNumber}_qrcode.png`;
      const qrPath = path.join(__dirname, "uploads", qrFilename);

      await QRCode.toFile(qrPath, qrData, {
        color: { dark: "#000", light: "#FFF" },
        width: 300
      });

      // Save QR in DB
      await db.query(
        "UPDATE applicant_numbering_table SET qr_code = ? WHERE applicant_number = ?",
        [qrFilename, applicantNumber]
      );
    } else {
      // ✅ Already has applicant_number + QR
      applicantNumber = existing[0].applicant_number;
      qrFilename = existing[0].qr_code;
    }

    // ✅ Generate JWT token
    const token = webtoken.sign(
      { person_id: user.person_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      email: user.email,
      role: user.role,
      person_id: user.person_id,
      applicant_number: applicantNumber,
      qr_code: qrFilename
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});


// Login for Proffesor
app.post("/login_prof", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const query = `SELECT * FROM prof_table as ua
      LEFT JOIN person_prof_table as pt
      ON pt.person_id = ua.person_id
    WHERE email = ?`;

    const [results] = await db3.query(query, [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = webtoken.sign({ person_id: user.person_id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("Login response:", { token, person_id: user.person_id, email: user.email, role: user.role });

    res.json({
      message: "Login successful",
      token,
      email: user.email,
      role: user.role,
      person_id: user.person_id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

//APPLICANT RESET PASSWORD ADMIN 09/06/2025
// ---------------- Applicant: Get Info ----------------
// ---------------- Applicant: Get Info ----------------
app.post("/superadmin-get-applicant", async (req, res) => {
  const { email } = req.body; // "email" field is used for search input
  try {
    const search = `%${email}%`;

    const [rows] = await db.query(
      `SELECT 
          ant.applicant_number,
          ua.email,
          ua.status,
          pt.first_name,
          pt.middle_name,
          pt.last_name,
          pt.birthOfDate
       FROM user_accounts ua
       JOIN person_table pt ON ua.person_id = pt.person_id
       LEFT JOIN applicant_numbering_table ant ON ant.person_id = pt.person_id
       WHERE ua.role = 'applicant'
         AND (
              pt.first_name LIKE ? OR
              pt.middle_name LIKE ? OR
              pt.last_name LIKE ? OR
              ua.email LIKE ? OR
              ant.applicant_number LIKE ?
         )
       LIMIT 1`,
      [search, search, search, search, search]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Applicant not found" });

    const user = rows[0];
    res.json({
      applicant_number: user.applicant_number,
      email: user.email,
      fullName: `${user.last_name}, ${user.first_name} ${user.middle_name || ""}`.trim(),
      birthdate: user.birthOfDate,
      status: user.status,
    });
  } catch (err) {
    console.error("Get applicant error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ SUPER ADMIN - RESET APPLICANT PASSWORD
app.post("/superadmin-reset-applicant", async (req, res) => {
  const { email } = req.body;

  try {
    // 🔍 Check if applicant exists
    const [rows] = await db.query(
      `SELECT user_id FROM user_accounts WHERE email = ? AND role = 'applicant'`,
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // 🔹 Generate random 8-character uppercase password (A–Z)
    const newPassword = Array.from({ length: 8 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join("");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update applicant password in DB
    await db.query(
      `UPDATE user_accounts SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // 🔹 Fetch short term from company settings
    const [settings] = await db.query("SELECT short_term FROM company_settings WHERE id = 1");
    const shortTerm = settings.length > 0 && settings[0].short_term ? settings[0].short_term : "Institution";

    // 🔹 Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Send email with institution short term
    await transporter.sendMail({
      from: `"${shortTerm} - Information System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password has been Reset",
      text: `Your new temporary password is: ${newPassword}\n\nPlease change it after logging in.`,
    });

    res.json({
      message: `Password reset successfully. Check your email for the new password.`,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ---------------- Applicant: Update Status ---------------- //
app.post("/superadmin-update-status-applicant", async (req, res) => {
  const { email, status } = req.body;
  try {
    await db.query(
      `UPDATE user_accounts SET status = ? WHERE email = ? AND role = 'applicant'`,
      [status, email]
    );
    res.json({ message: "Applicant status updated successfully" });
  } catch (err) {
    console.error("Update applicant status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//STUDENT RESET PASSWORD ADMIN 09/06/2025
// ---------------- Student: Get Info ----------------
app.post("/superadmin-get-student", async (req, res) => {
  const { search } = req.body;

  try {
    const [rows] = await db3.query(
      `SELECT ua.status, ua.email,
              pt.student_number, pt.first_name, pt.middle_name, pt.last_name, pt.birthOfDate
       FROM user_accounts ua
       JOIN person_table pt ON ua.person_id = pt.person_id
       WHERE ua.role = 'student'
         AND (
              pt.student_number = ? 
              OR ua.email LIKE ? 
              OR pt.first_name LIKE ? 
              OR pt.last_name LIKE ? 
              OR CONCAT(pt.first_name, ' ', pt.last_name) LIKE ?
         )
       LIMIT 1`,
      [search, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const user = rows[0];
    res.json({
      student_number: user.student_number,
      email: user.email,
      fullName: `${user.first_name} ${user.middle_name || ""} ${user.last_name}`.trim(),
      birthdate: user.birthOfDate,
      status: user.status ?? 0,
    });
  } catch (err) {
    console.error("Get student error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------- Student: Update Status ----------------
app.post("/superadmin-update-status-student", async (req, res) => {
  const { email, status } = req.body;
  try {
    const [result] = await db3.query(
      `UPDATE user_accounts SET status = ? WHERE email = ? AND role = 'student'`,
      [status, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student status updated successfully", status });
  } catch (err) {
    console.error("Update student status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//REGISTRAR RESET PASSWORD ADMIN 09/06/2025
// ---------------- Registrar: Get Info ----------------
// ---------------- Registrar: Get Info ----------------
app.post("/superadmin-get-registrar", async (req, res) => {
  const { search } = req.body; // renamed from email → more general
  if (!search) {
    return res.status(400).json({ message: "Search input is required" });
  }

  try {
    const query = `
      SELECT employee_id, email, status, first_name, middle_name, last_name
      FROM user_accounts
      WHERE role = 'registrar'
      AND (
        employee_id LIKE ? OR
        email LIKE ? OR
        CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ? OR
        CONCAT(first_name, ' ', last_name) LIKE ?
      )
      ORDER BY id DESC
      LIMIT 1
    `;

    const likeSearch = `%${search}%`;
    const [rows] = await db3.query(query, [
      likeSearch,
      likeSearch,
      likeSearch,
      likeSearch,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Registrar not found" });
    }

    const user = rows[0];
    const fullName = [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(" ");

    res.json({
      employee_id: user.employee_id || "N/A",
      email: user.email,
      fullName,
      status: user.status,
    });
  } catch (err) {
    console.error("Error fetching registrar info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------- Registrar: Reset Password ----------------
app.post("/forgot-password-registrar", async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Check if registrar exists
    const [rows] = await db3.query(
      "SELECT email FROM user_accounts WHERE email = ? AND role = 'registrar'",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Registrar not found." });
    }

    // 🔹 Fetch short term from company settings
    const [settings] = await db.query("SELECT short_term FROM company_settings WHERE id = 1");
    const shortTerm =
      settings.length > 0 && settings[0].short_term ? settings[0].short_term : "Institution";

    // 🔹 Generate random 8-character uppercase password (A–Z)
    const newPassword = Array.from({ length: 8 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join("");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update password in user_accounts
    await db3.query("UPDATE user_accounts SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // 🔹 Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Send standardized email
    await transporter.sendMail({
      from: `"${shortTerm} - Information System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password has Reset",
      text: `Your new temporary password is: ${newPassword}\n\nPlease change it after logging in.`,
    });

    res.json({
      message: "Password reset successfully. Check your email for the new password.",
    });
  } catch (error) {
    console.error("Reset error (registrar):", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// ---------------- Registrar: Update Status ----------------
app.post("/superadmin-update-status-registrar", async (req, res) => {
  const { email, status } = req.body;
  try {
    const [result] = await db3.query(
      "UPDATE user_accounts SET status = ? WHERE email = ? AND role = 'registrar'",
      [status, email]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Registrar not found" });

    res.json({ message: "Registrar status updated successfully", status });
  } catch (err) {
    console.error("Update registrar status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//FACULTY RESET PASSWORD ADMIN 09/06/2025
// ---------------- Faculty: Get Info (Search by Employee ID, Name, or Email) ----------------
app.post("/superadmin-get-faculty", async (req, res) => {
  const { search } = req.body;

  try {
    const [rows] = await db3.query(
      `
      SELECT 
        prof_id,
        person_id AS employee_id,
        fname AS first_name,
        mname AS middle_name,
        lname AS last_name,
        email,
        status
      FROM prof_table
      WHERE role = 'faculty'
      AND (
        person_id LIKE ? 
        OR fname LIKE ? 
        OR mname LIKE ? 
        OR lname LIKE ? 
        OR email LIKE ?
      )
      LIMIT 1
      `,
      Array(5).fill(`%${search}%`)
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const user = rows[0];
    const fullName = [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(" ");

    res.json({
      employee_id: user.employee_id,
      email: user.email,
      fullName,
      status: user.status ?? 0,
    });
  } catch (err) {
    console.error("Error fetching faculty info:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------- Faculty: Reset Password ----------------
// 11/05/2025 UPDATE - RESET FACULTY PASSWORD
app.post("/superadmin-reset-faculty", async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Check if faculty exists
    const [rows] = await db3.query(
      `SELECT email FROM prof_table WHERE email = ? AND role = 'faculty'`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    // 🔹 Fetch short term from company settings
    const [settings] = await db.query("SELECT short_term FROM company_settings WHERE id = 1");
    const shortTerm =
      settings.length > 0 && settings[0].short_term ? settings[0].short_term : "Institution";

    // 🔹 Generate random 8-character uppercase password (A–Z)
    const newPassword = Array.from({ length: 8 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join("");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update faculty password in DB
    await db3.query(
      "UPDATE prof_table SET password = ? WHERE email = ? AND role = 'faculty'",
      [hashedPassword, email]
    );

    // 🔹 Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Send email with institutional short term
    await transporter.sendMail({
      from: `"${shortTerm} - Information System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password hasReset",
      text: `Your new temporary password is: ${newPassword}\n\nPlease change it after logging in.`,
    });

    res.json({
      success: true,
      message: "Password reset successfully. Check your email for the new password.",
    });
  } catch (error) {
    console.error("Reset error (faculty):", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ---------------- Faculty: Update Status ----------------
app.post("/superadmin-update-status-faculty", async (req, res) => {
  const { email, status } = req.body;
  try {
    const [result] = await db3.query(
      `UPDATE prof_table SET status = ? WHERE email = ? AND role = 'faculty'`,
      [status, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({ message: "Faculty status updated successfully", status });
  } catch (err) {
    console.error("Update faculty status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Applicant Change Password 
app.post("/applicant-change-password", async (req, res) => {
  const { person_id, currentPassword, newPassword } = req.body;

  if (!person_id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get user by person_id
    const [rows] = await db.query("SELECT * FROM user_accounts WHERE person_id = ?", [person_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Password strength validation
    const strong =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[!#$^*@]/.test(newPassword);

    if (!strong) {
      return res.status(400).json({ message: "New password does not meet complexity requirements" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Debug log (optional)
    console.log("Updating password for person_id:", person_id);
    console.log("New password hash:", hashed);

    // Update password in DB
    await db.query("UPDATE user_accounts SET password = ? WHERE person_id = ?", [hashed, person_id]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Registrar Change Password 
app.post("/registrar-change-password", async (req, res) => {
  const { person_id, currentPassword, newPassword } = req.body;

  if (!person_id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get user by person_id
    const [rows] = await db3.query("SELECT * FROM user_accounts WHERE person_id = ?", [person_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Password strength validation
    const strong =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[!#$^*@]/.test(newPassword);

    if (!strong) {
      return res.status(400).json({ message: "New password does not meet complexity requirements" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Debug log (optional)
    console.log("Updating password for person_id:", person_id);
    console.log("New password hash:", hashed);

    // Update password in DB
    await db3.query("UPDATE user_accounts SET password = ? WHERE person_id = ?", [hashed, person_id]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Student Change Password 
app.post("/student-change-password", async (req, res) => {
  const { person_id, currentPassword, newPassword } = req.body;

  if (!person_id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get user by person_id
    const [rows] = await db3.query("SELECT * FROM user_accounts WHERE person_id = ?", [person_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Password strength validation
    const strong =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[!#$^*@]/.test(newPassword);

    if (!strong) {
      return res.status(400).json({ message: "New password does not meet complexity requirements" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Debug log (optional)
    console.log("Updating password for person_id:", person_id);
    console.log("New password hash:", hashed);

    // Update password in DB
    await db3.query("UPDATE user_accounts SET password = ? WHERE person_id = ?", [hashed, person_id]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Faculty Change Password 
app.post("/faculty-change-password", async (req, res) => {
  const { person_id, currentPassword, newPassword } = req.body;

  if (!person_id || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get user by person_id
    const [rows] = await db3.query("SELECT * FROM prof_table WHERE person_id = ?", [person_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Password strength validation
    const strong =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[!#$^*@]/.test(newPassword);

    if (!strong) {
      return res.status(400).json({ message: "New password does not meet complexity requirements" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Debug log (optional)
    console.log("Updating password for person_id:", person_id);
    console.log("New password hash:", hashed);

    // Update password in DB
    await db3.query("UPDATE prof_table SET password = ? WHERE person_id = ?", [hashed, person_id]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



io.on("connection", (socket) => {
  console.log("✅ Socket.IO client connected");

  // ---------------------- Forgot Password: Applicant ----------------------
  socket.on("forgot-password-applicant", async (email) => {
    try {
      // ✅ 1️⃣ Check if applicant exists
      const [rows] = await db.query(
        `SELECT ua.email, p.campus
         FROM user_accounts ua
         JOIN person_table p ON ua.person_id = p.person_id
         WHERE ua.email = ?`,
        [email]
      );

      if (rows.length === 0) {
        return socket.emit("password-reset-result-applicant", {
          success: false,
          message: "Email not found.",
        });
      }

      // ✅ 2️⃣ Fetch short_term from company_settings table
      const [[company]] = await db.query(
        "SELECT short_term FROM company_settings WHERE id = 1"
      );
      const shortTerm = company?.short_term || "Institution";

      // ✅ 3️⃣ Generate new password
      const newPassword = Array.from({ length: 8 }, () =>
        String.fromCharCode(Math.floor(Math.random() * 26) + 65)
      ).join("");

      const hashed = await bcrypt.hash(newPassword, 10);

      await db.query("UPDATE user_accounts SET password = ? WHERE email = ?", [
        hashed,
        email,
      ]);

      // ✅ 4️⃣ Configure email sender
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // ✅ 5️⃣ Send email with institutional short term (same as student/faculty)
      await transporter.sendMail({
        from: `"${shortTerm} - Information System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Password hasReset",
        text: `Your new temporary password is: ${newPassword}\n\nPlease change it after logging in.`,
      });

      // ✅ 6️⃣ Notify frontend that email was sent successfully
      socket.emit("password-reset-result-applicant", {
        success: true,
        message: "Password reset successfully. Check your email for the new password.",
      });
    } catch (error) {
      console.error("Reset error (applicant):", error);
      socket.emit("password-reset-result-applicant", {
        success: false,
        message: "Internal server error.",
      });
    }
  });

  // ---------------- Registrar: Reset Password ----------------
  // FORGOT PASSWORD (handles student, registrar, faculty)
  app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate uppercase temporary password (A–Z + 0–9)
    const generateTempPassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length: 8 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    };

    const newPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      // Fetch short_term from company_settings
      const [company] = await db.query("SELECT short_term FROM company_settings WHERE id = 1");
      const shortTerm = company?.[0]?.short_term || "Institution";

      // 1️⃣ Update Student or Registrar password
      const [userResult] = await db3.query(
        "UPDATE user_accounts SET password = ? WHERE email = ? AND (role = 'student' OR role = 'registrar')",
        [hashedPassword, email]
      );

      if (userResult.affectedRows > 0) {
        await sendResetEmail(email, newPassword, shortTerm);
        return res.json({
          message: `${shortTerm} password reset successfully. Please check your email.`,
        });
      }

      // 2️⃣ Update Faculty password
      const [profResult] = await db3.query(
        "UPDATE prof_table SET password = ? WHERE email = ? AND role = 'faculty'",
        [hashedPassword, email]
      );

      if (profResult.affectedRows > 0) {
        await sendResetEmail(email, newPassword, shortTerm);
        return res.json({
          message: `${shortTerm} password reset successfully. Please check your email.`,
        });
      }

      // 3️⃣ Not found
      return res
        .status(404)
        .json({ message: `${shortTerm} account not found. Please check your email address.` });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ---------------- Email Sender (same message format as student/faculty/applicant) ----------------
  async function sendResetEmail(to, tempPassword, shortTerm) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${shortTerm} - Information System" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your Password has Reset",
        text: `Your new temporary password is: ${tempPassword}\n\nPlease change it after logging in.`,
      });

      console.log(`${shortTerm} reset email sent to ${to}`);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }
  }


  // 🔹 Get exam scores for a person
  app.get("/api/exam/:personId", async (req, res) => {
    try {
      const { personId } = req.params;

      const [rows] = await db.query(
        `SELECT 
         id,
         person_id,
         English,
         Science,
         Filipino,
         Math,
         Abstract,
         final_rating,
         user,
         DATE_FORMAT(date_created, '%Y-%m-%d') AS date_created
       FROM admission_exam 
       WHERE person_id = ?`,
        [personId]
      );

      res.json(rows);
    } catch (err) {
      console.error("❌ GET exam error:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get applicant exam schedule
  app.get("/api/exam-schedule/:applicant_number", async (req, res) => {
    const { applicant_number } = req.params;

    try {
      const [rows] = await db.query(`
      SELECT 
        s.day_description AS date_of_exam,
        s.start_time,
        s.end_time,
        s.building_description,
        s.room_description,
        s.proctor,
        s.created_at AS schedule_created_at
      FROM exam_applicants ea
      JOIN entrance_exam_schedule s 
        ON ea.schedule_id = s.schedule_id
      WHERE ea.applicant_id = ?
      LIMIT 1
    `, [applicant_number]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "No exam schedule found" });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("Error fetching exam schedule:", err);
      res.status(500).json({ error: "Database error" });
    }
  });


  // Get person by applicant_number
  app.get("/api/person-by-applicant/:applicant_number", async (req, res) => {
    const { applicant_number } = req.params;

    try {
      const [rows] = await db.execute(
        `SELECT p.*, a.applicant_number, ae.final_rating
       FROM person_table p
       JOIN applicant_numbering_table a 
         ON p.person_id = a.person_id
       JOIN admission_exam ae ON p.person_id = ae.person_id
       WHERE a.applicant_number = ? `,
        [applicant_number]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("Error fetching person by applicant_number:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/applicant-schedule/:applicant_number", async (req, res) => {
    try {
      const { applicant_number } = req.params;

      const [rows] = await db.query(
        `SELECT 
          s.schedule_id,
          s.day_description,
          s.building_description,
          s.room_description,
          s.start_time,
          s.end_time,
          s.proctor,
          s.room_quota,
          s.created_at,
          ea.email_sent   -- ✅ include email_sent
       FROM entrance_exam_schedule s
       INNER JOIN exam_applicants ea
         ON ea.schedule_id = s.schedule_id
       WHERE ea.applicant_id = ?`,
        [applicant_number]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: "No schedule found for this applicant." });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("Error fetching applicant schedule:", err.message);
      res.status(500).json({ error: "Failed to fetch applicant schedule" });
    }
  });


  // Get applicants assigned to a proctor
  app.get("/api/proctor-applicants/:proctor_name", async (req, res) => {
    const { proctor_name } = req.params;
    try {
      const [rows] = await db.query(`
      SELECT 
        ea.applicant_id,
        an.applicant_number,
        pt.first_name,
        pt.middle_name,
        pt.last_name,
        pt.program,
        ees.day_description,
        ees.room_description,
        ees.building_description,
        ees.start_time,
        ees.end_time,
        ees.proctor
      FROM exam_applicants ea
      JOIN applicant_numbering_table an ON ea.applicant_id = an.applicant_number
      JOIN person_table pt ON an.person_id = pt.person_id
      JOIN entrance_exam_schedule ees ON ea.schedule_id = ees.schedule_id
      WHERE ees.proctor = ?
    `, [proctor_name]);
      res.json(rows);
    } catch (err) {
      console.error("❌ Error fetching proctor applicants:", err);
      res.status(500).json({ error: "Failed to fetch applicants for proctor" });
    }
  });


  // Search proctor by name and return their assigned applicants
  app.get("/api/proctor-applicants", async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    try {
      // Find schedules where this proctor is assigned
      const [schedules] = await db.query(
        `SELECT schedule_id, day_description, room_description, building_description, start_time, end_time, proctor
FROM entrance_exam_schedule
WHERE proctor LIKE ?
`,
        [`%${query}%`]
      );

      if (schedules.length === 0) {
        return res.status(404).json({ message: "Proctor not found in schedules" });
      }

      // For each schedule, get assigned applicants with email_sent
      const results = [];
      for (const sched of schedules) {
        const [applicants] = await db.query(
          `SELECT ea.applicant_id, ea.email_sent,
                an.applicant_number,
                p.last_name, p.first_name, p.middle_name, p.program
         FROM exam_applicants ea
         JOIN applicant_numbering_table an ON ea.applicant_id = an.applicant_number
         JOIN person_table p ON an.person_id = p.person_id
         WHERE ea.schedule_id = ?`,
          [sched.schedule_id]
        );

        results.push({
          schedule: sched,
          applicants
        });
      }

      res.json(results);
    } catch (err) {
      console.error("❌ Error fetching proctor applicants:", err);
      res.status(500).json({ error: "Failed to fetch applicants for proctor" });
    }
  });


  // Search proctor by name or email
  app.get("/api/search-proctor", async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    try {
      const [rows] = await db.query(`
      SELECT id, person_id, email, first_name, middle_name, last_name, role
      FROM user_accounts
      WHERE role = 'proctor'
        AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
      LIMIT 1
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Proctor not found" });
      }

      res.json({
        id: rows[0].id,
        email: rows[0].email,
        name: `${rows[0].last_name}, ${rows[0].first_name} ${rows[0].middle_name || ""}`
      });
    } catch (err) {
      console.error("❌ Error searching proctor:", err);
      res.status(500).json({ error: "Failed to search proctor" });
    }
  });

  // ✅ Unified Save or Update for Qualifying / Interview Scores (with duplicate-safe notifications)
  app.post("/api/interview/save", async (req, res) => {
    try {
      const { applicant_number, qualifying_exam_score, qualifying_interview_score, user_person_id } = req.body;

      // Find person_id
      const [rows] = await db.query(
        "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
        [applicant_number]
      );
      if (rows.length === 0) return res.status(400).json({ error: "Applicant number not found" });
      const personId = rows[0].person_id;

      // Fetch old results
      const [oldRows] = await db.query(
        "SELECT qualifying_result, interview_result, exam_result FROM person_status_table WHERE person_id = ?",
        [personId]
      );
      const oldData = oldRows[0] || null;

      // Compute new scores
      const qExam = Number(qualifying_exam_score) || 0;
      const qInterview = Number(qualifying_interview_score) || 0;
      const totalAve = (qExam + qInterview) / 2;

      // Upsert
      await db.query(
        `INSERT INTO person_status_table (person_id, qualifying_result, interview_result, exam_result)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         qualifying_result = VALUES(qualifying_result),
         interview_result = VALUES(interview_result),
         exam_result = VALUES(exam_result)`,
        [personId, qExam, qInterview, totalAve]
      );

      // Get actor info
      let actorEmail = "earistmis@gmail.com";
      let actorName = "SYSTEM";
      if (user_person_id) {
        const [actorRows] = await db3.query(
          `SELECT email, role, employee_id, last_name, first_name, middle_name
         FROM user_accounts WHERE person_id = ? LIMIT 1`,
          [user_person_id]
        );
        if (actorRows.length > 0) {
          const u = actorRows[0];
          const role = u.role?.toUpperCase() || "UNKNOWN";
          const empId = u.employee_id || "";
          actorEmail = u.email || "earistmis@gmail.com";
          actorName = `${role} (${empId}) - ${u.last_name}, ${u.first_name} ${u.middle_name}`.trim();
        }
      }

      // Detect changes
      if (oldData && (oldData.qualifying_result != qExam || oldData.interview_result != qInterview)) {
        const oldExam = oldData.qualifying_result ?? 0;
        const oldInterview = oldData.interview_result ?? 0;
        const oldFinal = oldData.exam_result ?? ((oldExam + oldInterview) / 2).toFixed(2);
        const newFinal = totalAve.toFixed(2);

        // Build message text showing both scores
        const message = `📝 Qualifying Exam: ${oldExam} → ${qExam} | Interview: ${oldInterview} → ${qInterview} | Final Rating: ${oldFinal} → ${newFinal} for Applicant #${applicant_number}`;

        // One single notification per applicant per day
        await db.query(
          `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
         SELECT ?, ?, ?, ?, ?, NOW()
         FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM notifications
           WHERE applicant_number = ?
             AND message = ?
             AND DATE(timestamp) = CURDATE()
         )`,
          ["update", message, applicant_number, actorEmail, actorName, applicant_number, message]
        );

        io.emit("notification", {
          type: "update",
          message,
          applicant_number,
          actor_email: actorEmail,
          actor_name: actorName,
          timestamp: new Date().toISOString(),
        });
      }

      res.json({ success: true, message: "Qualifying/Interview results saved successfully!" });
    } catch (err) {
      console.error("Error saving qualifying/interview results:", err);
      res.status(500).json({ error: "Failed to save qualifying/interview results" });
    }
  });




  app.post("/exam/save", async (req, res) => {
    try {
      const { applicant_number, english, science, filipino, math, abstract, final_rating, user_person_id } = req.body;

      // 1️⃣ Find person_id of applicant
      const [rows] = await db.query(
        "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
        [applicant_number]
      );
      if (rows.length === 0) {
        return res.status(400).json({ error: "Applicant number not found" });
      }
      const personId = rows[0].person_id;

      // 2️⃣ Fetch old exam data
      const [oldRows] = await db.query(
        "SELECT English, Science, Filipino, Math, Abstract FROM admission_exam WHERE person_id = ?",
        [personId]
      );
      const oldData = oldRows[0] || null;

      // 3️⃣ Insert or update scores
      await db.query(
        `INSERT INTO admission_exam 
        (person_id, English, Science, Filipino, Math, Abstract, final_rating, user, date_created)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         English = VALUES(English),
         Science = VALUES(Science),
         Filipino = VALUES(Filipino),
         Math = VALUES(Math),
         Abstract = VALUES(Abstract),
         final_rating = VALUES(final_rating),
         user = VALUES(user),
         date_created = VALUES(date_created)`,
        [personId, english, science, filipino, math, abstract, final_rating, user_person_id]
      );

      // 4️⃣ Get actor info using person_id from user_accounts
      let actorEmail = "earistmis@gmail.com";
      let actorName = "SYSTEM";

      if (user_person_id) {
        const [actorRows] = await db3.query(
          `SELECT email, role, employee_id, last_name, first_name, middle_name 
         FROM user_accounts 
         WHERE person_id = ? LIMIT 1`,
          [user_person_id]
        );

        if (actorRows.length > 0) {
          const u = actorRows[0];
          const role = u.role?.toUpperCase() || "UNKNOWN";
          const empId = u.employee_id || "";
          const lname = u.last_name || "";
          const fname = u.first_name || "";
          const mname = u.middle_name || "";
          const email = u.email || "";

          actorEmail = email;
          actorName = `${role} (${empId}) - ${lname}, ${fname} ${mname}`.trim();
        }
      }

      // 5️⃣ Check changes if updating existing record
      if (oldData) {
        const subjects = [
          { key: "English", label: "English", newVal: english },
          { key: "Science", label: "Science", newVal: science },
          { key: "Filipino", label: "Filipino", newVal: filipino },
          { key: "Math", label: "Math", newVal: math },
          { key: "Abstract", label: "Abstract", newVal: abstract },
        ];

        for (const subj of subjects) {
          const oldVal = oldData[subj.key];
          if (oldVal != subj.newVal) {
            const message = `📝 Entrance Exam updated (${subj.label}: ${oldVal ?? 0} → ${subj.newVal}) for Applicant #${applicant_number}`;

            await db.query(
              `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
             SELECT ?, ?, ?, ?, ?, NOW()
             FROM DUAL
             WHERE NOT EXISTS (
               SELECT 1 FROM notifications
               WHERE applicant_number = ?
                 AND message = ?
                 AND DATE(timestamp) = CURDATE()
             )`,
              ["update", message, applicant_number, actorEmail, actorName, applicant_number, message]
            );

            io.emit("notification", {
              type: "update",
              message,
              applicant_number,
              actor_email: actorEmail,
              actor_name: actorName,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      res.json({ success: true, message: "Exam data saved!" });
    } catch (err) {
      console.error("❌ Save error:", err);
      res.status(500).json({ error: "Failed to save exam data" });
    }
  });


  // ======================= EMAIL NOTIFICATION LOGGER =======================
  app.post("/api/log-email", async (req, res) => {
    try {
      const { applicant_number, user_person_id, subject, customMessage } = req.body;

      if (!applicant_number) {
        return res.status(400).json({ error: "Applicant number is required" });
      }

      // 1️⃣ Get applicant’s person_id
      const personId = await getPersonIdByApplicantNumber(applicant_number);
      if (!personId) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      // 2️⃣ Get actor info (email + role) from user_accounts in db3
      let actorEmail = "earistmis@gmail.com";
      let actorFullName = "System";

      if (user_person_id) {
        const [actorRows] = await db3.query(
          "SELECT email, role FROM user_accounts WHERE person_id = ? LIMIT 1",
          [user_person_id]
        );

        if (actorRows.length > 0) {
          const actor = actorRows[0];
          actorEmail = actor.email;
          actorFullName = actor.role ? actor.role.toUpperCase() : actor.email;
        }
      }

      // 3️⃣ Build message
      const message =
        customMessage ||
        `📧 ${subject || "Email"} sent for Applicant #${applicant_number}`;

      // 4️⃣ Insert into notifications
      await db.query(
        `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())`,
        ["email", message, applicant_number, actorEmail, actorFullName]
      );

      // 5️⃣ Emit via socket
      io.emit("notification", {
        type: "email",
        message,
        applicant_number,
        actor_email: actorEmail,
        actor_name: actorFullName,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, message: "Email notification logged" });
    } catch (err) {
      console.error("❌ Email log error:", err);
      res.status(500).json({ error: "Failed to log email notification" });
    }
  });



  // 🔹 Bulk Excel Import Exam Scores
  // 🔹 Bulk Excel Import Exam Scores
  app.post("/api/exam/import", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const loggedInUserId = 1; // 🔑 Should come from session or token (frontend/localStorage)

      // 1️⃣ Collect applicant numbers
      const applicantNumbers = rows
        .map(r => r["Applicant ID"] || r["applicant_number"])
        .filter(n => n);

      if (applicantNumbers.length === 0) {
        return res.status(400).json({ error: "No valid applicant numbers" });
      }

      // 2️⃣ Get person_id mappings
      const [matches] = await db.query(
        `SELECT person_id, applicant_number 
       FROM applicant_numbering_table 
       WHERE applicant_number IN (?)`,
        [applicantNumbers]
      );

      const applicantMap = {};
      matches.forEach(m => {
        applicantMap[m.applicant_number] = m.person_id;
      });

      // 3️⃣ Prepare bulk insert values
      const values = [];
      const now = new Date();

      for (const row of rows) {
        const applicantNumber = row["Applicant ID"] || row["applicant_number"];
        const personId = applicantMap[applicantNumber];
        if (!personId) continue;

        const english = Number(row["English"] || 0);
        const science = Number(row["Science"] || 0);
        const filipino = Number(row["Filipino"] || 0);
        const math = Number(row["Math"] || 0);
        const abstract = Number(row["Abstract"] || 0);

        const finalRating = (english + science + filipino + math + abstract) / 5;

        values.push([
          personId,
          english,
          science,
          filipino,
          math,
          abstract,
          finalRating,
          loggedInUserId,
          now,
        ]);
      }

      if (values.length === 0) {
        return res.status(400).json({ error: "No valid data to import" });
      }

      // 4️⃣ Bulk insert or update
      await db.query(
        `INSERT INTO admission_exam 
      (person_id, English, Science, Filipino, Math, Abstract, final_rating, user, date_created)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        English = VALUES(English),
        Science = VALUES(Science),
        Filipino = VALUES(Filipino),
        Math = VALUES(Math),
        Abstract = VALUES(Abstract),
        final_rating = VALUES(final_rating),
        user = VALUES(user),
        date_created = VALUES(date_created)`,
        [values]
      );

      // 5️⃣ Get uploader (actor) info from user_accounts
      let actorEmail = "earistmis@gmail.com";
      let actorName = "SYSTEM";

      if (loggedInUserId) {
        const [actorRows] = await db3.query(
          "SELECT email, role, employee_id, last_name, first_name, middle_name FROM user_accounts WHERE person_id = ? LIMIT 1",
          [loggedInUserId]
        );

        if (actorRows.length > 0) {
          const u = actorRows[0];
          const role = u.role?.toUpperCase() || "UNKNOWN";
          const empId = u.employee_id || "";
          const lname = u.last_name || "";
          const fname = u.first_name || "";
          const mname = u.middle_name || "";
          const email = u.email || "";

          actorEmail = email;
          actorName = `${role} (${empId}) - ${lname}, ${fname} ${mname}`.trim();
        }
      }

      // 6️⃣ Save notification
      const message = `📊 Bulk Entrance Exam Scores uploaded`;

      await db.query(
        "INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name) VALUES (?, ?, ?, ?, ?)",
        ["upload", message, null, actorEmail, actorName]
      );

      // 7️⃣ Emit socket event
      io.emit("notification", {
        type: "upload",
        message,
        applicant_number: null,
        actor_email: actorEmail,
        actor_name: actorName,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, message: "Excel imported successfully!" });
    } catch (err) {
      console.error("❌ Excel import error:", err);
      res.status(500).json({ error: "Failed to import Excel" });
    }
  });



  // 🔹 Get Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, type, message, applicant_number, actor_email, actor_name, timestamp FROM notifications ORDER BY timestamp DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error("❌ Fetch notifications error:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });





  // ==================== INTERVIEW ROUTES ====================
  // ==============================
  // INTERVIEW ROUTES
  // ==============================



  // 1. Get interview by applicant_number
  app.get("/api/interview/:applicant_number", async (req, res) => {
    const { applicant_number } = req.params;

    try {
      const [rows] = await db.query(
        `
      SELECT 
        a.applicant_number,
        a.person_id,
        ps.qualifying_result      AS qualifying_exam_score,
        ps.interview_result       AS qualifying_interview_score,
        ps.exam_result            AS total_ave
      FROM applicant_numbering_table a
      LEFT JOIN person_status_table ps ON ps.person_id = a.person_id
      WHERE a.applicant_number = ?
      `,
        [applicant_number]
      );

      if (!rows.length) return res.json(null);

      const row = rows[0];
      res.json({
        applicant_number: row.applicant_number,
        person_id: row.person_id,
        qualifying_exam_score: row.qualifying_exam_score ?? 0,
        qualifying_interview_score: row.qualifying_interview_score ?? 0,
        total_ave: row.total_ave ?? 0,
      });
    } catch (err) {
      console.error("❌ Error fetching interview:", err);
      res.status(500).json({ message: "Server error" });
    }
  });


  // 2) PUT update (must exist)
  // 📌 Update single Qualifying/Interview scores + log notifications


  // ---------------------------------------------------------
  // 2) SAVE or UPDATE (UPSERT) using person_status_table
  //    Payload: { applicant_number, qualifying_exam_score, qualifying_interview_score }
  //    Mapping -> qualifying_result, interview_result, exam_result
  // ---------------------------------------------------------
  app.post("/api/interview", async (req, res) => {
    try {
      const { applicant_number, qualifying_exam_score, qualifying_interview_score } = req.body;
      console.log("📥 Payload:", req.body);

      // 1️⃣ Find person_id of applicant
      const [rows] = await db.query(
        "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
        [applicant_number]
      );
      if (rows.length === 0) {
        return res.status(400).json({ error: "Applicant number not found" });
      }
      const person_id = rows[0].person_id;

      // 2️⃣ Compute new scores
      const qExam = Number(qualifying_exam_score) || 0;
      const qInterview = Number(qualifying_interview_score) || 0;
      const totalAve = (qExam + qInterview) / 2;

      // 3️⃣ Insert or update (Upsert)
      await db.query(
        `INSERT INTO person_status_table (person_id, qualifying_result, interview_result, exam_result)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         qualifying_result = VALUES(qualifying_result),
         interview_result = VALUES(interview_result),
         exam_result = VALUES(exam_result)`,
        [person_id, qExam, qInterview, totalAve]
      );

      // 4️⃣ Return success (no notification here)
      res.json({ success: true, message: "Interview and exam scores saved successfully!" });
    } catch (err) {
      console.error("🔥 Error saving interview/exam scores:", err);
      res.status(500).json({ error: "Failed to save interview/exam scores" });
    }
  });


  // ---------------------------------------------------------
  // 3) Update by applicant_number (same mapping)
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // Save or Update Interview Scores
  // ---------------------------------------------------------
  async function insertNotificationOnce({ type = "update", message, applicant_number, actorEmail, actorName }) {
    // Prevent duplicates in two ways:
    // 1) If exact same message exists within last 5 seconds -> skip (protects against double-requests)
    // 2) Also skip if same message already exists today -> skip (daily dedupe)
    await db.query(
      `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
     SELECT ?, ?, ?, ?, ?, NOW()
     FROM DUAL
     WHERE NOT EXISTS (
       SELECT 1 FROM notifications
       WHERE applicant_number = ?
         AND message = ?
         AND (timestamp >= NOW() - INTERVAL 5 SECOND OR DATE(timestamp) = CURDATE())
     )`,
      [type, message, applicant_number, actorEmail, actorName, applicant_number, message]
    );
  }

  // ---------------------- Assign Student Number ----------------------
  socket.on("assign-student-number", async (person_id) => {
    try {
      // ✅ Fetch person info
      const [rows] = await db.query(
        `SELECT * FROM person_table AS pt WHERE person_id = ?`,
        [person_id]
      );

      if (rows.length === 0) {
        return socket.emit("assign-student-number-result", {
          success: false,
          message: "Person not found.",
        });
      }

      const { first_name, middle_name, last_name, emailAddress } = rows[0];
      const student_number = `${new Date().getFullYear()}${String(person_id).padStart(5, "0")}`;
      const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // ✅ Get uploaded requirements
      const [requirements] = await db.query(
        `SELECT * FROM requirement_uploads WHERE person_id = ?`,
        [person_id]
      );

      // ✅ Save to student_numbering_table
      await db3.query(
        `INSERT INTO student_numbering_table (student_number, person_id) VALUES (?, ?)`,
        [student_number, person_id]
      );

      await db3.query(
        `INSERT INTO person_status_table (person_id, exam_status, requirements, residency, student_registration_status, exam_result, hs_ave)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [person_id, 0, 0, 0, 0, 0, 0]
      );

      // ✅ Copy requirements to db3
      for (const req of requirements) {
        await db3.query(
          `INSERT INTO requirement_uploads 
          (requirements_id, person_id, submitted_documents, file_path, original_name, remarks, status, document_status, registrar_status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.requirements_id,
            req.person_id,
            req.submitted_documents,
            req.file_path,
            req.original_name,
            req.remarks,
            req.status,
            req.document_status,
            req.registrar_status,
            req.created_at,
          ]
        );
      }

      await db3.query(
        `INSERT INTO student_status_table 
         (student_number, active_curriculum, enrolled_status, year_level_id, active_school_year_id, control_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [student_number, 0, 1, 0, 0, 0]
      );

      // ✅ Update registration status
      await db3.query(
        `UPDATE person_status_table SET student_registration_status = 1 WHERE person_id = ?`,
        [person_id]
      );

      // ✅ Insert login credentials (or update if existing)
      const [existingUser] = await db3.query(
        `SELECT * FROM user_accounts WHERE person_id = ?`,
        [person_id]
      );

      if (existingUser.length === 0) {
        await db3.query(
          `INSERT INTO user_accounts (person_id, email, password, role) VALUES (?, ?, ?, 'student')`,
          [person_id, emailAddress, hashedPassword]
        );
      } else {
        await db3.query(
          `UPDATE user_accounts SET email = ?, password = ?, role = 'student' WHERE person_id = ?`,
          [emailAddress, hashedPassword, person_id]
        );
      }

      // ✅ Emit success result
      socket.emit("assign-student-number-result", {
        success: true,
        student_number,
        message: "Student number assigned successfully.",
      });

      // ✅ Fetch company name dynamically
      const [[company]] = await db.query(
        "SELECT company_name FROM company_settings WHERE id = 1"
      );
      const companyName = company?.company_name || "Enrollment Office";

      // ✅ Send welcome email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"${companyName} Enrollment Office" <${process.env.EMAIL_USER}>`,
        to: emailAddress,
        subject: `🎓 Welcome to ${companyName} - Acceptance Confirmation`,
        text: `
Hi, ${first_name} ${middle_name || ""} ${last_name},

🎉 Congratulations! You are now officially accepted and part of the ${companyName} community.

Please visit your respective college offices to tag your schedule to your account and obtain your class schedule.

Your Student Number is: ${student_number}
Your Email Address is: ${emailAddress}

Your temporary password is: ${tempPassword}

You may change your password and keep it secure.

👉 Click the link below to log in:
http://localhost:5173/login
`.trim(),
      };

      // ✅ Send email (non-blocking)
      transporter.sendMail(mailOptions).catch(console.error);

    } catch (error) {
      console.error("Error in assign-student-number:", error);
      socket.emit("assign-student-number-result", {
        success: false,
        message: "Internal server error.",
      });
    }
  });

});


// ============================
// GET - Day List (from schedule table)
// ============================
app.get("/day_list", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT DISTINCT day_description FROM entrance_exam_schedule ORDER BY FIELD(day_description, 'Monday','Tuesday','Wednesday','Thursday','Friday')"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching days:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================
// GET - Room List (from enrollment.room_table)
// ============================
app.get("/room_list", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT room_id, room_description, building_description FROM enrollment.room_table ORDER BY room_description ASC"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// ============================
// POST - Insert Entrance Exam Schedule
// ============================
// ✅ Get all interview schedules
app.get("/interview_schedules", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.schedule_id,
        s.day_description,
        s.building_description,
        s.room_description,
        s.start_time,
        s.end_time,
        s.interviewer,
        s.room_quota,
        s.created_at
      FROM admission.interview_exam_schedule s
      ORDER BY s.day_description, s.start_time
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching interview schedules:", err);
    res.status(500).json({ error: "Failed to fetch interview schedules" });
  }
});

// ✅ Get interview schedules with applicant counts
// 3. Get interview schedules with occupancy count
app.get("/interview_schedules_with_count", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.schedule_id,
        s.day_description,
        s.building_description,
        s.room_description,
        s.start_time,
        s.end_time,
        s.interviewer,
        s.room_quota,
        IFNULL(COUNT(ia.applicant_id), 0) AS current_occupancy   -- ✅ always number, no undefined
      FROM interview_exam_schedule s
      LEFT JOIN interview_applicants ia 
        ON s.schedule_id = ia.schedule_id
      GROUP BY 
        s.schedule_id, 
        s.day_description,
        s.building_description,
        s.room_description,
        s.start_time,
        s.end_time,
        s.interviewer,
        s.room_quota
      ORDER BY s.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching interview schedules with count:", err);
    res.status(500).json({ error: "Failed to fetch interview schedules with count" });
  }
});


// ================== INTERVIEW APPLICANTS API ==================

// 1. Get interview applicants with applicant_number + person info
app.get("/api/interview/applicants-with-number", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.person_id,
        a.applicant_number,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.extension,
        p.program,
        p.emailAddress,
        p.campus,
        ia.schedule_id,
        ia.email_sent
      FROM interview_applicants ia
      LEFT JOIN applicant_numbering_table a 
        ON ia.applicant_id = a.applicant_number
      LEFT JOIN person_table p 
        ON a.person_id = p.person_id
      ORDER BY p.last_name, p.first_name
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching interview applicants:", err);
    res.status(500).json({ error: "Failed to fetch interview applicants" });
  }
});

// ================== INTERVIEW APPLICANTS API ==================

// ================== INTERVIEW APPLICANTS API ==================

// 1. Get not-emailed interview applicants
app.get("/api/interview/not-emailed-applicants", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.person_id,
        p.last_name,
        p.first_name,
        p.middle_name,
        p.extension,
        p.emailAddress,
        p.program,
        p.created_at,
        a.applicant_number,
        SUBSTRING(a.applicant_number, 5, 1) AS middle_code,
        ia.schedule_id,
        ia.email_sent,
        ies.day_description,
        ies.room_description,
        ies.start_time,
        ies.end_time,
        ies.interviewer,
        ps.interview_status,
        -- ✅ exam scores
        ae.English,
        ae.Science,
        ae.Filipino,
        ae.Math,
        ae.Abstract,
        ae.final_rating   -- ✅ bring in the computed rating
      FROM interview_applicants ia
      LEFT JOIN applicant_numbering_table a 
        ON ia.applicant_id = a.applicant_number
      LEFT JOIN person_table p 
        ON a.person_id = p.person_id
      LEFT JOIN interview_exam_schedule ies
        ON ia.schedule_id = ies.schedule_id
      LEFT JOIN person_status_table ps 
        ON ps.person_id = p.person_id
      LEFT JOIN admission_exam ae       -- ✅ join exam results
        ON ae.person_id = p.person_id
      WHERE (ia.email_sent = 0 OR ia.email_sent IS NULL)
      ORDER BY p.last_name ASC, p.first_name ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching interview not-emailed applicants:", err);
    res.status(500).send("Server error");
  }
});


// 2. Get all interview schedules
app.get("/interview_schedules", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM interview_exam_schedule
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching interview schedules:", err);
    res.status(500).json({ error: "Failed to fetch interview schedules" });
  }
});

// 3. Get interview schedules with occupancy count
app.get("/interview_schedules_with_count", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.schedule_id,
        s.day_description,
        s.building_description,
        s.room_description,
        s.start_time,
        s.end_time,
        s.interviewer,
        s.room_quota,
        COALESCE(COUNT(ia.applicant_id), 0) AS current_occupancy   -- ✅ no undefined
      FROM interview_exam_schedule s
      LEFT JOIN interview_applicants ia 
        ON s.schedule_id = ia.schedule_id
      GROUP BY s.schedule_id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching interview schedules with count:", err);
    res.status(500).json({ error: "Failed to fetch interview schedules with count" });
  }
});

app.put("/api/interview_applicants/assign", async (req, res) => {
  const { applicant_numbers } = req.body;
  console.log(applicant_numbers);

  if (!Array.isArray(applicant_numbers) || applicant_numbers.length === 0) {
    return res.status(400).json({ message: "No applicant numbers provided" });
  }

  try {
    const [result] = await db3.query(
      `UPDATE admission.interview_applicants 
       SET status = 'Accepted' 
       WHERE applicant_id IN (?)`,
      [applicant_numbers]
    );

    res.json({
      message: `Updated ${result.affectedRows} applicants to Accepted.`,
      updated: applicant_numbers,
    });
  } catch (err) {
    console.error("Error accepting applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/interview_applicants/assign/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;

  if (!applicant_number) {
    return res.status(400).json({ message: "Missing applicant_number" });
  }

  try {
    const [result] = await db3.query(
      `UPDATE admission.interview_applicants 
       SET status = 'Accepted' 
       WHERE applicant_id = ?`,
      [applicant_number]
    );

    res.json({
      message: `Applicant ${applicant_number} updated to Accepted.`,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error accepting applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.put("/api/interview_applicants/unassign/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;

  if (!applicant_number) {
    return res.status(400).json({ message: "Missing applicant_number" });
  }

  try {
    const [result] = await db3.query(
      `UPDATE admission.interview_applicants 
       SET status = 'Waiting List' 
       WHERE applicant_id = ?`,
      [applicant_number]
    );

    res.json({
      message: `Applicant ${applicant_number} updated to Accepted.`,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error accepting applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/interview_applicants/unassign-all", async (req, res) => {
  const { applicant_numbers } = req.body;
  console.log(applicant_numbers);

  if (!Array.isArray(applicant_numbers) || applicant_numbers.length === 0) {
    return res.status(400).json({ message: "No applicant numbers provided" });
  }

  try {
    const [result] = await db3.query(
      `UPDATE admission.interview_applicants 
       SET status = 'Waiting List' 
       WHERE applicant_id IN (?)`,
      [applicant_numbers]
    );

    res.json({
      message: `Updated ${result.affectedRows} applicants to Accepted.`,
      updated: applicant_numbers,
    });
  } catch (err) {
    console.error("Error accepting applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================== INTERVIEW SOCKET EVENTS ==================
io.on("connection", (socket) => {
  console.log("✅ New client connected for Interview Scheduling");

  // Assign applicants (single, 40, custom — all handled here)
  socket.on("update_interview_schedule", async ({ schedule_id, applicant_numbers }) => {
    try {
      if (!Array.isArray(applicant_numbers) || applicant_numbers.length === 0) {
        socket.emit("update_schedule_result", { success: false, error: "No applicants provided." });
        return;
      }

      // 🔍 1. Get schedule info (quota)
      const [[schedule]] = await db.query(
        `SELECT room_quota FROM interview_exam_schedule WHERE schedule_id = ?`,
        [schedule_id]
      );

      if (!schedule) {
        socket.emit("update_schedule_result", { success: false, error: "Schedule not found." });
        return;
      }

      // 🔍 2. Get current occupancy
      const [[{ current_count }]] = await db.query(
        `SELECT COUNT(*) AS current_count FROM interview_applicants WHERE schedule_id = ?`,
        [schedule_id]
      );

      const availableSlots = schedule.room_quota - current_count;
      if (availableSlots <= 0) {
        socket.emit("update_schedule_result", {
          success: false,
          error: `⚠️ Schedule is already full (${schedule.room_quota} applicants).`,
        });
        return;
      }

      // 🔍 3. Trim applicant_numbers if more than available slots
      const toAssign = applicant_numbers.slice(0, availableSlots);

      // ✅ 4. Update only those applicants
      const [results] = await db.query(
        `UPDATE interview_applicants
         SET schedule_id = ?
         WHERE applicant_id IN (?)`,
        [schedule_id, toAssign]
      );

      socket.emit("update_schedule_result", {
        success: true,
        assigned: toAssign,
        updated: results.affectedRows,
        skipped: applicant_numbers.length - toAssign.length
      });

      // 🔄 notify all clients
      io.emit("schedule_updated", { schedule_id });
    } catch (err) {
      console.error("❌ Error updating interview schedule:", err);
      socket.emit("update_schedule_result", { success: false, error: "Failed to update interview schedule." });
    }
  });

  // Unassign ALL
  socket.on("unassign_all_from_interview", async ({ schedule_id }) => {
    try {
      await db.query(
        `UPDATE interview_applicants
         SET schedule_id = NULL
         WHERE schedule_id = ?`,
        [schedule_id]
      );
      socket.emit("unassign_all_result", { success: true, message: "All applicants unassigned." });
      io.emit("schedule_updated", { schedule_id });
    } catch (err) {
      console.error("❌ Error unassigning all interview applicants:", err);
      socket.emit("unassign_all_result", { success: false, error: "Failed to unassign all applicants." });
    }
  });

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":"); // ignore seconds
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // convert 0 -> 12
    return `${h}:${minutes} ${ampm}`;
  }

  // 📩 Handle sending interview schedule emails
  // 📩 Handle sending interview schedule emails
  socket.on("send_interview_emails", async ({ schedule_id, applicant_numbers, subject, senderName, message, user_person_id }) => {
    try {
      // 🔹 Fetch applicants linked to the interview schedule
      const [rows] = await db.query(
        `SELECT 
          ia.schedule_id,
          s.day_description,
          s.building_description,
          s.room_description,
          s.start_time,
          s.end_time,
          an.applicant_number,
          p.person_id,
          p.first_name,
          p.last_name,
          p.emailAddress
        FROM interview_applicants ia
        JOIN interview_exam_schedule s ON ia.schedule_id = s.schedule_id
        JOIN applicant_numbering_table an ON ia.applicant_id = an.applicant_number
        JOIN person_table p ON an.person_id = p.person_id
        WHERE ia.schedule_id = ? AND an.applicant_number IN (?)`,
        [schedule_id, applicant_numbers]
      );

      if (rows.length === 0) {
        return socket.emit("send_schedule_emails_result", {
          success: false,
          error: "No applicants found for this interview schedule.",
        });
      }

      // ✅ Use db3 (enrollment) → user_accounts instead of prof
      const [actorRows] = await db3.query(
        `SELECT 
     email AS actor_email,
     role,
     employee_id,
     last_name,
     first_name,
     middle_name
   FROM user_accounts
   WHERE person_id = ?
   LIMIT 1`,
        [user_person_id]
      );

      const actor = actorRows[0];

      // ✅ Format: ROLE (EMPLOYEE_ID) - LastName, FirstName MiddleName
      const actorEmail = actor?.actor_email || "earistmis@gmail.com";
      const actorName = actor
        ? `${actor.role.toUpperCase()} (${actor.employee_id || "N/A"}) - ${actor.last_name}, ${actor.first_name}${actor.middle_name ? " " + actor.middle_name : ""}`
        : "SYSTEM";

      const sent = [];
      const failed = [];

      for (const row of rows) {
        if (!row.emailAddress) {
          failed.push(row.applicant_number);
          continue;
        }

        const formattedStart = new Date(`1970-01-01T${row.start_time}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const formattedEnd = new Date(`1970-01-01T${row.end_time}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const personalizedMsg = message
          .replace("{first_name}", row.first_name)
          .replace("{last_name}", row.last_name)
          .replace("{applicant_number}", row.applicant_number)
          .replace("{day}", row.day_description)
          .replace("{room}", row.room_description)
          .replace("{start_time}", formattedStart)
          .replace("{end_time}", formattedEnd);

        const mailOptions = {
          from: `"${senderName}" <${process.env.EMAIL_USER}>`,
          to: row.emailAddress,
          subject,
          text: personalizedMsg,
        };

        try {
          await transporter.sendMail(mailOptions);

          // Mark applicant email sent
          await db.query(
            "UPDATE interview_applicants SET email_sent = 1 WHERE applicant_id = ?",
            [row.applicant_number]
          );

          // Insert notification log
          await db.query(
            `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
           VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              "email",
              `📧 Interview schedule email sent for Applicant #${row.applicant_number} (Schedule #${row.schedule_id})`,
              row.applicant_number,
              actorEmail,
              actorName,
            ]
          );

          sent.push(row.applicant_number);
        } catch (err) {
          console.error(`❌ Failed to send interview email to ${row.emailAddress}:`, err.message);
          await db.query("UPDATE interview_applicants SET email_sent = -1 WHERE applicant_id = ?", [
            row.applicant_number,
          ]);
          failed.push(row.applicant_number);
        }
      }

      // Emit result to frontend
      socket.emit("send_schedule_emails_result", {
        success: true,
        sent,
        failed,
        message: `Interview emails processed: Sent=${sent.length}, Failed=${failed.length}`,
      });

      // Notify all clients to refresh
      io.emit("schedule_updated", { schedule_id });
    } catch (err) {
      console.error("Error in send_interview_emails:", err);
      socket.emit("send_schedule_emails_result", {
        success: false,
        error: "Server error sending interview emails.",
      });
    }
  });

});


// ================== INSERT EXAM SCHEDULE ==================
app.post("/insert_exam_schedule", async (req, res) => {
  try {
    const {
      day_description,
      building_description,
      room_description,
      start_time,
      end_time,
      proctor,
      room_quota,
    } = req.body;

    // 🔍 1. Check for conflicts
    const [conflicts] = await db.query(
      `SELECT * 
       FROM entrance_exam_schedule 
       WHERE day_description = ?
         AND building_description = ?
         AND room_description = ?
         AND (
              (start_time < ? AND end_time > ?) OR   -- new start inside existing
              (start_time < ? AND end_time > ?) OR   -- new end inside existing
              (start_time >= ? AND end_time <= ?)    -- fully overlaps
         )`,
      [
        day_description,
        building_description,
        room_description,
        end_time, start_time,
        end_time, start_time,
        start_time, end_time,
      ]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: "⚠️ Conflict: Room is already booked at this time." });
    }

    // ✅ 2. Insert if no conflict
    await db.query(
      `INSERT INTO entrance_exam_schedule 
         (day_description, building_description, room_description, start_time, end_time, proctor, room_quota) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [day_description, building_description, room_description, start_time, end_time, proctor, room_quota]
    );

    res.json({ success: true, message: "Exam schedule saved successfully ✅" });
  } catch (err) {
    console.error("❌ Error inserting exam schedule:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== INSERT INTERVIEW SCHEDULE ==================
app.post("/insert_interview_schedule", async (req, res) => {
  try {
    const {
      day_description,
      building_description,
      room_description,
      start_time,
      end_time,
      interviewer,
      room_quota,
    } = req.body;

    // 🔍 Conflict check
    const [conflicts] = await db.query(
      `SELECT * 
       FROM interview_exam_schedule 
       WHERE day_description = ?
         AND building_description = ?
         AND room_description = ?
         AND (
              (start_time < ? AND end_time > ?) OR
              (start_time < ? AND end_time > ?) OR
              (start_time >= ? AND end_time <= ?)
         )`,
      [
        day_description,
        building_description,
        room_description,
        end_time, start_time,
        end_time, start_time,
        start_time, end_time,
      ]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: "⚠️ Conflict: Room is already booked at this time." });
    }

    // ✅ Insert if no conflict
    await db.query(
      `INSERT INTO interview_exam_schedule 
         (day_description, building_description, room_description, start_time, end_time, interviewer, room_quota) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [day_description, building_description, room_description, start_time, end_time, interviewer, room_quota]
    );

    res.json({ success: true, message: "Interview schedule saved successfully ✅" });
  } catch (err) {
    console.error("❌ Error inserting interview schedule:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/exam_schedules", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.schedule_id,
        s.day_description,
        s.building_description,
        s.room_description,
        s.start_time,
        s.end_time,
        s.proctor,
        s.room_quota,
        COUNT(ea.applicant_id) AS assigned_count
      FROM entrance_exam_schedule s
      LEFT JOIN exam_applicants ea ON s.schedule_id = ea.schedule_id
      GROUP BY s.schedule_id
      ORDER BY s.schedule_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Database error" });
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket.IO client connected");

  socket.on("update_schedule", async ({ schedule_id, applicant_numbers }) => {
    try {
      if (!schedule_id || !applicant_numbers || applicant_numbers.length === 0) {
        return socket.emit("update_schedule_result", {
          success: false,
          error: "Schedule ID and applicants required.",
        });
      }

      // 🔎 Get room quota
      const [[scheduleInfo]] = await db.query(
        `SELECT room_quota FROM entrance_exam_schedule WHERE schedule_id = ?`,
        [schedule_id]
      );
      if (!scheduleInfo) {
        return socket.emit("update_schedule_result", {
          success: false,
          error: "Schedule not found.",
        });
      }
      const roomQuota = scheduleInfo.room_quota;

      // 🔎 Count how many are already assigned
      const [[{ currentCount }]] = await db.query(
        `SELECT COUNT(*) AS currentCount FROM exam_applicants WHERE schedule_id = ?`,
        [schedule_id]
      );

      // If total would exceed quota, reject
      if (currentCount + applicant_numbers.length > roomQuota) {
        return socket.emit("update_schedule_result", {
          success: false,
          error: `Room quota exceeded! Capacity: ${roomQuota}, Currently Assigned: ${currentCount}, Trying to add: ${applicant_numbers.length}.`,
        });
      }

      const assigned = [];
      const updated = [];
      const skipped = [];

      for (const applicant_number of applicant_numbers) {
        const [check] = await db.query(
          `SELECT * FROM exam_applicants WHERE applicant_id = ?`,
          [applicant_number]
        );

        if (check.length > 0) {
          if (check[0].schedule_id === schedule_id) {
            skipped.push(applicant_number); // already in this schedule
          } else {
            await db.query(
              `UPDATE exam_applicants SET schedule_id = ? WHERE applicant_id = ?`,
              [schedule_id, applicant_number]
            );
            updated.push(applicant_number);
          }
        } else {
          await db.query(
            `INSERT INTO exam_applicants (applicant_id, schedule_id) VALUES (?, ?)`,
            [applicant_number, schedule_id]
          );
          assigned.push(applicant_number);
        }
      }

      console.log("✅ Assigned:", assigned);
      console.log("✏️ Updated:", updated);
      console.log("⚠️ Skipped:", skipped);

      socket.emit("update_schedule_result", {
        success: true,
        assigned,
        updated,
        skipped,
      });
    } catch (error) {
      console.error("❌ Error assigning schedule:", error);
      socket.emit("update_schedule_result", {
        success: false,
        error: "Failed to assign schedule.",
      });
    }
  });

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":"); // ignore seconds
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // convert 0 -> 12
    return `${h}:${minutes} ${ampm}`;
  }

  socket.on("send_schedule_emails", async ({ schedule_id, user_person_id }) => {
    try {
      // ✅ 1️⃣ Get actor info with employee_id, full name, and email
      const [actorRows] = await db3.query(
        `SELECT email, role, employee_id, last_name, first_name, middle_name 
       FROM user_accounts 
       WHERE person_id = ? LIMIT 1`,
        [user_person_id]
      );

      let actorEmail = "system@localhost";
      let actorName = "SYSTEM";

      if (actorRows.length > 0) {
        const u = actorRows[0];
        const role = u.role?.toUpperCase() || "UNKNOWN";
        const empId = u.employee_id || "";
        const lname = u.last_name || "";
        const fname = u.first_name || "";
        const mname = u.middle_name || "";
        const email = u.email || "";

        actorEmail = email;
        actorName = `${role} (${empId}) - ${lname}, ${fname} ${mname}`.trim();
      }

      // ✅ 2️⃣ Get company name from settings (no more hard-coded "Admission Office")
      const [[company]] = await db.query(
        "SELECT company_name FROM company_settings WHERE id = 1"
      );
      const companyName = company?.company_name || "Admission Office";

      // ✅ 3️⃣ Fetch applicants (only those who haven’t been emailed yet)
      const [rows] = await db.query(
        `SELECT 
         ea.schedule_id,
         s.day_description,
         s.room_description,
         s.start_time,
         s.end_time,
         an.applicant_number,
         p.person_id,
         p.first_name,
         p.last_name,
         p.emailAddress,
         p.campus
       FROM exam_applicants ea
       JOIN entrance_exam_schedule s 
         ON ea.schedule_id = s.schedule_id
       JOIN applicant_numbering_table an 
         ON ea.applicant_id = an.applicant_number
       JOIN person_table p 
         ON an.person_id = p.person_id
       WHERE ea.schedule_id = ? 
         AND (ea.email_sent IS NULL OR ea.email_sent = 0)`,
        [schedule_id]
      );

      if (rows.length === 0) {
        return socket.emit("send_schedule_emails_result", {
          success: false,
          error: "No applicants found for this schedule.",
        });
      }

      const batchSize = 5;
      const delayMs = 1000;
      const sent = [];
      const failed = [];
      const skipped = [];

      // ✅ Helper function to format time
      const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":");
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
      };

      // ✅ Helper function to send individual email
      const sendEmail = async (row) => {
        if (!row.emailAddress) {
          skipped.push(row.applicant_number);
          console.warn(`⚠️ Applicant ${row.applicant_number} has no email`);
          return;
        }

        const formattedStart = formatTime(row.start_time);
        const formattedEnd = formatTime(row.end_time);

        const mailOptions = {
          from: `"${companyName}" <${process.env.EMAIL_USER}>`,
          to: row.emailAddress,
          subject: "Your Entrance Exam Schedule",
          text: `Hello ${row.first_name} ${row.last_name},

You have been assigned to the following entrance exam schedule:

📅 Day: ${row.day_description}
🏫 Room: ${row.room_description}
🕒 Time: ${formattedStart} - ${formattedEnd}
🆔 Applicant No: ${row.applicant_number}

Please log in to your Applicant Form Dashboard, click on your Exam Permit, and print it. 
This printed permit must be presented to your proctor on the exam day to verify your eligibility.

⚠️ Important Reminders:
- Arrive at least 30 minutes before your scheduled exam.  
- Bring your printed exam permit, a valid ID, your own pen, and all required documents.  
- Wear a plain white t-shirt on the exam day.  

Thank you and good luck!

${companyName}`,
        };

        try {
          await transporter.sendMail(mailOptions);

          // ✅ Update flags
          await db.query(
            `UPDATE exam_applicants 
           SET email_sent = 1 
           WHERE applicant_id = ? AND schedule_id = ?`,
            [row.applicant_number, row.schedule_id]
          );

          await db.query(
            `UPDATE person_status_table 
           SET exam_status = 1 
           WHERE person_id = ?`,
            [row.person_id]
          );

          // ✅ Log notification
          const message = `📧 Exam schedule email sent for Applicant #${row.applicant_number} (Schedule #${row.schedule_id})`;
          await db.query(
            `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
           VALUES (?, ?, ?, ?, ?, NOW())`,
            ["email", message, row.applicant_number, actorEmail, actorName]
          );

          console.log(`✅ Email sent + flags updated for ${row.emailAddress}`);
          sent.push(row.applicant_number);
        } catch (err) {
          console.error(`❌ Failed to send email to ${row.emailAddress}:`, err.message);
          failed.push(row.applicant_number);
        }
      };

      // ✅ 4️⃣ Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await Promise.all(batch.map(sendEmail));
        if (i + batchSize < rows.length) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      // ✅ 5️⃣ Send summary back to sender
      socket.emit("send_schedule_emails_result", {
        success: true,
        sent,
        failed,
        skipped,
        message: `Emails processed: Sent=${sent.length}, Failed=${failed.length}, Skipped=${skipped.length}`,
      });

      // ✅ 6️⃣ Notify other clients for refresh
      io.emit("schedule_updated", { schedule_id });
    } catch (err) {
      console.error("Error in send_schedule_emails:", err);
      socket.emit("send_schedule_emails_result", {
        success: false,
        error: "Server error sending emails.",
      });
    }
  });


});

// Unassign ALL applicants from a schedule
app.post("/unassign_all_from_schedule", async (req, res) => {
  const { schedule_id } = req.body;
  try {
    // ✅ Correct table: exam_applicants
    await db.execute("UPDATE exam_applicants SET schedule_id = NULL WHERE schedule_id = ?", [schedule_id]);
    res.json({ success: true, message: `All applicants unassigned from schedule ${schedule_id}` });
  } catch (err) {
    console.error("Error unassigning all applicants:", err);
    res.status(500).json({ error: "Failed to unassign all applicants" });
  }
});


// Unassign schedule from an applicant
app.post("/unassign_schedule", async (req, res) => {
  const { applicant_number } = req.body;

  if (!applicant_number) {
    return res.status(400).json({ error: "Applicant number is required." });
  }

  try {
    const [result] = await db.query(
      `DELETE FROM admission.exam_applicants WHERE applicant_id = ?`,
      [applicant_number]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: `Applicant ${applicant_number} unassigned.` });
    } else {
      res.status(404).json({ error: "Applicant not found or not assigned." });
    }
  } catch (err) {
    console.error("Error unassigning schedule:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get current number of applicants assigned to a schedule
app.get("/api/exam-schedule-count/:schedule_id", async (req, res) => {
  const { schedule_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM exam_applicants 
       WHERE schedule_id = ?`,
      [schedule_id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("Error fetching schedule count:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET schedules with current occupancy
app.get("/exam_schedules_with_count", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.schedule_id,
        s.day_description,
        s.building_description,
        s.room_description,
        s.start_time,
        s.end_time,
        s.proctor,
        s.room_quota,
        s.created_at,   -- add this line
        COUNT(ea.applicant_id) AS current_occupancy
      FROM entrance_exam_schedule s
      LEFT JOIN exam_applicants ea
        ON s.schedule_id = ea.schedule_id
      GROUP BY s.schedule_id
      ORDER BY s.created_at DESC   -- sort by newest timestamp
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching schedules with count:", err);
    res.status(500).json({ error: "Database error" });
  }
});


//READ ENROLLED USERS (UPDATED!)
app.get("/enrolled_users", async (req, res) => {
  try {
    const query = "SELECT * FROM user_accounts";

    const [result] = await db3.query(query);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "Error Fetching data from the server" });
  }
});

// DEPARTMENT CREATION (UPDATED!)
app.post("/department", async (req, res) => {
  const { dep_name, dep_code } = req.body;
  const query = "INSERT INTO dprtmnt_table (dprtmnt_name, dprtmnt_code) VALUES (?, ?)";

  try {
    const [result] = await db3.query(query, [dep_name, dep_code]);
    res.status(200).send({ insertId: result.insertId });
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).send({ error: "Failed to create department" });
  }
});

// DEPARTMENT LIST (UPDATED!)
app.get("/get_department", async (req, res) => {
  const getQuery = "SELECT * FROM dprtmnt_table";

  try {
    const [result] = await db3.query(getQuery);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// UPDATE DEPARTMENT INFORMATION (SUPERADMIN) (UPDATED!)
app.put("/update_department/:id", async (req, res) => {
  const { id } = req.params; // Extract the department ID from the URL parameter
  const { dep_name, dep_code } = req.body; // Get the department name and code from the request body

  const updateQuery = `
      UPDATE dprtmnt_table 
      SET dprtmnt_name = ?, dprtmnt_code = ? 
      WHERE id = ?`;

  try {
    const [result] = await db3.query(updateQuery, [dep_name, dep_code, id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Department not found" });
    }

    res.status(200).send({ message: "Department updated successfully" });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// DELETE DEPARTMENT (SUPERADMIN) (UPDATED!)
app.delete("/delete_department/:id", async (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM dprtmnt_table WHERE id = ?";

  try {
    const [result] = await db3.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Department not found" });
    }

    res.status(200).send({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// PROGRAM CREATION (UPDATED!)
app.post("/program", async (req, res) => {
  const { name, code } = req.body;

  const insertProgramQuery = "INSERT INTO program_table (program_description, program_code) VALUES (?, ?)";

  try {
    const [result] = await db3.query(insertProgramQuery, [name, code]);
    res.status(200).send({ message: "Program created successfully", result });
  } catch (err) {
    console.error("Error creating program:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// PROGRAM TABLE (UPDATED!)
app.get("/get_program", async (req, res) => {
  const programQuery = "SELECT * FROM program_table";

  try {
    const [result] = await db3.query(programQuery);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error fetching programs:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// ✅ UPDATE PROGRAM
app.put("/program/:id", async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;

  const updateQuery = `
    UPDATE program_table 
    SET program_description = ?, program_code = ?
    WHERE program_id = ?`;

  try {
    await db3.query(updateQuery, [name, code, id]);
    res.status(200).send({ message: "Program updated successfully" });
  } catch (err) {
    console.error("Error updating program:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// ✅ DELETE PROGRAM
app.delete("/program/:id", async (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM program_table WHERE program_id = ?";

  try {
    await db3.query(deleteQuery, [id]);
    res.status(200).send({ message: "Program deleted successfully" });
  } catch (err) {
    console.error("Error deleting program:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});


// UPDATE PROGRAM INFORMATION (SUPERADMIN)(UPDATED!)
app.put("/update_program/:id", async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;

  const updateQuery = "UPDATE program_table SET program_description = ?, program_code = ? WHERE id = ?";

  try {
    const [result] = await db3.query(updateQuery, [name, code, id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Program not found" });
    }

    res.status(200).send({ message: "Program updated successfully" });
  } catch (err) {
    console.error("Error updating program:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// DELETE PROGRAM (SUPERADMIN) (UPDATED!)
app.delete("/delete_program/:id", async (req, res) => {
  const { id } = req.params;

  const deleteQuery = "DELETE FROM program_table WHERE id = ?";

  try {
    const [result] = await db3.query(deleteQuery, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Program not found" });
    }

    res.status(200).send({ message: "Program deleted successfully" });
  } catch (err) {
    console.error("Error deleting program:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// CURRICULUM CREATION (UPDATED!)
app.post("/curriculum", async (req, res) => {
  const { year_id, program_id } = req.body;

  if (!year_id || !program_id) {
    return res.status(400).json({ error: "Year ID and Program ID are required" });
  }

  try {
    const sql = "INSERT INTO curriculum_table (year_id, program_id) VALUES (?, ?)";
    const [result] = await db3.query(sql, [year_id, program_id]);

    res.status(201).json({
      message: "Curriculum created successfully",
      curriculum_id: result.insertId,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
});

// CURRICULUM LIST (UPDATED!)
app.get("/get_curriculum", async (req, res) => {
  const readQuery = `
    SELECT ct.*, p.*, y.* 
    FROM curriculum_table ct 
    INNER JOIN program_table p ON ct.program_id = p.program_id
    INNER JOIN year_table y ON ct.year_id = y.year_id
  `;

  try {
    const [result] = await db3.query(readQuery);
    res.status(200).json(result);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
});

// ✅ UPDATE Curriculum lock_status (0 = inactive, 1 = active)
app.put("/update_curriculum/:id", async (req, res) => {
  const { id } = req.params;
  const { lock_status } = req.body;

  try {
    // Ensure valid input
    if (lock_status !== 0 && lock_status !== 1) {
      return res.status(400).json({ message: "Invalid status value (must be 0 or 1)" });
    }

    const sql = "UPDATE curriculum_table SET lock_status = ? WHERE curriculum_id = ?";
    const [result] = await db3.query(sql, [lock_status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    res.status(200).json({ message: "Curriculum status updated successfully" });
  } catch (error) {
    console.error("❌ Error updating curriculum status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


/// COURSE TABLE - ADDING COURSE (UPDATED!)
app.post("/adding_course", async (req, res) => {
  const { course_code, course_description, course_unit, lab_unit } = req.body;
  try {
    await db3.query(
      "INSERT INTO course_table (course_code, course_description, course_unit, lab_unit) VALUES (?, ?, ?, ?)",
      [course_code, course_description, course_unit, lab_unit]
    );
    res.json({ message: "✅ Course added successfully" });
  } catch (error) {
    console.error("❌ Error adding course:", error);
    res.status(500).json({ message: "Failed to add course" });
  }
});

// ✅ Update an existing course
app.put("/update_course/:id", async (req, res) => {
  const { id } = req.params;
  const { course_code, course_description, course_unit, lab_unit } = req.body;
  try {
    const [result] = await db3.query(
      "UPDATE course_table SET course_code=?, course_description=?, course_unit=?, lab_unit=? WHERE course_id=?",
      [course_code, course_description, course_unit, lab_unit, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "✅ Course updated successfully" });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ message: "Failed to update course" });
  }
});

// ✅ Delete a course
app.delete("/delete_course/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db3.query("DELETE FROM course_table WHERE course_id=?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "✅ Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});



// READ COURSE LIST (UPDATED!)
// ✅ FIXED: Works with your curriculum_table structure
app.get("/prgram_tagging_list", async (req, res) => {
  const readQuery = `
    SELECT 
      pt.program_tagging_id,
      pt.curriculum_id,
      pt.course_id,
      pt.year_level_id,
      pt.semester_id,
      -- show readable labels
      CONCAT(y.year_description, ' - ', p.program_description) AS curriculum_description,
      co.course_code,
      co.course_description,
      yl.year_level_description,
      s.semester_description
    FROM 
      program_tagging_table pt
      JOIN curriculum_table c ON pt.curriculum_id = c.curriculum_id
      JOIN year_table y ON c.year_id = y.year_id
      JOIN program_table p ON c.program_id = p.program_id
      JOIN course_table co ON pt.course_id = co.course_id
      JOIN year_level_table yl ON pt.year_level_id = yl.year_level_id
      JOIN semester_table s ON pt.semester_id = s.semester_id
  `;

  try {
    const [result] = await db3.query(readQuery);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching tagged programs:", error);
    res.status(500).json({ error: "Error fetching program tagging list" });
  }
});


app.put("/program_tagging/:id", async (req, res) => {
  const { id } = req.params;
  const { curriculum_id, year_level_id, semester_id, course_id } = req.body;

  try {
    const query = `
      UPDATE program_tagging_table
      SET curriculum_id = ?, year_level_id = ?, semester_id = ?, course_id = ?
      WHERE program_tagging_id = ?
    `;
    const [result] = await db3.query(query, [
      curriculum_id,
      year_level_id,
      semester_id,
      course_id,
      id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Program tag not found" });

    res.status(200).json({ message: "Program tag updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update program tag", details: err.message });
  }
});

app.delete("/program_tagging/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM program_tagging_table WHERE program_tagging_id = ?";
    const [result] = await db3.query(query, [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Program tag not found" });

    res.status(200).json({ message: "Program tag deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete program tag", details: err.message });
  }
});



// GET COURSES BY CURRICULUM ID (UPDATED!)
app.get("/get_courses_by_curriculum/:curriculum_id", async (req, res) => {
  const { curriculum_id } = req.params;

  const query = `
    SELECT c.* 
    FROM program_tagging_table pt
    INNER JOIN course_table c ON pt.course_id = c.course_id
    WHERE pt.curriculum_id = ?
  `;

  try {
    const [result] = await db3.query(query, [curriculum_id]);
    res.status(200).json(result);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Failed to retrieve courses",
      details: err.message,
    });
  }
});

// COURSE TAGGING LIST (UPDATED!)
app.get("/get_course", async (req, res) => {
  const getCourseQuery = `
    SELECT 
      yl.*, st.*, c.*
    FROM program_tagging_table pt
    INNER JOIN year_level_table yl ON pt.year_level_id = yl.year_level_id
    INNER JOIN semester_table st ON pt.semester_id = st.semester_id
    INNER JOIN course_table c ON pt.course_id = c.course_id
  `;

  try {
    const [results] = await db3.query(getCourseQuery);
    res.status(200).json(results);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Failed to retrieve course tagging list",
      details: err.message,
    });
  }
});

// COURSE LIST (UPDATED!)
app.get("/course_list", async (req, res) => {
  const query = "SELECT * FROM course_table";

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({
      error: "Query failed",
      details: err.message,
    });
  }
});

// PROGRAM TAGGING TABLE (UPDATED!)
app.post("/program_tagging", async (req, res) => {
  const { curriculum_id, year_level_id, semester_id, course_id } = req.body;

  if (!curriculum_id || !year_level_id || !semester_id || !course_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const progTagQuery = `
    INSERT INTO program_tagging_table 
    (curriculum_id, year_level_id, semester_id, course_id) 
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await db3.query(progTagQuery, [curriculum_id, year_level_id, semester_id, course_id]);
    res.status(200).json({ message: "Program tagged successfully", insertId: result.insertId });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Failed to tag program",
      details: err.message,
    });
  }
});

// YEAR TABLE (UPDATED!)
app.post("/years", async (req, res) => {
  const { year_description } = req.body;

  if (!year_description) {
    return res.status(400).json({ error: "year_description is required" });
  }

  const query = "INSERT INTO year_table (year_description, status) VALUES (?, 0)";

  try {
    const [result] = await db3.query(query, [year_description]);
    res.status(201).json({
      year_id: result.insertId,
      year_description,
      status: 0,
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({
      error: "Insert failed",
      details: err.message,
    });
  }
});

// YEAR LIST (UPDATED!)
app.get("/year_table", async (req, res) => {
  const query = "SELECT * FROM year_table";

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({
      error: "Query failed",
      details: err.message,
    });
  }
});

// UPDATE YEAR PANEL INFORMATION (UPDATED!)
app.put("/year_table/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    if (status === 1) {
      // Deactivate all other years first
      const deactivateQuery = "UPDATE year_table SET status = 0";
      await db3.query(deactivateQuery);

      // Activate the selected year
      const activateQuery = "UPDATE year_table SET status = 1 WHERE year_id = ?";
      await db3.query(activateQuery, [id]);

      res.status(200).json({ message: "Year status updated successfully" });
    } else {
      // Deactivate the selected year
      const updateQuery = "UPDATE year_table SET status = 0 WHERE year_id = ?";
      await db3.query(updateQuery, [id]);

      res.status(200).json({ message: "Year deactivated successfully" });
    }
  } catch (err) {
    console.error("Error updating year status:", err);
    res.status(500).json({
      error: "Failed to update year status",
      details: err.message,
    });
  }
});

// YEAR LEVEL PANEL (UPDATED!)
app.post("/years_level", async (req, res) => {
  const { year_level_description } = req.body;

  if (!year_level_description) {
    return res.status(400).json({ error: "year_level_description is required" });
  }

  const query = "INSERT INTO year_level_table (year_level_description) VALUES (?)";

  try {
    const [result] = await db3.query(query, [year_level_description]);
    res.status(201).json({
      year_level_id: result.insertId,
      year_level_description,
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed", details: err.message });
  }
});

// YEAR LEVEL TABLE (UPDATED!)
app.get("/get_year_level", async (req, res) => {
  const query = "SELECT * FROM year_level_table";

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Failed to retrieve year level data", details: err.message });
  }
});

// SEMESTER PANEL (UPDATED!)
app.post("/semesters", async (req, res) => {
  const { semester_description } = req.body;

  if (!semester_description) {
    return res.status(400).json({ error: "semester_description is required" });
  }

  const query = "INSERT INTO semester_table (semester_description) VALUES (?)";

  try {
    const [result] = await db3.query(query, [semester_description]);
    res.status(201).json({
      semester_id: result.insertId,
      semester_description,
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed", details: err.message });
  }
});

// SEMESTER TABLE (UPDATED!)
app.get("/get_semester", async (req, res) => {
  const query = "SELECT * FROM semester_table";

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Query failed", details: err.message });
  }
});

// GET SCHOOL YEAR (UPDATED!)
app.get("/school_years", async (req, res) => {
  const query = `
    SELECT sy.*, yt.year_description, s.semester_description 
    FROM active_school_year_table sy
    JOIN year_table yt ON sy.year_id = yt.year_id
    JOIN semester_table s ON sy.semester_id = s.semester_id
    ORDER BY yt.year_description

  `;

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch school years", details: err.message });
  }
});

// SCHOOL YEAR PANEL (UPDATED!)
app.post("/school_years", async (req, res) => {
  const { year_id, semester_id, activator } = req.body;

  if (!year_id || !semester_id) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // If activating a school year, deactivate all others first
    if (activator === 1) {
      const deactivateQuery = `UPDATE active_school_year_table SET astatus = 0`;
      await db3.query(deactivateQuery);
    }

    // Insert new school year record
    const insertQuery = `
      INSERT INTO active_school_year_table (year_id, semester_id, astatus, active)
      VALUES (?, ?, ?, 0)
    `;
    const [result] = await db3.query(insertQuery, [year_id, semester_id, activator]);

    res.status(201).json({ school_year_id: result.insertId });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to process the school year", details: err.message });
  }
});

// UPDATE SCHOOL YEAR INFORMATION (UPDATED!)
app.put("/school_years/:id", async (req, res) => {
  const { id } = req.params;
  const { activator } = req.body;

  try {
    if (parseInt(activator) === 1) {
      // First deactivate all, then activate the selected one
      const deactivateAllQuery = "UPDATE active_school_year_table SET astatus = 0";
      await db3.query(deactivateAllQuery);

      const activateQuery = "UPDATE active_school_year_table SET astatus = 1 WHERE id = ?";
      await db3.query(activateQuery, [id]);

      return res.status(200).json({ message: "School year activated and others deactivated" });
    } else {
      // Just deactivate the selected one
      const query = "UPDATE active_school_year_table SET astatus = 0 WHERE id = ?";
      await db3.query(query, [id]);

      return res.status(200).json({ message: "School year deactivated" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to update school year", details: err.message });
  }
});

// ROOM CREATION (UPDATED!)
app.post("/room", async (req, res) => {
  const { building_name, room_name } = req.body;

  if (!building_name || !room_name) {
    return res.status(400).send({ message: "Room name and building name are required" });
  }

  try {
    const insertQuery = `
      INSERT INTO room_table (building_description, room_description) 
      VALUES (?, ?)
    `;
    const [result] = await db3.query(insertQuery, [building_name, room_name]);

    res.status(200).send({
      message: "Room Successfully Created",
      result
    });
  } catch (error) {
    console.error("Error inserting room:", error);
    res.status(500).send(error);
  }
});


// UPDATE ROOM
app.put("/room/:id", async (req, res) => {
  const { id } = req.params;
  const { building_name, room_name } = req.body;

  if (!building_name || !room_name) {
    return res.status(400).send({ message: "Building name and room name are required" });
  }

  try {
    const updateQuery = `
      UPDATE room_table
      SET building_description = ?, room_description = ?
      WHERE room_id = ?
    `;
    const [result] = await db3.query(updateQuery, [building_name, room_name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Room not found" });
    }

    res.status(200).send({ message: "Room successfully updated" });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).send(error);
  }
});

// DELETE ROOM
app.delete("/room/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = `DELETE FROM room_table WHERE room_id = ?`;
    const [result] = await db3.query(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Room not found" });
    }

    res.status(200).send({ message: "Room successfully deleted" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).send(error);
  }
});


app.get("/room_list", async (req, res) => {
  try {
    const [results] = await db3.query(
      "SELECT room_id, building_description, room_description FROM room_table ORDER BY room_description ASC"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ROOM LIST (UPDATED!)
app.get("/get_room", async (req, res) => {
  const { department_id } = req.query;

  if (!department_id) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  const getRoomQuery = `
      SELECT r.room_id, r.room_description, d.dprtmnt_name
      FROM room_table r
      INNER JOIN dprtmnt_room_table drt ON r.room_id = drt.room_id
      INNER JOIN dprtmnt_table d ON drt.dprtmnt_id = d.dprtmnt_id
      WHERE drt.dprtmnt_id = ?
  `;

  try {
    const [result] = await db3.query(getRoomQuery, [department_id]);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms", details: err.message });
  }
});

// DEPARTMENT ROOM PANEL (UPDATED!)
app.get("/api/assignments", async (req, res) => {
  const query = `
    SELECT 
      drt.dprtmnt_room_id, 
      drt.room_id,  
      dt.dprtmnt_id, 
      dt.dprtmnt_name, 
      dt.dprtmnt_code, 
      rt.room_description
    FROM dprtmnt_room_table drt
    INNER JOIN dprtmnt_table dt ON drt.dprtmnt_id = dt.dprtmnt_id
    INNER JOIN room_table rt ON drt.room_id = rt.room_id
  `;

  try {
    const [results] = await db3.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ error: "Failed to fetch assignments", details: err.message });
  }
});

// POST ROOM DEPARTMENT (UPDATED!)
app.post("/api/assign", async (req, res) => {
  const { dprtmnt_id, room_id } = req.body;

  if (!dprtmnt_id || !room_id) {
    return res.status(400).json({ message: "Department and Room ID are required" });
  }

  try {
    // Check if the room is already assigned to the department
    const checkQuery = `
      SELECT * FROM dprtmnt_room_table 
      WHERE dprtmnt_id = ? AND room_id = ?
    `;
    const [checkResults] = await db3.query(checkQuery, [dprtmnt_id, room_id]);

    if (checkResults.length > 0) {
      return res.status(400).json({ message: "Room already assigned to this department" });
    }

    // Assign the room to the department
    const insertQuery = `
      INSERT INTO dprtmnt_room_table (dprtmnt_id, room_id)
      VALUES (?, ?)
    `;
    const [insertResult] = await db3.query(insertQuery, [dprtmnt_id, room_id]);

    return res.json({ message: "Room successfully assigned to department", insertId: insertResult.insertId });
  } catch (err) {
    console.error("Error assigning room:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.delete("/api/unassign/:dprtmnt_room_id", async (req, res) => {
  const { dprtmnt_room_id } = req.params;

  if (!dprtmnt_room_id) {
    return res.status(400).json({ message: "Assignment ID is required" });
  }

  try {
    const deleteQuery = `
      DELETE FROM dprtmnt_room_table WHERE dprtmnt_room_id = ?
    `;
    const [result] = await db3.query(deleteQuery, [dprtmnt_room_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room assignment not found" });
    }

    return res.json({ message: "Room successfully unassigned" });
  } catch (err) {
    console.error("Error unassigning room:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// SECTIONS (UPDATED!)
app.post("/section_table", async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const query = "INSERT INTO section_table (description) VALUES (?)";
    const [result] = await db3.query(query, [description]);
    res.status(201).json({ message: "Section created successfully", sectionId: result.insertId });
  } catch (err) {
    console.error("Error inserting section:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// SECTIONS LIST (UPDATED!)
app.get("/section_table", async (req, res) => {
  try {
    const query = "SELECT * FROM section_table";
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching sections:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// UPDATE SECTIONS (SUPERADMIN)

// DELETE SECTIONS (SUPERADMIN)

// DEPARTMENT SECTIONS (UPDATED!)
app.post("/department_section", async (req, res) => {
  const { curriculum_id, section_id } = req.body;

  if (!curriculum_id || !section_id) {
    return res.status(400).json({ error: "Curriculum ID and Section ID are required" });
  }

  try {
    const query = "INSERT INTO dprtmnt_section_table (curriculum_id, section_id, dsstat) VALUES (?, ?, 0)";
    const [result] = await db3.query(query, [curriculum_id, section_id]);

    res.status(201).json({ message: "Department section created successfully", sectionId: result.insertId });
  } catch (err) {
    console.error("Error inserting department section:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.get("/department_section", async (req, res) => {
  try {
    const query = `
      SELECT 
        pt.program_code,  
        yt.year_description,
        st.description AS section_description
      FROM dprtmnt_section_table dst
      INNER JOIN curriculum_table ct ON dst.curriculum_id = ct.curriculum_id
      INNER JOIN program_table pt ON ct.program_id = pt.program_id
      INNER JOIN year_table yt ON ct.year_id = yt.year_id
      INNER JOIN section_table st ON dst.section_id = st.id
    `;

    const [rows] = await db3.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch all professors
app.get("/api/professors", async (req, res) => {
  try {
    const [rows] = await db3.query(`
      SELECT 
        pft.prof_id,
        pft.person_id,
        pft.fname,
        pft.mname,
        pft.lname,
        pft.email,
        pft.role,
        pft.status, 
        pft.profile_image,
        MIN(dpt.dprtmnt_name) AS dprtmnt_name,
        MIN(dpt.dprtmnt_code) AS dprtmnt_code 
      FROM dprtmnt_profs_table AS dpft 
      INNER JOIN prof_table AS pft ON dpft.prof_id = pft.prof_id
      INNER JOIN dprtmnt_table AS dpt ON dpft.dprtmnt_id = dpt.dprtmnt_id
      GROUP BY pft.prof_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve professors", details: err.message });
  }
});



// ADD PROFESSOR ROUTE (Consistent with /api)
app.post("/api/register_prof", upload.single("profileImage"), async (req, res) => {
  try {
    const { person_id, fname, mname, lname, email, password, dprtmnt_id, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImage = null;
    if (req.file) {
      const year = new Date().getFullYear();
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${person_id}_ProfessorProfile_${year}${ext}`;
      const filePath = path.join(__dirname, "uploads", filename);
      await fs.promises.writeFile(filePath, req.file.buffer);
      profileImage = filename;
    }

    const sql = `INSERT INTO prof_table (person_id, fname, mname, lname, email, password, role, profile_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [person_id, fname, mname, lname, email, hashedPassword, role, profileImage];

    const [result] = await db3.query(sql, values);
    const prof_id = result.insertId;

    const sql2 = `INSERT INTO dprtmnt_profs_table (dprtmnt_id, prof_id) VALUES (?, ?)`;
    await db3.query(sql2, [dprtmnt_id, prof_id]);

    res.status(201).json({ message: "Professor added successfully" });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to add professor" });
  }
});


// Update professor info
app.put("/api/update_prof/:id", upload.single("profileImage"), async (req, res) => {
  const id = req.params.id;
  const { person_id, fname, mname, lname, email, password, dprtmnt_id, role } = req.body;

  try {
    const checkSQL = `SELECT * FROM prof_table WHERE email = ? AND prof_id != ?`;
    const [existingRows] = await db3.query(checkSQL, [email, id]);

    if (existingRows.length > 0) {
      return res.status(400).json({ error: "Email already exists for another professor." });
    }

    let profileImage = req.file ? req.file.filename : null;
    let updateSQL;
    let values;

    if (password && profileImage) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateSQL = `
        UPDATE prof_table 
        SET person_id = ?, fname = ?, mname = ?, lname = ?, email = ?, password = ?, role = ?, profile_image = ?
        WHERE prof_id = ?
      `;
      values = [person_id, fname, mname, lname, email, hashedPassword, role, profileImage, id];
    } else if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateSQL = `
        UPDATE prof_table 
        SET person_id = ?, fname = ?, mname = ?, lname = ?, email = ?, password = ?, role = ?
        WHERE prof_id = ?
      `;
      values = [person_id, fname, mname, lname, email, hashedPassword, role, id];
    } else if (profileImage) {
      updateSQL = `
        UPDATE prof_table 
        SET person_id = ?, fname = ?, mname = ?, lname = ?, email = ?, role = ?, profile_image = ?
        WHERE prof_id = ?
      `;
      values = [person_id, fname, mname, lname, email, role, profileImage, id];
    } else {
      updateSQL = `
        UPDATE prof_table 
        SET person_id = ?, fname = ?, mname = ?, lname = ?, email = ?, role = ?
        WHERE prof_id = ?
      `;
      values = [person_id, fname, mname, lname, email, role, id];
    }

    await db3.query(updateSQL, values);

    if (dprtmnt_id) {
      const [existing] = await db3.query(
        `SELECT * FROM dprtmnt_profs_table WHERE prof_id = ?`,
        [id]
      );

      if (existing.length > 0) {
        await db3.query(
          `UPDATE dprtmnt_profs_table SET dprtmnt_id = ? WHERE prof_id = ?`,
          [dprtmnt_id, id]
        );
      } else {
        await db3.query(
          `INSERT INTO dprtmnt_profs_table (dprtmnt_id, prof_id) VALUES (?, ?)`,
          [dprtmnt_id, id]
        );
      }
    }

    res.json({ success: true, message: "Professor updated successfully." });
  } catch (err) {
    console.error("Error updating professor:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});


// Toggle professor status (Active/Inactive)
app.put("/api/update_prof_status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await db3.query(
      "UPDATE prof_table SET status = ? WHERE prof_id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Professor not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


// GET ENROLLED STUDENTS (UPDATED!)
app.get("/get_enrolled_students/:subject_id/:department_section_id/:active_school_year_id", async (req, res) => {
  const { subject_id, department_section_id, active_school_year_id } = req.params;

  // Validate the inputs
  if (!subject_id || !department_section_id || !active_school_year_id) {
    return res.status(400).json({ message: "Subject ID, Department Section ID, and Active School Year ID are required." });
  }

  const filterStudents = `
  SELECT 
    person_table.*, 
    enrolled_subject.*, 
    time_table.*, 
    section_table.description AS section_description,
    program_table.program_description,
    program_table.program_code,
    year_level_table.year_level_description,
    semester_table.semester_description,
    course_table.course_code,
    course_table.course_description,
    room_day_table.description AS day_description,
    room_table.room_description
  FROM time_table
  INNER JOIN enrolled_subject
    ON time_table.course_id = enrolled_subject.course_id
    AND time_table.department_section_id = enrolled_subject.department_section_id
    AND time_table.school_year_id = enrolled_subject.active_school_year_id
  INNER JOIN student_numbering_table
    ON enrolled_subject.student_number = student_numbering_table.student_number
  INNER JOIN person_table
    ON student_numbering_table.person_id = person_table.person_id
  INNER JOIN dprtmnt_section_table
    ON time_table.department_section_id = dprtmnt_section_table.id
  INNER JOIN section_table
    ON dprtmnt_section_table.section_id = section_table.id
  INNER JOIN curriculum_table
    ON dprtmnt_section_table.curriculum_id = curriculum_table.curriculum_id
  INNER JOIN program_table
    ON curriculum_table.program_id = program_table.program_id
  INNER JOIN program_tagging_table
    ON program_tagging_table.course_id = time_table.course_id
    AND program_tagging_table.curriculum_id = dprtmnt_section_table.curriculum_id
  INNER JOIN year_level_table
    ON program_tagging_table.year_level_id = year_level_table.year_level_id
  INNER JOIN semester_table
    ON program_tagging_table.semester_id = semester_table.semester_id
  INNER JOIN course_table
    ON program_tagging_table.course_id = course_table.course_id
  INNER JOIN active_school_year_table
    ON time_table.school_year_id = active_school_year_table.id
  INNER JOIN room_day_table
    ON time_table.room_day = room_day_table.id
  INNER JOIN dprtmnt_room_table
    ON time_table.department_room_id = dprtmnt_room_table.dprtmnt_room_id
  INNER JOIN room_table
    ON dprtmnt_room_table.room_id = room_table.room_id
  WHERE time_table.course_id = ? 
    AND time_table.department_section_id = ? 
    AND time_table.school_year_id = ?
    AND active_school_year_table.astatus = 1;
    
`;

  try {
    // Execute the query using promise-based `execute` method
    const [result] = await db3.execute(filterStudents, [subject_id, department_section_id, active_school_year_id]);

    // Check if no students were found
    if (result.length === 0) {
      return res.status(404).json({ message: "No students found for this subject-section combination." });
    }

    // Send the response with the result
    res.json({
      totalStudents: result.length,
      students: result,
    });
  } catch (err) {
    console.error("Query failed:", err);
    return res.status(500).json({ message: "Server error while fetching students." });
  }
});

app.get("/get_subject_info/:subject_id/:department_section_id/:active_school_year_id", async (req, res) => {
  const { subject_id, department_section_id, active_school_year_id } = req.params;

  if (!subject_id || !department_section_id || !active_school_year_id) {
    return res.status(400).json({ message: "Subject ID, Department Section ID, and School Year ID are required." });
  }

  const sectionInfoQuery = `
  SELECT 
    section_table.description AS section_description,
    course_table.course_code,
    course_table.course_description,
    year_level_table.year_level_description AS year_level_description,
    year_level_table.year_level_id,
    semester_table.semester_description,
    room_table.room_description,
    time_table.school_time_start,
    time_table.school_time_end,
    program_table.program_code,
    program_table.program_description,
    room_day_table.description AS day_description
  FROM time_table
  INNER JOIN dprtmnt_section_table
    ON time_table.department_section_id = dprtmnt_section_table.id
  INNER JOIN section_table
    ON dprtmnt_section_table.section_id = section_table.id
  LEFT JOIN curriculum_table
    ON dprtmnt_section_table.curriculum_id = curriculum_table.curriculum_id
  LEFT JOIN program_table
    ON curriculum_table.program_id = program_table.program_id
  INNER JOIN course_table
    ON time_table.course_id = course_table.course_id
  LEFT JOIN program_tagging_table
    ON program_tagging_table.course_id = time_table.course_id
  LEFT JOIN year_level_table
    ON program_tagging_table.year_level_id = year_level_table.year_level_id
  LEFT JOIN semester_table
    ON program_tagging_table.semester_id = semester_table.semester_id
  LEFT JOIN room_day_table
    ON time_table.room_day = room_day_table.id
  LEFT JOIN dprtmnt_room_table
    ON time_table.department_room_id = dprtmnt_room_table.dprtmnt_room_id
  LEFT JOIN room_table
    ON dprtmnt_room_table.room_id = room_table.room_id
  WHERE time_table.course_id = ?
    AND time_table.department_section_id = ?
    AND time_table.school_year_id = ?
  LIMIT 1;
`;

  try {
    const [result] = await db3.execute(sectionInfoQuery, [subject_id, department_section_id, active_school_year_id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No section information found for this mapping." });
    }

    res.json({ sectionInfo: result[0] });
  } catch (err) {
    console.error("Section info query error:", err);
    res.status(500).json({ message: "Server error while fetching section info." });
  }
});

app.get('/get_class_details/:selectedActiveSchoolYear/:profID', async (req, res) => {
  const { selectedActiveSchoolYear, profID } = req.params;
  try {
    const query = `
    SELECT 
        cst.course_id, 
        cst.course_description, 
        cst.course_code, 
        pt.program_code, 
        st.description AS section_description,
        rt.room_description,
        tt.school_time_start,
        tt.school_time_end,
        rdt.description AS day,
        tt.department_section_id,
        tt.school_year_id,
        COUNT(DISTINCT es.student_number) AS enrolled_students
      FROM time_table AS tt
        INNER JOIN course_table AS cst ON tt.course_id = cst.course_id
        INNER JOIN dprtmnt_section_table AS dst ON tt.department_section_id = dst.id
        INNER JOIN curriculum_table AS ct ON dst.curriculum_id = ct.curriculum_id
        INNER JOIN section_table AS st ON dst.section_id = st.id
        INNER JOIN program_table AS pt ON ct.program_id = pt.program_id
        INNER JOIN dprtmnt_room_table AS drt ON drt.dprtmnt_room_id = tt.department_room_id
        INNER JOIN room_table AS rt ON drt.room_id = rt.room_id
        INNER JOIN room_day_table AS rdt ON tt.room_day = rdt.id
        LEFT JOIN enrolled_subject AS es ON es.course_id = tt.course_id
          AND es.active_school_year_id = tt.school_year_id
          AND es.department_section_id = tt.department_section_id
        WHERE tt.school_year_id = ? AND tt.professor_id = ?
      GROUP BY cst.course_id, cst.course_description, cst.course_code, pt.program_code, st.description;
    `;
    const [result] = await db3.query(query, [selectedActiveSchoolYear, profID]);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.get('/get_student_list/:course_id/:department_section_id/:school_year_id', async (req, res) => {
  const { course_id, department_section_id, school_year_id } = req.params;
  try {
    const query = `
    SELECT es.id as enrolled_id,snt.student_number,pst.first_name, pst.middle_name, pst.last_name, pt.program_code, st.description AS section_description, ct.course_description, ct.course_code FROM enrolled_subject AS es
      INNER JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
      INNER JOIN person_table AS pst ON snt.person_id = pst.person_id
      INNER JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
      INNER JOIN program_table AS pt ON cct.program_id = pt.program_id
      INNER JOIN course_table AS ct ON es.course_id = ct.course_id
      INNER JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
    WHERE es.course_id = ? AND es.department_section_id = ? AND es.active_school_year_id = ?
    `;
    const [result] = await db3.query(query, [course_id, department_section_id, school_year_id]);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

// PROFESSOR LIST (UPDATED!)
app.get("/get_prof", async (req, res) => {
  const { department_id } = req.query;

  // Validate the input
  if (!department_id) {
    return res.status(400).json({ message: "Department ID is required." });
  }

  const getProfQuery = `
  SELECT p.*, d.dprtmnt_name
  FROM prof_table p
  INNER JOIN dprtmnt_profs_table dpt ON p.prof_id = dpt.prof_id
  INNER JOIN dprtmnt_table d ON dpt.dprtmnt_id = d.dprtmnt_id
  WHERE dpt.dprtmnt_id = ?
  `;

  try {
    // Execute the query using promise-based `execute` method
    const [result] = await db3.execute(getProfQuery, [department_id]);

    // Send the response with the result
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching professors:", err);
    return res.status(500).json({ message: "Server error while fetching professors." });
  }
});

// prof filter
app.get("/prof_list/:dprtmnt_id", async (req, res) => {
  const { dprtmnt_id } = req.params;

  try {
    const query = `SELECT pt.* FROM dprtmnt_profs_table as dpt
                  INNER JOIN prof_table as pt 
                  ON dpt.prof_id = pt.prof_id
                  INNER JOIN dprtmnt_table as dt
                  ON dt.dprtmnt_id = dpt.dprtmnt_id
                  WHERE dpt.dprtmnt_id = ? `;
    const [results] = await db3.query(query, [dprtmnt_id]);
    res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get("/room_list/:dprtmnt_id", async (req, res) => {
  const { dprtmnt_id } = req.params;

  try {
    const query = `SELECT rt.* FROM dprtmnt_room_table as drt
                  INNER JOIN room_table as rt 
                  ON drt.room_id = rt.room_id
                  INNER JOIN dprtmnt_table as dt
                  ON dt.dprtmnt_id = drt.dprtmnt_id
                  WHERE drt.dprtmnt_id = ? `;
    const [results] = await db3.query(query, [dprtmnt_id]);
    res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


app.get("/schedule-plotting/day_list", async (req, res) => {
  try {
    const query = "SELECT rdt.id AS day_id, rdt.description AS day_description FROM room_day_table AS rdt";
    const [result] = await db3.query(query);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.delete("/api/delete/schedule/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = `DELETE FROM time_table WHERE id = ?`;
    const [result] = await db3.execute(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found." });
    }

    res.json({ message: "Schedule deleted successfully." });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: "Database error while deleting schedule." });
  }
});

//SCHEDULE CHECKER
app.post("/api/check-subject", async (req, res) => {
  const { section_id, school_year_id, subject_id, day_of_week } = req.body;

  if (!section_id || !school_year_id || !subject_id || !day_of_week) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    SELECT * FROM time_table 
    WHERE department_section_id = ? 
      AND school_year_id = ? 
      AND course_id = ?
      AND room_day = ?
  `;

  try {
    const [result] = await db3.query(query, [section_id, school_year_id, subject_id, day_of_week]);

    if (result.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//HELPER FUNCTION 
function timeToMinutes(timeStr) {
  const parts = timeStr.trim().split(" ");
  let [hours, minutes] = parts[0].split(":").map(Number);
  const modifier = parts[1] ? parts[1].toUpperCase() : null;

  if (modifier) {
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
}

//CHECK CONFLICT
app.post("/api/check-conflict", async (req, res) => {
  const { day, start_time, end_time, section_id, school_year_id, prof_id, room_id, subject_id } = req.body;

  try {
    const start_time_m = timeToMinutes(start_time);
    const end_time_m = timeToMinutes(end_time);

    const countQuery = `
      SELECT COUNT(*) AS subject_count 
      FROM time_table 
      WHERE department_section_id = ? 
        AND school_year_id = ? 
        AND professor_id = ?
        AND department_room_id = ?
        AND course_id = ?
    `;
    const [countResult] = await db3.query(countQuery, [
      section_id, school_year_id, prof_id, room_id, subject_id
    ]);

    if (countResult[0].subject_count >= 2) {
      return res.status(409).json({
        conflict: true,
        message: "This subject is already assigned twice for the same section, room, school year, and professor."
      });
    }

    const query = `
      SELECT * FROM time_table 
      WHERE department_section_id = ? 
        AND school_year_id = ? 
        AND course_id = ?
        AND room_day = ?
    `;

    const [subjectResult] = await db3.query(query, [section_id, school_year_id, subject_id, day]);

    if (subjectResult.length > 0) {
      return res.status(409).json({
        conflict: true,
        message: "This subject is already assigned in this section and school year on the same day."
      });
    }

    // Check for time conflicts (prof, section, room)
    const checkTimeQuery = `
      SELECT * FROM time_table
      WHERE room_day = ?
        AND school_year_id = ?
        AND (professor_id = ? OR department_section_id = ? OR department_room_id = ?)
        AND (
          (? > TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60
          AND ? < TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60)
          OR
          (? > TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60
          AND ? < TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60)
          OR
          (TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60 > ?
          AND TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60 < ?)
          OR
          (TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60 > ?
          AND TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60 < ?)
          OR
          (TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60 = ?
          AND TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60 = ?)
        )
    `;

    const [timeResult] = await db3.query(checkTimeQuery, [
      day, school_year_id, prof_id, section_id, room_id,
      start_time_m, start_time_m, end_time_m, end_time_m,
      start_time_m, end_time_m, start_time_m, end_time_m,
      start_time_m, end_time_m
    ]);

    if (timeResult.length > 0) {
      return res.status(409).json({
        conflict: true,
        message: "Schedule conflict detected! Please choose a different time."
      });
    }

    return res.status(200).json({ conflict: false, message: "Schedule is available." });
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Check conflict API
app.post("/api/check-time", async (req, res) => {
  const { start_time, end_time } = req.body;

  try {
    let startMinutes = timeToMinutes(start_time);
    let endMinutes = timeToMinutes(end_time);
    const earliest = timeToMinutes("7:00 AM");
    const latest = timeToMinutes("9:00 PM");

    console.log({
      start_time, end_time, startMinutes, endMinutes, earliest, latest
    });

    if (endMinutes <= startMinutes) {
      return res.status(409).json({
        conflict: true,
        message: "End time must be later than start time (same day only)."
      });
    }

    // ✅ Check validity
    if (startMinutes < earliest || endMinutes > latest) {
      return res.status(409).json({
        conflict: true,
        message: "Time must be between 7:00 AM and 9:00 PM (same day)."
      });
    }

    return res.status(200).json({
      conflict: false,
      message: "Valid schedule time"
    });
  } catch (err) {
    console.error("Error checking conflict:", err);
    return res.status(500).json({ error: "Server error while checking conflict" });
  }
});

// ✅ Insert schedule API
app.post("/api/insert-schedule", async (req, res) => {
  const { day, start_time, end_time, section_id, subject_id, prof_id, room_id, school_year_id } = req.body;

  if (!day || !start_time || !end_time || !section_id || !school_year_id || !prof_id || !room_id || !subject_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let startMinutes = timeToMinutes(start_time);
  let endMinutes = timeToMinutes(end_time);
  const earliest = timeToMinutes("7:00 AM");
  const latest = timeToMinutes("9:00 PM");

  // Validate times
  if (endMinutes <= startMinutes) {
    return res.status(409).json({
      conflict: true,
      message: "End time must be later than start time (same day only)."
    });
  }

  if (startMinutes < earliest || endMinutes > latest) {
    return res.status(409).json({
      conflict: true,
      message: "Time must be between 7:00 AM and 9:00 PM (same day)."
    });
  }

  try {
    const query = `
      SELECT * FROM time_table 
      WHERE department_section_id = ? 
        AND school_year_id = ? 
        AND course_id = ?
        AND room_day = ?
    `;

    const [subjectResult] = await db3.query(query, [section_id, school_year_id, subject_id, day]);

    if (subjectResult.length > 0) {
      return res.status(409).json({
        conflict: true,
        message: "This subject is already assigned in this section and school year on the same day."
      });
    }

    // Check for time conflicts (prof, section, room)
    const checkTimeQuery = `
      SELECT * FROM time_table
      WHERE room_day = ?
        AND school_year_id = ?
        AND (professor_id = ? OR department_section_id = ? OR department_room_id = ?)
        AND (
          (? > TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60
          AND ? < TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60)
          OR
          (? > TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60
          AND ? < TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60)
          OR
          (TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60 > ?
          AND TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60 < ?)
          OR
          (TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60 > ?
          AND TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60 < ?)
          OR
          (TIME_TO_SEC(STR_TO_DATE(school_time_start, '%l:%i %p'))/60 = ?
          AND TIME_TO_SEC(STR_TO_DATE(school_time_end, '%l:%i %p'))/60 = ?)
        )
    `;

    const [timeResult] = await db3.query(checkTimeQuery, [
      day, school_year_id, prof_id, section_id, room_id,
      startMinutes, startMinutes, endMinutes, endMinutes,
      startMinutes, endMinutes, startMinutes, endMinutes,
      startMinutes, endMinutes
    ]);

    if (timeResult.length > 0) {
      return res.status(409).json({
        conflict: true,
        message: "Schedule conflict detected! Please choose a different time."
      });
    }

    // Insert schedule
    const insertQuery = `
      INSERT INTO time_table 
      (room_day, school_time_start, school_time_end, department_section_id, course_id, professor_id, department_room_id, school_year_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db3.query(insertQuery, [day, start_time, end_time, section_id, subject_id, prof_id, room_id, school_year_id]);

    res.status(200).json({ message: "Schedule inserted successfully" });

  } catch (error) {
    console.error("Error inserting schedule:", error);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// GET STUDENTS THAT HAVE NO STUDENT NUMBER (UPDATED!)
app.get("/api/persons", async (req, res) => {
  try {
    // STEP 1: Get all eligible persons (from ENROLLMENT DB)
    const [persons] = await db.execute(`
      SELECT p.* 
      FROM admission.person_table p
      JOIN admission.person_status_table ps ON p.person_id = ps.person_id
      WHERE ps.student_registration_status = 0
      AND p.person_id NOT IN (SELECT person_id FROM enrollment.student_numbering_table)
    `);

    if (persons.length === 0) return res.json([]);

    const personIds = persons.map(p => p.person_id);

    // STEP 2: Get all applicant numbers for those person_ids (from ADMISSION DB)
    const [applicantNumbers] = await db.query(`
      SELECT applicant_number, person_id 
      FROM applicant_numbering_table 
      WHERE person_id IN (?)
    `, [personIds]);

    // Create a quick lookup map
    const applicantMap = {};
    for (let row of applicantNumbers) {
      applicantMap[row.person_id] = row.applicant_number;
    }

    // STEP 3: Merge applicant_number into each person object
    const merged = persons.map(person => ({
      ...person,
      applicant_number: applicantMap[person.person_id] || null
    }));

    res.json(merged);

  } catch (err) {
    console.error("❌ Error merging person + applicant ID:", err);
    res.status(500).send("Server error");
  }
});

// GET total number of accepted students
app.get("/api/accepted-students-count", async (req, res) => {
  try {
    const [rows] = await db3.execute(`
      SELECT COUNT(*) AS total
      FROM person_table p
      JOIN person_status_table ps ON p.person_id = ps.person_id
      WHERE ps.student_registration_status = 1
    `);

    res.json(rows[0]); // { total: 25 }
  } catch (err) {
    console.error("Error fetching accepted students count:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// ASSIGN A STUDENT NUMBER TO THAT STUDENT (UPDATED!)
app.post("/api/assign-student-number", async (req, res) => {
  const connection = await db3.getConnection();

  try {
    const { person_id } = req.body;

    if (!person_id) {
      return res.status(400).send("person_id is required");
    }

    await connection.beginTransaction();

    // Get active year
    const [yearRows] = await connection.query("SELECT * FROM year_table WHERE status = 1 LIMIT 1");
    if (yearRows.length === 0) {
      await connection.rollback();
      return res.status(400).send("No active year found");
    }
    const year = yearRows[0];

    // Get counter
    const [counterRows] = await connection.query("SELECT * FROM student_counter WHERE id = 1");
    if (counterRows.length === 0) {
      await connection.rollback();
      return res.status(400).send("No counter found");
    }
    let que_number = counterRows[0].que_number;

    // Fix: if que_number is 0, still generate '00001'
    que_number = que_number + 1;

    let numberStr = que_number.toString();
    while (numberStr.length < 5) {
      numberStr = "0" + numberStr;
    }
    const student_number = `${year.year_description}${numberStr}`;

    // Check if already assigned
    const [existingRows] = await connection.query("SELECT * FROM student_numbering_table WHERE person_id = ?", [person_id]);
    if (existingRows.length > 0) {
      await connection.rollback();
      return res.status(400).send("Student number already assigned.");
    }

    // Insert into student_numbering
    await connection.query("INSERT INTO student_numbering_table (student_number, person_id) VALUES (?, ?)", [student_number, person_id]);

    // Update counter
    await connection.query("UPDATE student_counter SET que_number = ?", [que_number]);

    // Update person_status_table
    await connection.query("UPDATE person_status_table SET student_registration_status = 1 WHERE person_id = ?", [person_id]);

    const [activeSchoolYearRows] = await connection.query("SELECT * FROM active_school_year_table WHERE astatus = 1");
    if (activeSchoolYearRows.length === 0) {
      await connection.rollback();
      return res.status(400).send("No active school year found");
    }

    const activeSchoolYear = activeSchoolYearRows[0];

    await connection.query("INSERT INTO student_status_table (student_number, active_curriculum, enrolled_status, year_level_id, active_school_year_id, control_status) VALUES (?, ?, ?, ?, ?, ?)", [student_number, 0, 0, 0, activeSchoolYear.id, 0]);
    await connection.commit();
    res.json({ student_number });
  } catch (err) {
    await connection.rollback();
    console.error("Server error:", err);
    res.status(500).send("Server error");
  } finally {
    connection.release(); // Release the connection back to the pool
  }
});


// Corrected route with parameter (UPDATED!)
app.get("/courses/:currId", async (req, res) => {
  const { currId } = req.params;

  const sql = `
    SELECT 
      ctt.program_tagging_id,
      ctt.curriculum_id,
      ctt.course_id,
      ctt.year_level_id,
      ctt.semester_id,
      s.course_code,
      s.course_description
    FROM program_tagging_table AS ctt
    INNER JOIN course_table AS s ON s.course_id = ctt.course_id

    WHERE ctt.curriculum_id = ?
    ORDER BY s.course_id ASC
  `;

  try {
    const [result] = await db3.query(sql, [currId]);
    res.json(result);
  } catch (err) {
    console.error("Error in /courses:", err);
    console.log(currId, "hello world");
    return res.status(500).json({ error: err.message });
  }
});

//(UPDATED!)

app.get("/enrolled_courses/:userId/:currId", async (req, res) => {
  const { userId, currId } = req.params;

  try {
    // Step 1: Get the active_school_year_id
    const activeYearSql = `SELECT id FROM active_school_year_table WHERE astatus = 1 LIMIT 1`;
    const [yearResult] = await db3.query(activeYearSql);

    if (yearResult.length === 0) {
      return res.status(404).json({ error: "No active school year found" });
    }

    const activeSchoolYearId = yearResult[0].id;

    const sql = `
    SELECT 
      es.id,
      es.course_id,
      c.course_code,
      c.course_description,
      st.description,
      c.course_unit,
      c.lab_unit,
      ds.id AS department_section_id,
      IFNULL(pt.program_code, 'NOT') AS program_code,
      IFNULL(pt.program_description, 'CURRENTLY') AS program_description,
      IFNULL(st.description, 'ENROLLED') AS section,
      IFNULL(rd.description, 'TBA') AS day_description,
      IFNULL(tt.school_time_start, 'TBA') AS school_time_start,
      IFNULL(tt.school_time_end, 'TBA') AS school_time_end,
      IFNULL(rtbl.room_description, 'TBA') AS room_description,
      IFNULL(prof_table.lname, 'TBA') AS lname,

      (
        SELECT COUNT(*) 
        FROM enrolled_subject es2 
        WHERE es2.active_school_year_id = es.active_school_year_id 
          AND es2.department_section_id = es.department_section_id
          AND es2.course_id = es.course_id
      ) AS number_of_enrolled

    FROM enrolled_subject AS es
    INNER JOIN course_table AS c
      ON c.course_id = es.course_id
    INNER JOIN dprtmnt_section_table AS ds
      ON ds.id = es.department_section_id
    INNER JOIN section_table AS st
      ON st.id = ds.section_id
    INNER JOIN curriculum_table AS cr
      ON cr.curriculum_id = ds.curriculum_id
    INNER JOIN program_table AS pt
      ON pt.program_id = cr.program_id
    LEFT JOIN time_table AS tt
      ON tt.school_year_id = es.active_school_year_id 
      AND tt.department_section_id = es.department_section_id 
      AND tt.course_id = es.course_id 
    LEFT JOIN room_day_table AS rd
      ON rd.id = tt.room_day
    LEFT JOIN dprtmnt_room_table as dr
      ON dr.dprtmnt_room_id = tt.department_room_id
    LEFT JOIN room_table as rtbl
      ON rtbl.room_id = dr.room_id
    LEFT JOIN prof_table 
      ON prof_table.prof_id = tt.professor_id
    WHERE es.student_number = ? 
      AND es.active_school_year_id = ?
      AND es.curriculum_id = ?
    ORDER BY c.course_id ASC;
    `;

    const [result] = await db3.query(sql, [userId, activeSchoolYearId, currId]);
    res.json(result);
  } catch (err) {
    console.error("Error in /enrolled_courses:", err);
    return res.status(500).json({ error: err.message });
  }
});


//(UPDATED!)
app.post("/add-all-to-enrolled-courses", async (req, res) => {
  const { subject_id, user_id, curriculumID, departmentSectionID } = req.body;
  console.log("Received request:", { subject_id, user_id, curriculumID, departmentSectionID });

  try {
    const activeYearSql = `SELECT id, semester_id FROM active_school_year_table WHERE astatus = 1 LIMIT 1`;
    const [yearResult] = await db3.query(activeYearSql);

    if (yearResult.length === 0) {
      return res.status(404).json({ error: "No active school year found" });
    }

    const activeSchoolYearId = yearResult[0].id;
    const activeSemesterId = yearResult[0].semester_id;
    console.log("Active semester ID:", activeSemesterId);

    const checkSql = `
      SELECT year_level_id, semester_id, curriculum_id 
      FROM program_tagging_table 
      WHERE course_id = ? AND curriculum_id = ? 
      LIMIT 1
    `;

    const [checkResult] = await db3.query(checkSql, [subject_id, curriculumID]);

    if (!checkResult.length) {
      console.warn(`Subject ${subject_id} not found in tagging table`);
      return res.status(404).json({ message: "Subject not found" });
    }

    const { year_level_id, semester_id, curriculum_id } = checkResult[0];
    console.log("Year level found:", year_level_id);
    console.log("Subject semester:", semester_id);
    console.log("Active semester:", activeSemesterId);
    console.log("Curriculum found:", curriculum_id);

    if (year_level_id !== 1 || semester_id !== activeSemesterId || curriculum_id !== curriculumID) {
      console.log(`Skipping subject ${subject_id} (not Year 1, not active semester ${activeSemesterId}, or wrong curriculum)`);
      return res.status(200).json({ message: "Skipped - Not Year 1 / Not Active Semester / Wrong Curriculum" });
    }

    const checkDuplicateSql = `
      SELECT * FROM enrolled_subject 
      WHERE course_id = ? AND student_number = ? AND active_school_year_id = ?
    `;

    const [dupResult] = await db3.query(checkDuplicateSql, [subject_id, user_id, activeSchoolYearId]);

    if (dupResult.length > 0) {
      console.log(`Skipping subject ${subject_id}, already enrolled for student ${user_id}`);
      return res.status(200).json({ message: "Skipped - Already Enrolled" });
    }

    const insertSql = `
      INSERT INTO enrolled_subject (course_id, student_number, active_school_year_id, curriculum_id, department_section_id, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db3.query(insertSql, [subject_id, user_id, activeSchoolYearId, curriculumID, departmentSectionID, 1]);
    console.log(`Student ${user_id} successfully enrolled in subject ${subject_id}`);

    const updateStatusSql = `
      UPDATE student_status_table 
      SET enrolled_status = 1, active_curriculum = ?, year_level_id = ?
      WHERE student_number = ?
    `;

    await db3.query(updateStatusSql, [curriculumID, year_level_id, user_id]);

    const [getStudentNUmber] = await db3.query(`
      SELECT id, person_id FROM student_numbering_table WHERE student_number = ?
    `, [user_id]);

    if (getStudentNUmber.length === 0) {
      console.log('Student number not found');
    }

    const student_numbering_id = getStudentNUmber[0].id;
    const person_id = getStudentNUmber[0].person_id;

    const [getDepartmentID] = await db3.query(`
      SELECT dprtmnt_id FROM dprtmnt_curriculum_table WHERE curriculum_id = ?
    `, [curriculumID])

    if (getDepartmentID.length === 0) {
      console.log('Department ID not found');
    }

    const department_id = getDepartmentID[0].dprtmnt_id;

    const [checkExistingCurriculum] = await db3.query(
      `
      SELECT * FROM student_curriculum_table 
      WHERE student_numbering_id = ? AND curriculum_id = ?
      `,
      [student_numbering_id, curriculum_id]
    );

    await db3.query(
      `
        UPDATE user_accounts SET dprtmnt_id = ? WHERE person_id = ?
      `, [department_id, person_id]
    );

    if (checkExistingCurriculum.length === 0) {
      await db3.query(
        `
        INSERT INTO student_curriculum_table (student_numbering_id, curriculum_id) 
        VALUES (?, ?)
        `,
        [student_numbering_id, curriculum_id]
      );
    } else {
      console.log(`⚠️ Curriculum ${curriculum_id} already exists for student ${user_id}`);
    }

    res.status(200).json({ message: "Course enrolled successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

//(UPDATED!)
app.post("/add-to-enrolled-courses/:userId/:currId/", async (req, res) => {
  const { subject_id, department_section_id } = req.body;
  const { userId, currId } = req.params;

  try {
    const activeYearSql = `SELECT id FROM active_school_year_table WHERE astatus = 1 LIMIT 1`;
    const [yearResult] = await db3.query(activeYearSql);

    if (yearResult.length === 0) {
      return res.status(404).json({ error: "No active school year found" });
    }

    const activeSchoolYearId = yearResult[0].id;

    const sql = "INSERT INTO enrolled_subject (course_id, student_number, active_school_year_id, curriculum_id, department_section_id) VALUES (?, ?, ?, ?, ?)";
    await db3.query(sql, [subject_id, userId, activeSchoolYearId, currId, department_section_id]);

    const [getStudentNUmber] = await db3.query(`
      SELECT id FROM student_numbering_table WHERE student_number = ?
    `, [userId]);

    if (getStudentNUmber.length === 0) {
      throw new Error('Student number not found');
    }

    const student_numbering_id = getStudentNUmber[0].id;

    const [checkExistingCurriculum] = await db3.query(
      `
      SELECT * FROM student_curriculum_table 
      WHERE student_numbering_id = ? AND curriculum_id = ?
      `,
      [student_numbering_id, currId]
    );

    if (checkExistingCurriculum.length === 0) {
      await db3.query(
        `
        INSERT INTO student_curriculum_table (student_numbering_id, curriculum_id) 
        VALUES (?, ?)
        `,
        [student_numbering_id, currId]
      );
    } else {
      console.log(`⚠️ Curriculum ${currId} already exists for student ${userId}`);
    }

    res.json({ message: "Course enrolled successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Delete a single selected subject + its evaluations
app.delete("/courses/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 3. Delete the enrolled subject itself
    const sql = "DELETE FROM enrolled_subject WHERE id = ?";
    await db3.query(sql, [id]);

    res.json({ message: "Course and related evaluations removed successfully" });
  } catch (err) {
    console.error("Error deleting subject:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Delete all courses for user (UPDATED!)
app.delete("/courses/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const activeYearSql = `SELECT id FROM active_school_year_table WHERE astatus = 1 LIMIT 1`;
    const [yearResult] = await db3.query(activeYearSql);

    if (yearResult.length === 0) {
      return res.status(404).json({ error: "No active school year found" });
    }

    const activeSchoolYearId = yearResult[0].id;

    const sql = "DELETE FROM enrolled_subject WHERE student_number = ? AND active_school_year_id = ?";
    await db3.query(sql, [userId, activeSchoolYearId]);

    res.json({ message: "All courses unenrolled successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});


// Login User (UPDATED!)

app.post("/student-tagging", async (req, res) => {
  const { studentNumber } = req.body;

  if (!studentNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const sql = `
    SELECT 
        ss.id AS student_status_id, 
        ptbl.person_id,
        ss.student_number,
        st.description AS section_description,
        ss.active_curriculum,
        pt.program_id,
        pt.major,
        pt.program_description,
        pt.program_code,
        ylt.year_level_id,
        ylt.year_level_description,
        yt.year_description,
        ptbl.first_name,
        ptbl.middle_name,
        ptbl.last_name,
        ptbl.age,
        ptbl.gender,
        ptbl.emailAddress,
        ptbl.program,
        ptbl.profile_img,
        ptbl.extension,
        dt.dprtmnt_name,
        es.status AS enrolled_status
    FROM student_status_table AS ss 
    LEFT JOIN curriculum_table AS c ON c.curriculum_id = ss.active_curriculum 
    LEFT JOIN program_table AS pt ON c.program_id = pt.program_id 
    LEFT JOIN year_table AS yt ON c.year_id = yt.year_id 
    INNER JOIN student_numbering_table AS sn ON sn.student_number = ss.student_number 
    INNER JOIN person_table AS ptbl ON ptbl.person_id = sn.person_id 
    LEFT JOIN year_level_table AS ylt ON ss.year_level_id = ylt.year_level_id 
    LEFT JOIN enrolled_subject AS es ON ss.student_number = es.student_number 
    LEFT JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
    LEFT JOIN dprtmnt_curriculum_table AS dct ON c.curriculum_id = dct.curriculum_id
    LEFT JOIN dprtmnt_table AS dt ON dct.dprtmnt_id = dt.dprtmnt_id
    LEFT JOIN section_table AS st ON dst.section_id = st.id 
    WHERE ss.student_number = ?
    `;

    const [results] = await db3.query(sql, [studentNumber]);

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid Student Number" });
    }

    const student = results[0];

    console.log(student)
    const isEnrolled = student.enrolled_status === 1;

    const token = webtoken.sign(
      {
        id: student.student_status_id,
        person_id: student.person_id,
        studentNumber: student.student_number,
        section: student.section_description,
        activeCurriculum: student.active_curriculum,
        major: student.major,
        yearLevel: student.year_level_id,
        yearLevelDescription: student.year_level_description,
        courseCode: isEnrolled ? student.program_code : "Not",
        courseDescription: isEnrolled ? student.program_description : "Enrolled",
        departmentName: student.dprtmnt_name,
        yearDesc: student.year_description,
        firstName: student.first_name,
        middleName: student.middle_name,
        lastName: student.last_name,
        age: student.age,
        gender: student.gender,
        email: student.emailAddress,
        program: student.program,
        profile_img: student.profile_img,
        extension: student.extension,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Search response:", {
      token,
      studentNumber: student.student_number,
      person_id: student.person_id,
      activeCurriculum: student.active_curriculum,
      section: student.section_description,
      major: student.major,
      yearLevel: student.year_level_id,
      yearLevelDescription: student.year_level_description,
      courseCode: student.program_code,
      courseDescription: student.program_description,
      departmentName: student.dprtmnt_name,
      yearDesc: student.year_description,
      firstName: student.first_name,
      middleName: student.middle_name,
      lastName: student.last_name,
      age: student.age,
      gender: student.gender,
      email: student.emailAddress,
      program: student.program,
      profile_img: student.profile_img,
      extension: student.extension,
    });

    res.json({
      message: "Search successful",
      token,
      studentNumber: student.student_number,
      person_id: student.person_id,
      section: student.section_description,
      activeCurriculum: student.active_curriculum,
      major: student.major,
      yearLevel: student.year_level_id,
      yearLevelDescription: student.year_level_description,
      courseCode: isEnrolled ? student.program_code : "Not",
      courseDescription: isEnrolled ? student.program_description : "Enrolled",
      departmentName: student.dprtmnt_name,
      yearDesc: student.year_description,
      firstName: student.first_name,
      middleName: student.middle_name,
      lastName: student.last_name,
      age: student.age,
      gender: student.gender,
      email: student.emailAddress,
      program: student.program,
      profile_img: student.profile_img,
      extension: student.extension,
    });
  } catch (err) {
    console.error("SQL error:", err);
    return res.status(500).json({ message: "Database error" });
  }
});

let lastSeenId = 0;

// ✅ Updates year_level_id for a student
app.put("/api/update-student-year", async (req, res) => {
  const { student_number, year_level_id } = req.body;

  if (!student_number || !year_level_id) {
    return res.status(400).json({ error: "Missing student_number or year_level_id" });
  }

  try {
    const sql = `UPDATE student_status_table SET year_level_id = ? WHERE student_number = ?`;
    const [result] = await db3.query(sql, [year_level_id, student_number]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Year level updated successfully" });
  } catch (err) {
    console.error("Error updating year level:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// (UPDATED!)
app.get("/check-new", async (req, res) => {
  try {
    const [results] = await db3.query("SELECT * FROM enrolled_subject ORDER BY id DESC LIMIT 1");

    if (results.length > 0) {
      const latest = results[0];
      const isNew = latest.id > lastSeenId;
      if (isNew) {
        lastSeenId = latest.id;
      }
      res.json({ newData: isNew, data: latest });
    } else {
      res.json({ newData: false });
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

// (UPDATED!)
app.get("/api/department-sections", async (req, res) => {
  const { departmentId } = req.query;

  const query = `
    SELECT 
      dt.dprtmnt_id, 
      dt.dprtmnt_name, 
      dt.dprtmnt_code, 
      c.year_id, 
      c.program_id, 
      c.curriculum_id, 
      ds.id as department_and_program_section_id, 
      ds.section_id, 
      pt.program_description, 
      pt.program_code, 
      pt.major, 
      st.description, 
      st.id as section_id
      FROM dprtmnt_table as dt
        INNER JOIN dprtmnt_curriculum_table as dc ON dc.dprtmnt_id  = dt.dprtmnt_id
        INNER JOIN curriculum_table as c ON c.curriculum_id = dc.curriculum_id
        INNER JOIN dprtmnt_section_table as ds ON ds.curriculum_id = c.curriculum_id
        INNER JOIN program_table as pt ON c.program_id = pt.program_id
        INNER JOIN section_table as st ON st.id = ds.section_id
      WHERE dt.dprtmnt_id = ?
    ORDER BY ds.id
  `;

  try {
    const [results] = await db3.query(query, [departmentId]);
    res.status(200).json(results);
    console.log(results);
  } catch (err) {
    console.error("Error fetching department sections:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.put("/api/update-active-curriculum", async (req, res) => {
  const { studentId, departmentSectionId } = req.body;

  if (!studentId || !departmentSectionId) {
    return res.status(400).json({ error: "studentId and departmentSectionId are required" });
  }

  const fetchCurriculumQuery = `
    SELECT curriculum_id
    FROM dprtmnt_section_table
    WHERE id = ?
  `;

  try {
    const [curriculumResult] = await db3.query(fetchCurriculumQuery, [departmentSectionId]);

    if (curriculumResult.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }

    const curriculumId = curriculumResult[0].curriculum_id;

    const updateQuery = `
      UPDATE student_status_table 
      SET active_curriculum = ? 
      WHERE student_number = ?
    `;
    const result = await db3.query(updateQuery, [curriculumId, studentId]);
    const data = result[0];
    console.log(data)
    res.status(200).json({
      message: "Active curriculum updated successfully",
    });

  } catch (err) {
    console.error("Error updating active curriculum:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.get('/api/search-student/:sectionId', async (req, res) => {
  const { sectionId } = req.params
  try {
    const getProgramQuery = `
      SELECT dst.curriculum_id, pt.program_description, pt.program_code 
      FROM dprtmnt_section_table AS dst
        INNER JOIN curriculum_table AS ct ON dst.curriculum_id = ct.curriculum_id
        INNER JOIN program_table AS pt ON ct.program_id = pt.program_id
      WHERE dst.id = ?
    `;
    const [programResult] = await db3.query(getProgramQuery, [sectionId]);
    res.status(200).json(programResult);
  } catch (err) {
    console.error("Error updating active curriculum:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});




// Express route (UPDATED!)
app.get("/departments", async (req, res) => {
  const sql = "SELECT dprtmnt_id, dprtmnt_code FROM dprtmnt_table";

  try {
    const [result] = await db3.query(sql);
    res.json(result);
  } catch (err) {
    console.error("Error fetching departments:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Count how many students enrolled per subject for a selected section (UPDATED!)
app.get("/subject-enrollment-count", async (req, res) => {
  const { sectionId } = req.query; // department_section_id

  try {
    const activeYearSql = `SELECT id FROM active_school_year_table WHERE astatus = 1 LIMIT 1`;
    const [yearResult] = await db3.query(activeYearSql);

    if (yearResult.length === 0) {
      return res.status(404).json({ error: "No active school year found" });
    }

    const activeSchoolYearId = yearResult[0].id;

    const sql = `
      SELECT 
        es.course_id,
        COUNT(*) AS enrolled_count
      FROM enrolled_subject AS es
      WHERE es.active_school_year_id = ?
        AND es.department_section_id = ?
      GROUP BY es.course_id
    `;

    const [result] = await db3.query(sql, [activeSchoolYearId, sectionId]);
    res.json(result); // [{ course_id: 1, enrolled_count: 25 }, { course_id: 2, enrolled_count: 30 }]
  } catch (err) {
    console.error("Error fetching enrolled counts:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Get user by person_id (UPDATED!)
app.get("/api/user/:person_id", async (req, res) => {
  const { person_id } = req.params;

  try {
    const sql = "SELECT profile_img FROM person_table WHERE person_id = ?";
    const [results] = await db3.query(sql, [person_id]);

    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).send("Database error");
  }
});

// GET GRADING PERIOD (UPDATED!)
app.get("/get-grading-period", async (req, res) => {
  try {
    const sql = "SELECT * FROM period_status";
    const [result] = await db3.query(sql);

    res.json(result);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).send("Error fetching data");
  }
});

// ACTIVATOR API OF GRADING PERIOD (UPDATED!)
app.post("/grade_period_activate/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql1 = "UPDATE period_status SET status = 0";
    await db3.query(sql1);

    const sql2 = "UPDATE period_status SET status = 1 WHERE id = ?";
    await db3.query(sql2, [id]);

    res.status(200).json({ message: "Grading period activated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to activate grading period" });
  }
});

// API TO GET PROFESSOR PERSONAL DATA
app.get("/get_prof_data/:id", async (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT pt.prof_id, pt.profile_image, pt.email, pt.fname, pt.mname, pt.lname FROM prof_table AS pt
    WHERE pt.person_id = ?
  `;

  try {
    const [rows] = await db3.query(query, [id]);
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/course_assigned_to/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const sql = `
    SELECT DISTINCT tt.course_id, ct.course_description, ct.course_code FROM time_table AS tt
      INNER JOIN course_table AS ct ON tt.course_id = ct.course_id
      INNER JOIN prof_table AS pt ON tt.professor_id = pt.prof_id
      INNER JOIN active_school_year_table AS sy ON tt.school_year_id = sy.id
    WHERE pt.person_id = ? AND sy.astatus = 1
    `
    const [result] = await db3.query(sql, [userID]);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.get('/handle_section_of/:userID/:selectedCourse/:selectedActiveSchoolYear', async (req, res) => {
  const { userID, selectedCourse, selectedActiveSchoolYear } = req.params;


  try {
    const sql = `
    SELECT tt.department_section_id, ptbl.program_code, st.description AS section_description FROM time_table AS tt
      INNER JOIN prof_table AS pt ON tt.professor_id = pt.prof_id
      INNER JOIN dprtmnt_section_table AS dst ON tt.department_section_id = dst.id
      INNER JOIN curriculum_table AS ct ON dst.curriculum_id = ct.curriculum_id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN program_table AS ptbl ON ct.program_id = ptbl.program_id
      INNER JOIN active_school_year_table AS sy ON tt.school_year_id = sy.id
      INNER JOIN year_table AS yt ON sy.year_id = yt.year_id
    WHERE pt.person_id = ? AND tt.course_id = ? AND sy.id = ? ORDER BY section_description
    `
    const [result] = await db3.query(sql, [userID, selectedCourse, selectedActiveSchoolYear]);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.get('/get_school_year', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        year_id, 
        year_description AS current_year, 
        year_description + 1 AS next_year 
      FROM year_table ORDER BY current_year;
    `;
    const [result] = await db3.query(query);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.get('/get_school_semester', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        semester_id,semester_description, semester_code
      FROM semester_table ORDER BY semester_code;
    `;
    const [result] = await db3.query(query);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.get('/active_school_year', async (req, res) => {
  try {
    const query = `
    SELECT
    asyt.id AS school_year_id,
    yt.year_id, 
    st.semester_id,
    yt.year_description AS current_year, 
    yt.year_description + 1 AS next_year,
    st.semester_description
  FROM active_school_year_table AS asyt 
    INNER JOIN year_table AS yt ON asyt.year_id = yt.year_id
    INNER JOIN semester_table AS st ON asyt.semester_id = st.semester_id
  WHERE asyt.astatus = 1
    `;
    const [result] = await db3.query(query);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.get('/get_selecterd_year/:selectedSchoolYear/:selectedSchoolSemester', async (req, res) => {
  const { selectedSchoolYear, selectedSchoolSemester } = req.params;
  try {
    const query = `
    SELECT
    asyt.id AS school_year_id
  FROM active_school_year_table AS asyt 
    INNER JOIN year_table AS yt ON asyt.year_id = yt.year_id
    INNER JOIN semester_table AS st ON asyt.semester_id = st.semester_id
  WHERE yt.year_id = ? AND st.semester_id = ?
    `;
    const [result] = await db3.query(query, [selectedSchoolYear, selectedSchoolSemester]);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

// UPDATED 09/06/2025
app.get('/enrolled_student_list/:userID/:selectedCourse/:department_section_id', async (req, res) => {
  const { userID, selectedCourse, department_section_id } = req.params;

  try {

    const [rows] = await db3.query(
      "SELECT status FROM period_status WHERE description = 'Final Grading Period'"
    );

    if (!rows.length || rows[0].status !== 1) {
      return res.status(403).json({ message: "Grades not available yet" });
    }

    const sql = `
      SELECT DISTINCT
        es.student_number, 
        ptbl.last_name, 
        ptbl.first_name, 
        ptbl.middle_name, 
        es.midterm, 
        es.finals, 
        es.final_grade, 
        es.en_remarks,
        st.description AS section_description,
        pgt.program_code
      FROM enrolled_subject AS es
        INNER JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
        INNER JOIN person_table AS ptbl ON snt.person_id = ptbl.person_id
        INNER JOIN time_table AS tt ON es.department_section_id = tt.department_section_id
        INNER JOIN prof_table AS pt ON tt.professor_id = pt.prof_id
        INNER JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
        INNER JOIN section_table AS st ON dst.section_id = st.id
        INNER JOIN curriculum_table AS ct ON es.curriculum_id = ct.curriculum_id
        INNER JOIN program_table AS pgt ON ct.program_id = pgt.program_id
      WHERE pt.person_id = ? AND es.course_id = ? AND es.department_section_id = ?
    `;

    const [result] = await db3.query(sql, [userID, selectedCourse, department_section_id]);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

// API ROOM SCHEDULE
app.get("/get_room/:profID/:roomID", async (req, res) => {
  const { profID, roomID } = req.params;

  const query = `
    SELECT 
      t.room_day,
      d.description as day,
      t.school_time_start AS start_time,
      t.school_time_end AS end_time,
      rt.room_description
    FROM time_table t
    JOIN room_day_table d ON d.id = t.room_day
    INNER JOIN dprtmnt_room_table drt ON drt.dprtmnt_room_id = t.department_room_id
    INNER JOIN room_table rt ON rt.room_id = drt.room_id
    INNER JOIN active_school_year_table asy ON t.school_year_id = asy.id
    WHERE t.professor_id = ? AND t.department_room_id = ? AND asy.astatus = 1
  `;
  try {
    const [result] = await db3.query(query, [profID, roomID]);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "ERROR:", error });
  }
});

app.delete("/upload/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM requirement_uploads WHERE upload_id = ?";

  try {
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Requirement not found" });
    }

    res.status(200).json({ message: "Requirement deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete requirement" });
  }
});

app.get("/api/professor-schedule/:profId", async (req, res) => {
  const profId = req.params.profId;

  try {
    const [results] = await db3.execute(
      `
      SELECT 
        t.room_day,
        d.description as day_description,
        t.school_time_start AS school_time_start,
        t.school_time_end AS school_time_end,
        pgt.program_code,
        st.description AS section_description,
        rt.room_description, 
        cst.course_code
      FROM time_table t
      JOIN room_day_table d ON d.id = t.room_day
      INNER JOIN active_school_year_table asy ON t.school_year_id = asy.id
      INNER JOIN dprtmnt_section_table AS dst ON t.department_section_id = dst.id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
      INNER JOIN program_table AS pgt ON cct.program_id = pgt.program_id
      INNER JOIN room_table AS rt ON t.department_room_id = rt.room_id
      INNER JOIN course_table AS cst ON t.course_id = cst.course_id
      WHERE t.professor_id = ? AND asy.astatus = 1;;
    `,
      [profId]
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  }
});

app.get("/api/student-dashboard/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT snt.student_number, pt.* FROM student_numbering_table as snt
      INNER JOIN person_table as pt ON snt.person_id = pt.person_id
      WHERE snt.person_id = ?
    `;
    const [result] = await db3.query(query, [id]);
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("DB ERROR");
  }
});

/* CODE NI MARK */
app.get("/student-data/:studentNumber", async (req, res) => {
  const studentNumber = req.params.studentNumber;

  const query = `
  SELECT   
      sn.student_number,
      p.person_id,
      p.profile_img,
      p.last_name,
      p.middle_name,
      p.first_name,
      p.extension,
      p.gender,
      p.age,
      p.emailAddress AS email,
      ss.active_curriculum AS curriculum,
      ss.year_level_id AS yearlevel,
      prog.program_description AS program,
      d.dprtmnt_name AS college
  FROM student_numbering_table sn
  INNER JOIN person_table p ON sn.person_id = p.person_id
  INNER JOIN student_status_table ss ON ss.student_number = sn.student_number
  INNER JOIN curriculum_table c ON ss.active_curriculum = c.curriculum_id
  INNER JOIN program_table prog ON c.program_id = prog.program_id
  INNER JOIN dprtmnt_curriculum_table dc ON c.curriculum_id = dc.curriculum_id
  INNER JOIN year_table yt ON c.year_id = yt.year_id
  INNER JOIN dprtmnt_table d ON dc.dprtmnt_id = d.dprtmnt_id
  WHERE sn.student_number = ?;
`;

  try {
    const [results] = await db3.query(query, [studentNumber]);
    res.json(results[0] || {});
  } catch (err) {
    console.error("Failed to fetch student data:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// EXAM API ENDPOINTS

app.post('/applicant_schedule', async (req, res) => {
  const { applicant_id, exam_id } = req.body;

  if (!applicant_id || !exam_id) {
    return res.status(400).json({ error: 'Applicant ID and Exam ID are required.' });
  }

  const query = `INSERT INTO exam_applicants (applicant_id, schedule_id) VALUES (?, ?)`;

  try {
    const [result] = await db.query(query, [applicant_id, exam_id]);
    res.json({ message: 'Applicant scheduled successfully', insertId: result.insertId });
  } catch (err) {
    console.error('Database error adding applicant to schedule:', err);
    res.status(500).json({ error: 'Database error adding applicant to schedule' });
  }
});

app.get('/get_applicant_schedule', async (req, res) => {
  const query = `
    SELECT * 
    FROM person_status_table 
    WHERE exam_status = 0 
      AND applicant_id NOT IN (
        SELECT applicant_id 
        FROM exam_applicants
      )
  `;

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Database error fetching unscheduled applicants:', err);
    res.status(500).json({ error: 'Database error fetching unscheduled applicants' });
  }
});


app.get('/slot_count/:exam_id', async (req, res) => {
  const exam_id = req.params.exam_id;
  const sql = `SELECT COUNT(*) AS count FROM exam_applicants WHERE schedule_id = ?`;

  try {
    const [results] = await db.query(sql, [exam_id]);
    res.json({ occupied: results[0].count });
  } catch (err) {
    console.error('Database error getting slot count:', err);
    res.status(500).json({ error: 'Database error getting slot count' });
  }
});

// GET person details by person_id including program and student_number
app.get("/api/person/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT 
        p.*, 
        st.student_number,
        ct.curriculum_id,
        pt.program_description AS program
        pt.major AS major
      FROM person_table AS p
      LEFT JOIN student_numbering_table AS st ON st.person_id = p.person_id
      LEFT JOIN curriculum_table AS ct ON ct.curriculum_id = p.program
      LEFT JOIN program_table AS pt ON pt.program_id = ct.program_id
      WHERE p.person_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.json(rows[0]); // ✅ Send single merged result
  } catch (err) {
    console.error("Error fetching person details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Program Display
app.get('/class_roster/ccs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        dct.dprtmnt_id, dt.dprtmnt_name, dt.dprtmnt_code, 
        pt.program_id, pt.program_description, pt.program_code, 
        ct.curriculum_id
      FROM dprtmnt_curriculum_table as dct 
      INNER JOIN dprtmnt_table as dt ON dct.dprtmnt_id = dt.dprtmnt_id
      INNER JOIN curriculum_table as ct ON dct.curriculum_id = ct.curriculum_id 
      INNER JOIN program_table as pt ON ct.program_id = pt.program_id 
      -- LEFT JOIN year_table as yt ON ct.year_id = yt.year_id -- optional
      WHERE dct.dprtmnt_id = ?;
    `;

    const [programRows] = await db3.execute(query, [id]);

    if (programRows.length === 0) {
      return res.json([]); // empty array instead of error
    }

    res.json(programRows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Curriculum Section 
app.get('/class_roster/:cID', async (req, res) => {
  const { cID } = req.params;
  try {
    const query = `
      SELECT ct.curriculum_id, st.description, dst.id from dprtmnt_section_table AS dst 
        INNER JOIN curriculum_table AS ct ON dst.curriculum_id = ct.curriculum_id 
        INNER JOIN section_table AS st ON dst.section_id = st.id 
      WHERE ct.curriculum_id = ?;
    `

    const [sectionList] = await db3.execute(query, [cID]);

    res.json(sectionList);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// prof list base dun curriculum id tsaka sa section id
app.get('/class_roster/:cID/:dstID', async (req, res) => {
  const { cID, dstID } = req.params;
  try {
    const query = `
    SELECT DISTINCT cst.course_id, pft.prof_id, tt.department_section_id, pft.fname, pft.lname, pft.mname, cst.course_description, cst.course_code, st.description AS section_description, pgt.program_code FROM time_table AS tt
      INNER JOIN dprtmnt_section_table AS dst ON tt.department_section_id = dst.id
      INNER JOIN curriculum_table AS cmt ON dst.curriculum_id = cmt.curriculum_id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN course_table AS cst ON tt.course_id = cst.course_id
      INNER JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
      INNER JOIN program_table AS pgt ON cmt.program_id = pgt.program_id
      INNER JOIN active_school_year_table AS asyt ON tt.school_year_id = asyt.id
    WHERE dst.curriculum_id = ? AND tt.department_section_id = ? AND asyt.astatus = 1
    `
    const [profList] = await db3.execute(query, [cID, dstID]);

    console.log(profList);
    res.json(profList);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

// Student Information
app.get('/class_roster/student_info/:cID/:dstID/:courseID/:professorID', async (req, res) => {
  const { cID, dstID, courseID, professorID } = req.params;
  try {
    const query = `
    SELECT DISTINCT
      es.student_number, 
      pst.first_name, pst.middle_name, pst.last_name, 
      pgt.program_description, pgt.program_code
    FROM enrolled_subject AS es
      INNER JOIN time_table AS tt ON es.department_section_id = tt.department_section_id
      INNER JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
      INNER JOIN active_school_year_table AS asyt ON es.active_school_year_id = asyt.id
      INNER JOIN student_status_table AS sst ON es.student_number = sst.student_number
      INNER JOIN student_numbering_table AS snt ON sst.student_number = snt.student_number
      INNER JOIN person_table AS pst ON snt.person_id = pst.person_id
      INNER JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
      INNER JOIN program_tagging_table AS ptt ON es.course_id = ptt.course_id
      INNER JOIN program_table AS pgt ON cct.program_id = pgt.program_id
    WHERE es.curriculum_id = ? AND es.department_section_id = ? AND asyt.astatus = 1 AND es.course_id = ? AND tt.professor_id = ? ORDER BY pst.last_name
    `

    const [studentList] = await db3.execute(query, [cID, dstID, courseID, professorID])
    console.log(studentList);
    res.json(studentList);

  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error", err });
  }
})

// Class Information
app.get('/class_roster/classinfo/:cID/:dstID/:courseID/:professorID', async (req, res) => {
  const { cID, dstID, courseID, professorID } = req.params;
  try {
    const query = `
    SELECT DISTINCT
      st.description AS section_Description,
      pft.fname, pft.mname, pft.lname, pft.prof_id,
      smt.semester_description,
      ylt.year_level_description,
      ct.course_description, ct.course_code, ct.course_unit, ct.lab_unit, ct.course_id,
      yt.year_description,
      rdt.description as day,
      tt.school_time_start,
      tt.school_time_end
    FROM enrolled_subject AS es
      INNER JOIN time_table AS tt ON es.department_section_id = tt.department_section_id
      INNER JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN active_school_year_table AS asyt ON es.active_school_year_id = asyt.id
      INNER JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
      INNER JOIN course_table AS ct ON es.course_id = ct.course_id
      INNER JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
      INNER JOIN program_tagging_table AS ptt ON es.course_id = ptt.course_id
      INNER JOIN program_table AS pgt ON cct.program_id = pgt.program_id
      INNER JOIN year_table AS yt ON cct.year_id = yt.year_id
      INNER JOIN year_level_table AS ylt ON ptt.year_level_id = ylt.year_level_id
      INNER JOIN semester_table AS smt ON ptt.semester_id = smt.semester_id
      INNER JOIN room_day_table AS rdt ON tt.room_day = rdt.id
    WHERE es.curriculum_id = ? AND es.department_section_id = ? AND asyt.astatus = 1 AND es.course_id = ? AND tt.professor_id = ?
    `

    const [class_data] = await db3.execute(query, [cID, dstID, courseID, professorID])
    console.log(class_data);
    res.json(class_data);

  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error", err });
  }
})

app.get('/statistics/student_count/department/:dprtmnt_id', async (req, res) => {
  const { dprtmnt_id } = req.params;

  try {
    const query = `
      SELECT COUNT(DISTINCT es.student_number) AS student_count
      FROM enrolled_subject AS es
      INNER JOIN curriculum_table AS ct ON es.curriculum_id = ct.curriculum_id
      INNER JOIN dprtmnt_curriculum_table AS dct ON ct.curriculum_id = dct.curriculum_id
      INNER JOIN dprtmnt_table AS dt ON dct.dprtmnt_id = dt.dprtmnt_id
      INNER JOIN active_school_year_table AS asyt ON es.active_school_year_id = asyt.id
      INNER JOIN student_status_table AS sst ON es.student_number = sst.student_number
      INNER JOIN student_numbering_table AS snt ON sst.student_number = snt.student_number
      INNER JOIN person_table AS pst ON snt.person_id = pst.person_id
      WHERE dt.dprtmnt_id = ?
        AND asyt.astatus = 1
        AND sst.enrolled_status = 1
    `;

    const [rows] = await db3.execute(query, [dprtmnt_id]);
    res.json({ count: rows[0]?.student_count || 0 });
  } catch (err) {
    console.error("Error fetching total student count by department:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/departments/:dprtmnt_id', async (req, res) => {
  const { dprtmnt_id } = req.params;
  console.log(dprtmnt_id);
  try {
    const [departments] = await db3.execute(`
      SELECT dt.dprtmnt_id, dt.dprtmnt_name, dt.dprtmnt_code FROM dprtmnt_table AS dt WHERE dt.dprtmnt_id = ?
    `, [dprtmnt_id]);
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/departments', async (req, res) => {

  try {
    const [departments] = await db3.execute(`
      SELECT dt.dprtmnt_id, dt.dprtmnt_name, dt.dprtmnt_code FROM dprtmnt_table AS dt
    `);
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// NEW ENDPOINT: All Year Levels Count
app.get('/statistics/student_count/department/:dprtmnt_id/by_year_level', async (req, res) => {
  const { dprtmnt_id } = req.params;

  try {
    const query = `
      SELECT ylt.year_level_id, ylt.year_level_description, COUNT(DISTINCT es.student_number) AS student_count
      FROM enrolled_subject AS es
      INNER JOIN curriculum_table AS ct ON es.curriculum_id = ct.curriculum_id
      INNER JOIN dprtmnt_curriculum_table AS dct ON ct.curriculum_id = dct.curriculum_id
      INNER JOIN dprtmnt_table AS dt ON dct.dprtmnt_id = dt.dprtmnt_id
      INNER JOIN active_school_year_table AS asyt ON es.active_school_year_id = asyt.id
      INNER JOIN student_status_table AS sst ON es.student_number = sst.student_number
      INNER JOIN year_level_table AS ylt ON sst.year_level_id = ylt.year_level_id
      WHERE dt.dprtmnt_id = ?
        AND asyt.astatus = 1
        AND sst.enrolled_status = 1
      GROUP BY ylt.year_level_id
      ORDER BY ylt.year_level_id ASC;
    `;

    const [rows] = await db3.execute(query, [dprtmnt_id]);
    res.json(rows); // [{ year_level_id: 1, year_level_description: "1st Year", student_count: 123 }, ...]
  } catch (err) {
    console.error("Error fetching year-level counts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_active_school_years", async (req, res) => {
  const query = `
    SELECT sy.*, yt.year_description, s.semester_description 
    FROM active_school_year_table sy
    JOIN year_table yt ON sy.year_id = yt.year_id
    JOIN semester_table s ON sy.semester_id = s.semester_id
    WHERE sy.astatus = 1
  `;

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch school years", details: err.message });
  }
});

// 09/06/2025 UPDATE
app.post("/forgot-password-student", async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Check if student exists
    const [rows] = await db3.query(
      `SELECT ua.email, p.campus
       FROM user_accounts ua
       JOIN person_table p ON ua.person_id = p.person_id
       WHERE ua.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    // 🔹 Fetch short term from company settings
    const [settings] = await db.query("SELECT short_term FROM company_settings WHERE id = 1");
    const shortTerm =
      settings.length > 0 && settings[0].short_term ? settings[0].short_term : "Institution";

    // 🔹 Generate random 8-character uppercase password (A–Z)
    const newPassword = Array.from({ length: 8 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join("");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔹 Update student password in DB
    await db3.query("UPDATE user_accounts SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // 🔹 Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Send email with institutional short term
    await transporter.sendMail({
      from: `"${shortTerm} - Information System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password has Reset",
      text: `Your new temporary password is: ${newPassword}\n\nPlease change it after logging in.`,
    });

    res.json({
      success: true,
      message: "Password reset successfully. Check your email for the new password.",
    });
  } catch (error) {
    console.error("Reset error (student):", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


/* Student Dashboard */
//GET All Needed Student Personl Data
app.get("/api/student/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db3.execute(`
      SELECT DISTINCT 
        snt.person_id, 
        pt.profile_img AS profile_image, 
        ua.role, 
        pt.extension, 
        pt.last_name, 
        pt.first_name, 
        pt.middle_name, 
        snt.student_number, 
        sst.year_level_id, 
        es.curriculum_id, 
        sy.semester_id 
      FROM student_numbering_table AS snt 
      INNER JOIN person_table AS pt ON snt.person_id = pt.person_id
      INNER JOIN user_accounts AS ua ON pt.person_id = ua.person_id
      INNER JOIN enrolled_subject AS es ON snt.student_number = es.student_number
      INNER JOIN student_status_table AS sst ON snt.student_number = sst.student_number
      INNER JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
      WHERE pt.person_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    const { student_number, year_level_id, curriculum_id, semester_id } = rows[0];

    const checkTotalRequiredUnits = `
      SELECT COALESCE(SUM(ct.course_unit) + SUM(ct.lab_unit), 0) AS required_total_units 
      FROM program_tagging_table AS ptt
      INNER JOIN course_table AS ct ON ptt.course_id = ct.course_id
      WHERE ptt.year_level_id = ? AND ptt.semester_id = ? AND ptt.curriculum_id = ?
    `;
    const [requiredUnits] = await db3.query(checkTotalRequiredUnits, [year_level_id, semester_id, curriculum_id]);

    const checkTotalEnrolledUnits = `
      SELECT COALESCE(SUM(ct.course_unit) + SUM(ct.lab_unit), 0) AS enrolled_total_units 
      FROM enrolled_subject AS es
      INNER JOIN course_table AS ct ON es.course_id = ct.course_id
      INNER JOIN student_status_table AS sst ON es.student_number = sst.student_number
      INNER JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
      WHERE sy.astatus = 1 AND es.student_number = ? AND sst.year_level_id = ?;
    `;
    const [enrolledUnits] = await db3.query(checkTotalEnrolledUnits, [student_number, year_level_id]);

    const requiredTotal = requiredUnits[0]?.required_total_units || 0;
    const enrolledTotal = enrolledUnits[0]?.enrolled_total_units || 0;

    const student_status = enrolledTotal === requiredTotal ? "Regular" : "Irregular";

    return res.json({
      ...rows[0],
      student_status,
    });

  } catch (error) {
    console.error("Error fetching person:", error);
    return res.status(500).json({ error: "Database error" });
  }
});

//COUNT the Total Number of Courses the Student Enrolled
app.get("/api/course_count/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db3.execute(`
    SELECT 
      COUNT(es.course_id) AS initial_course,
      SUM(CASE WHEN es.en_remarks = 1 THEN 1 ELSE 0 END) AS passed_course,
      SUM(CASE WHEN es.en_remarks = 2 THEN 1 ELSE 0 END) AS failed_course,
      SUM(CASE WHEN es.en_remarks = 3 THEN 1 ELSE 0 END) AS inc_course
    FROM enrolled_subject AS es
      JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
      JOIN person_table AS pt ON snt.person_id = pt.person_id
    WHERE pt.person_id = ?
`, [id]);

    res.json(rows[0] || { initial_course: 0 });
    console.log(rows);
  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }
});

//GET All Needed Student Academic Data (Program, etc...)
app.get("/api/student_details/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db3.execute(`
    SELECT DISTINCT
      IFNULL(pgt.program_description, 'Not Currently Enrolled') AS program_description,
      IFNULL(st.description, 'Not Currently Enrolled') AS section_description,
      IFNULL(pgt.program_code, 'Not Currently Enrolled') AS program_code,
      IFNULL(ylt.year_level_description, 'Not Currently Enrolled') AS year_level
    FROM enrolled_subject AS es
      INNER JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
      INNER JOIN person_table AS pt ON snt.person_id = pt.person_id
      INNER JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
      INNER JOIN program_table AS pgt ON cct.program_id = pgt.program_id
      INNER JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN student_status_table AS sst ON snt.student_number = sst.student_number
      INNER JOIN year_level_table AS ylt ON sst.year_level_id = ylt.year_level_id
      INNER JOIN active_school_year_table AS sy ON sst.active_curriculum = sy.id
    WHERE pt.person_id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }

})

/* Student Schedule */
//GET Student Current Assigned Schedule
app.get("/api/student_schedule/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db3.execute(`
    SELECT DISTINCT 
      ct.course_description, 
      ct.course_code, 
      ct.course_unit, 
      ct.lab_unit, 
      pgt.program_code, 
      st.description AS section_description, 
      IFNULL(pft.lname, 'TBA') AS prof_lastname, 
      IFNULL(rdt.description, 'TBA') AS day_description, 
      IFNULL(tt.school_time_start, 'TBA') AS school_time_start,
      IFNULL(tt.school_time_end, 'TBA') AS school_time_end,
      IFNULL(rt.room_description, 'TBA') AS room_description,
      IFNULL(pft.fname, 'TBA') AS fname,
      IFNULL(pft.lname, 'TBA') AS lname
     FROM enrolled_subject AS es
    JOIN student_numbering_table AS snt ON es.student_number = snt.student_number 
    JOIN person_table AS pt ON snt.person_id = pt.person_id
    JOIN course_table AS ct ON es.course_id = ct.course_id
    JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
    JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
    JOIN program_table AS pgt ON cct.program_id = pgt.program_id
    JOIN section_table AS st ON dst.section_id = st.id
    LEFT JOIN time_table AS tt 
      ON tt.course_id = es.course_id 
     AND tt.department_section_id = es.department_section_id
    LEFT JOIN room_day_table AS rdt ON tt.room_day = rdt.id
    LEFT JOIN room_table AS rt ON tt.department_room_id = rt.room_id
    LEFT JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
    JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
    WHERE pt.person_id = ? AND sy.astatus = 1;;`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }
});

/* Student Grade Page */
//DISPLAY ALL Student's Grade
app.get("/api/student_grade/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 🔎 Check if there are professors not evaluated yet
    const [pending] = await db3.execute(`
      SELECT DISTINCT COUNT(*) AS total_professors
      FROM enrolled_subject AS es
      JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
      WHERE es.fe_status = 0 AND snt.person_id = ?
    `, [id]);

    // 🔎 Fetch all enrolled courses with details
    const [rows] = await db3.execute(`
      SELECT DISTINCT 
        ct.course_description, 
        ct.course_code, 
        es.en_remarks, 
        ct.course_unit, 
        ct.lab_unit, 
        pgt.program_code,
        pgt.program_description,
        st.description AS section_description, 
        pft.lname AS prof_lastname, 
        rdt.description AS day_description, 
        tt.school_time_start, 
        tt.school_time_end, 
        rt.room_description, 
        yt.year_description AS first_year,
        yt.year_description + 1 AS last_year,
        smt.semester_description,
        IFNULL(pft.fname, 'TBA') AS fname,
        IFNULL(pft.lname, 'TBA') AS lname,
        es.final_grade,
        es.fe_status,
        es.en_remarks
      FROM enrolled_subject AS es 
        JOIN student_numbering_table AS snt ON es.student_number = snt.student_number 
        JOIN person_table AS pt ON snt.person_id = pt.person_id
        JOIN course_table AS ct ON es.course_id = ct.course_id
        JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
        JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
        JOIN program_table AS pgt ON cct.program_id = pgt.program_id
        JOIN section_table AS st ON dst.section_id = st.id
        LEFT JOIN time_table AS tt 
          ON tt.course_id = es.course_id 
        AND tt.department_section_id = es.department_section_id
        LEFT JOIN room_day_table AS rdt ON tt.room_day = rdt.id
        LEFT JOIN room_table AS rt ON tt.department_room_id = rt.room_id
        LEFT JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
        JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
        JOIN year_table AS yt ON sy.year_id = yt.year_id
        JOIN semester_table AS smt ON sy.semester_id = smt.semester_id
      WHERE pt.person_id = ? ORDER BY yt.year_description DESC, CASE smt.semester_description
        WHEN 'First Semester' THEN 1
        WHEN 'Second Semester' THEN 2
        ELSE 3
      END DESC
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    let responseRows = rows;
    if (pending[0].total_professors > 0) {
      responseRows = rows.map(r => ({
        ...r,
        final_grade: r.fe_status === 1 ? r.final_grade : null,
        en_remarks: r.fe_status === 1 ? r.en_remarks : null
      }));
    }

    res.json(responseRows);

  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }
});

//GET Grading Status Period
app.get("/api/grading_status", async (req, res) => {
  try {
    const [rows] = await db3.execute(
      "SELECT status FROM period_status WHERE description = 'Final Grading Period'"
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Grading period not found" });
    }

    res.json({ status: rows[0].status });
    console.log({ status: rows[0].status });
  } catch (err) {
    console.error("Error checking grading status:", err);
    res.status(500).json({ message: "Database error" });
  }
});

//DISPLAY Latest Data Only
app.get("/api/student/view_latest_grades/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Count professors not yet evaluated
    const [pending] = await db3.execute(`
      SELECT COUNT(DISTINCT es.course_id) AS total_professors 
      FROM enrolled_subject AS es
      JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
      LEFT JOIN time_table AS tt 
        ON tt.course_id = es.course_id 
       AND tt.department_section_id = es.department_section_id
      WHERE es.fe_status = 0 AND snt.person_id = ?
    `, [id]);

    if (!pending || pending[0].total_professors === 0) {
      return res.json({
        status: "not-available",
        message: "Grades cannot be revealed yet. No professors assigned.",
        grades: []
      });
    }

    const [courses] = await db3.execute(`
      SELECT DISTINCT 
        ct.course_description, 
        ct.course_code, 
        es.en_remarks, 
        ct.course_unit, 
        ct.lab_unit, 
        pgt.program_code,
        pgt.program_description,
        st.description AS section_description, 
        pft.lname AS prof_lastname, 
        IFNULL(pft.fname, 'TBA') AS fname,
        IFNULL(pft.lname, 'TBA') AS lname,
        rdt.description AS day_description, 
        tt.school_time_start, 
        tt.school_time_end, 
        rt.room_description, 
        yt.year_description AS first_year,
        yt.year_description + 1 AS last_year,
        smt.semester_description,
        es.final_grade,
        es.fe_status,
        es.en_remarks
      FROM enrolled_subject AS es 
        JOIN student_numbering_table AS snt ON es.student_number = snt.student_number 
        JOIN person_table AS pt ON snt.person_id = pt.person_id
        JOIN course_table AS ct ON es.course_id = ct.course_id
        JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
        JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
        JOIN program_table AS pgt ON cct.program_id = pgt.program_id
        JOIN section_table AS st ON dst.section_id = st.id
        LEFT JOIN time_table AS tt 
          ON tt.course_id = es.course_id 
        AND tt.department_section_id = es.department_section_id
        LEFT JOIN room_day_table AS rdt ON tt.room_day = rdt.id
        LEFT JOIN room_table AS rt ON tt.department_room_id = rt.room_id
        LEFT JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
        JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
        JOIN year_table AS yt ON sy.year_id = yt.year_id
        JOIN semester_table AS smt ON sy.semester_id = smt.semester_id
      WHERE pt.person_id = ?
    `, [id]);

    if (pending[0].total_professors > 0) {
      const maskedCourses = courses.map(c => {
        if (c.fe_status === 1) {
          return c;
        }
        return {
          ...c,
          final_grade: null,
          en_remarks: null
        };
      });

      return res.json({
        status: "incomplete",
        message: `Please Do Faculty Evaluation, Remaining Professor To Evaluate: ${pending[0].total_professors}`,
        grades: maskedCourses
      });
    }

    res.json({ status: "ok", grades: courses });
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ error: "Database error" });
  }
});
/* Faculty Evaluation (Student Side) */
app.get("/api/student_course/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db3.execute(`
      SELECT DISTINCT snt.student_number, pt.prof_id, cct.curriculum_id, sy.id AS active_school_year_id, ct.course_id, pt.fname, pt.mname, pt.lname, ct.course_description, ct.course_code FROM enrolled_subject AS es
        INNER JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
        INNER JOIN person_table AS pst ON snt.person_id = pst.person_id
        INNER JOIN course_table AS ct ON es.course_id = ct.course_id
        INNER JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
        LEFT JOIN time_table AS tt 
          ON tt.course_id = es.course_id 
          AND tt.department_section_id = es.department_section_id
        LEFT JOIN prof_table AS pt ON tt.professor_id = pt.prof_id
        INNER JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
      WHERE pst.person_id = ? AND sy.astatus = 1 AND es.fe_status = 0
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: "Professor Data are not found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error checking grading status:", err);
    res.status(500).json({ message: "Database error" });
  }
});


app.post('/api/student_evaluation', async (req, res) => {
  const { student_number, school_year_id, prof_id, course_id, question_id, answer } = req.body;

  try {
    await db3.execute(
      `
      INSERT INTO student_evaluation_table
      (student_number, school_year_id, prof_id, course_id, question_id, question_answer)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [student_number, school_year_id, prof_id, course_id, question_id, answer]
    );

    await db3.execute(
      `
      UPDATE enrolled_subject 
      SET fe_status = 1
      WHERE student_number = ? AND course_id = ? AND active_school_year_id = ?
      `,
      [student_number, course_id, school_year_id]
    );

    res.status(200).send({ message: "Evaluation successfully recorded!" });
  } catch (err) {
    console.error("Database / Server Error:", err);
    res.status(500).send({ message: "Database / Server Error", error: err.message });
  }
});


//DISPLAY the Student Answer After Submission
app.get("/api/student/faculty_evaluation/answer/:course_id/:prof_id/:curriculum_id/:active_school_year_id", async (req, res) => {
  const { course_id, prof_id, curriculum_id, active_school_year_id } = req.params;

  try {
    const [rows] = await db3.execute(
      `SELECT num1, num2, num3, eval_status
         FROM faculty_evaluation_table  
         WHERE prof_id = ? AND course_id = ? AND curriculum_id = ? AND active_school_year_id = ? LIMIT 1;`,
      [prof_id, course_id, curriculum_id, active_school_year_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching evaluation:", err);
    res.status(500).json({ message: "Database error" });
  }
}
);

app.get("/api/get/all_schedule/:roomID", async (req, res) => {
  const { roomID } = req.params;
  console.log("RoomID:", roomID);

  try {
    const scheduleQuery = `
      SELECT 
        tt.room_day, 
        rdt.description AS day_description, 
        tt.school_time_start, 
        tt.school_time_end, 
        pft.lname AS prof_lastname, 
        pft.fname AS prof_firstname,
        cst.course_code,
        rmt.room_description,
        pgt.program_code,
        st.description AS section_description
      FROM time_table AS tt
        JOIN room_day_table AS rdt ON tt.room_day = rdt.id
        JOIN dprtmnt_section_table AS dst ON tt.department_section_id = dst.id
        JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
        JOIN program_table AS pgt ON cct.program_id = pgt.program_id
        JOIN course_table AS cst ON tt.course_id = cst.course_id
        JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
        JOIN active_school_year_table AS syt ON tt.school_year_id = syt.id
        JOIN room_table AS rmt ON tt.department_room_id = rmt.room_id
        JOIN section_table AS st ON dst.section_id = st.id
        JOIN active_school_year_table AS sy ON tt.school_year_id = sy.id
      WHERE rmt.room_id = ? AND sy.astatus = 1;
    `
    const [schedule] = await db3.execute(scheduleQuery, [roomID]);

    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching person:", error);
    res.status(500).json({ error: "Database error" });
  }
});

//Get Section List From Selected Department
app.get("/section_table/:dprtmnt_id", async (req, res) => {
  const { dprtmnt_id } = req.params;

  try {
    const query = `
      SELECT dst.id as dep_section_id, st.*, pt.*
      FROM dprtmnt_curriculum_table AS dct
      INNER JOIN dprtmnt_section_table AS dst ON dct.curriculum_id = dst.curriculum_id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN curriculum_table AS ct ON dct.curriculum_id = ct.curriculum_id
      INNER JOIN program_table AS pt ON ct.program_id = pt.program_id
      WHERE dct.dprtmnt_id = ?;
    `;

    const [results] = await db3.query(query, [dprtmnt_id]);
    res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

//Get Program List From Selected Department
app.get("/program_list/:dprtmnt_id", async (req, res) => {
  const { dprtmnt_id } = req.params;

  try {
    const query = `
      SELECT pt.program_id, pt.program_description, pt.program_code, pt.major  
      FROM dprtmnt_curriculum_table AS dct
      INNER JOIN curriculum_table AS ct ON dct.curriculum_id = ct.curriculum_id
      INNER JOIN program_table AS pt ON ct.program_id = pt.program_id
      WHERE dct.dprtmnt_id = ?;
    `;

    const [results] = await db3.query(query, [dprtmnt_id]);
    res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// server.js (add or replace existing person_with_applicant route)
app.get('/api/person_with_applicant/:person_id', (req, res) => {
  const personId = req.params.person_id;
  const sql = `
    SELECT 
      p.*,
      an.applicant_number,

      ps.qualifying_result   AS qualifying_exam_score,
      ps.interview_result    AS qualifying_interview_score,
      ps.exam_result         AS exam_score
    FROM person_table p
    LEFT JOIN applicant_numbering_table an ON an.person_id = p.person_id
    LEFT JOIN person_status_table ps ON ps.person_id = p.person_id
    WHERE p.person_id = ?
    LIMIT 1
  `;
  db.query(sql, [personId], (err, results) => {
    if (err) {
      console.error('person_with_applicant SQL error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!results[0]) return res.status(404).json({ error: 'Person not found' });
    res.json(results[0]);
  });
});




// server.js
app.get('/api/person_with_applicant/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      p.*,
      an.applicant_number,
      ps.qualifying_result   AS qualifying_exam_score,
      ps.interview_result    AS qualifying_interview_score,
      ps.exam_result         AS exam_score
    FROM person_table p
    LEFT JOIN applicant_numbering_table an ON an.person_id = p.person_id
    LEFT JOIN person_status_table ps ON ps.person_id = p.person_id
    WHERE p.person_id = ? OR an.applicant_number = ?
    LIMIT 1
  `;

  // bind the same param twice so the endpoint accepts either numeric person_id or applicant_number
  db.query(sql, [id, id], (err, results) => {
    if (err) {
      console.error('person_with_applicant SQL error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!results[0]) return res.status(404).json({ error: 'Person not found' });
    res.json(results[0]);
  });
});

// server.js
app.get('/api/person_status_by_applicant/:applicant_number', (req, res) => {
  const applicantNumber = req.params.applicant_number;
  const sql = `
    SELECT ps.*
    FROM person_status_table ps
    JOIN applicant_numbering_table an ON an.person_id = ps.person_id
    WHERE an.applicant_number = ?
    LIMIT 1
  `;
  db.query(sql, [applicantNumber], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || null);
  });
});

// GET all templates
app.get("/api/email-templates", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM email_templates ORDER BY updated_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// CREATE template
app.post("/api/email-templates", async (req, res) => {
  try {
    const { sender_name, is_active = 1 } = req.body;
    if (!sender_name) return res.status(400).json({ error: "Sender name is required" });

    const [result] = await db.query(
      "INSERT INTO email_templates (sender_name, is_active) VALUES (?, ?)",
      [sender_name, is_active ? 1 : 0]
    );
    res.status(201).json({ template_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// UPDATE template
app.put("/api/email-templates/:id", async (req, res) => {
  try {
    const { sender_name, is_active } = req.body;
    const [result] = await db.query(
      "UPDATE email_templates SET sender_name = COALESCE(?, sender_name), is_active = COALESCE(?, is_active) WHERE template_id = ?",
      [sender_name, is_active, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update template" });
  }
});

// DELETE template
app.delete("/api/email-templates/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM email_templates WHERE template_id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

app.get("/api/email-templates/active-senders", async (req, res) => {
  const { department_id } = req.query;
  console.log("Department ID: ", department_id);

  try {
    const [rows] = await db.query(
      "SELECT template_id, sender_name FROM email_templates WHERE is_active = 1 AND department_id = ?",
      [department_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active senders" });
  }
});

app.get("/api/admin_data/:email", async (req, res) => {
  const { email } = req.params;  // 👈 now matches your frontend call
  console.log("Email: ", email);

  try {
    const [rows] = await db3.query(
      "SELECT ua.dprtmnt_id FROM user_accounts AS ua WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      res.json(rows[0]); // return { dprtmnt_id: "..." }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

app.get("/api/applied_program/:dprtmnt_id", async (req, res) => {
  const { dprtmnt_id } = req.params;
  try {
    const [rows] = await db3.execute(`
      SELECT 
        ct.curriculum_id,
        pt.program_id,
        pt.program_code,
        pt.program_description,
        pt.major,
        d.dprtmnt_id,
        d.dprtmnt_name
      FROM curriculum_table AS ct
      INNER JOIN program_table AS pt ON pt.program_id = ct.program_id
      INNER JOIN dprtmnt_curriculum_table AS dc ON ct.curriculum_id = dc.curriculum_id
      INNER JOIN dprtmnt_table AS d ON dc.dprtmnt_id = d.dprtmnt_id
      WHERE d.dprtmnt_id = ?

    `, [dprtmnt_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No curriculum data found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching curriculum data:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/person_data/:person_id/:role", async (req, res) => {
  try {
    const { person_id, role } = req.params;
    let userData;

    if (role === "registrar") {
      // ✅ Fetch registrar info directly from user_accounts (db3)
      const [rows] = await db3.query(
        `SELECT 
           ua.person_id, 
           ua.profile_picture AS profile_image,
           ua.first_name AS fname,
           ua.middle_name AS mname,
           ua.last_name AS lname,
           ua.role,
           ua.employee_id,
           ua.email
         FROM user_accounts AS ua
         WHERE ua.person_id = ? AND ua.role = 'registrar'`,
        [person_id]
      );
      userData = rows[0];

    } else if (role === "faculty") {
      const [rows] = await db3.query(
        `SELECT 
           pt.person_id, 
           pt.profile_image, 
           pt.fname, 
           pt.lname, 
           'faculty' AS role, 
           pt.email
         FROM prof_table AS pt
         WHERE pt.person_id = ?`,
        [person_id]
      );
      userData = rows[0];

    } else if (role === "student") {
      const [rows] = await db3.query(
        `SELECT 
           pt.person_id, 
           pt.profile_img AS profile_image, 
           pt.first_name AS fname, 
           pt.middle_name AS mname,
           pt.last_name AS lname, 
           ua.role, 
           ua.email
         FROM person_table AS pt
         INNER JOIN user_accounts AS ua 
           ON pt.person_id = ua.person_id
         WHERE pt.person_id = ? AND ua.role = 'student'`,
        [person_id]
      );
      userData = rows[0];

    } else if (role === "applicant") {
      const [rows] = await db.query(
        `SELECT 
           p.person_id, 
           p.profile_img AS profile_image, 
           p.first_name AS fname, 
           p.middle_name AS mname,
           p.last_name AS lname, 
           ua.role, 
           ua.email
         FROM person_table AS p
         INNER JOIN user_accounts AS ua 
           ON p.person_id = ua.person_id
         WHERE p.person_id = ? AND ua.role = ?`,
        [person_id, role]
      );
      userData = rows[0];

    } else {
      return res.status(400).send({ message: "Invalid role provided" });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData);
  } catch (err) {
    console.error("❌ Error fetching person data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Fetch interview schedule for an applicant
// ✅ Fetch interview schedule + scores for an applicant
app.get("/api/applicant-interview-schedule/:applicantNumber", async (req, res) => {
  const { applicantNumber } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        ies.schedule_id,
        ies.day_description,
        ies.building_description,
        ies.room_description,
        ies.start_time,
        ies.end_time,
        ies.interviewer,
        ps.exam_result,
        ps.qualifying_result,
        ps.interview_result
      FROM interview_applicants ia
      JOIN interview_exam_schedule ies 
        ON ia.schedule_id = ies.schedule_id
      LEFT JOIN person_status_table ps 
        ON ia.applicant_id = ps.applicant_id
      WHERE ia.applicant_id = ?
      LIMIT 1
      `,
      [applicantNumber]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "No interview schedule found for this applicant" });
    }
  } catch (err) {
    console.error("❌ Error fetching interview schedule:", err);
    res.status(500).json({ message: "Server error fetching interview schedule" });
  }
});
app.get("/api/interview_applicants/:applicantId", async (req, res) => {
  try {
    const { applicantId } = req.params;
    const [rows] = await db.query(
      "SELECT status FROM interview_applicants WHERE applicant_id = ? ORDER BY id DESC LIMIT 1",
      [applicantId]
    );

    if (rows.length === 0) {
      return res.json({ status: null });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching interview applicant status:", err);
    res.status(500).send("Server error");
  }
});

// 09/16/2025
app.get("/api/student_number", async (req, res) => {
  try {
    const [rows] = await db3.execute(`
      SELECT DISTINCT 
        snt.student_number,
        pst.campus, 
        pst.last_name, 
        pst.first_name, 
        pst.middle_name, 
        pgt.program_description, 
        smt.semester_id,
        smt.semester_description, 
        smt.semester_code, 
        pgt.program_code, 
        pgt.program_id,
        dpt.dprtmnt_id, 
        dpt.dprtmnt_code, 
        pst.created_at,
        es.status,
        es.en_remarks,
        ylt.year_level_description,
        es.curriculum_id
      FROM enrolled_subject AS es
        INNER JOIN curriculum_table AS cmt ON es.curriculum_id = cmt.curriculum_id
        INNER JOIN program_table AS pgt ON cmt.program_id = pgt.program_id
        INNER JOIN year_table AS yrt ON cmt.year_id = yrt.year_id
        INNER JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
        INNER JOIN semester_table AS smt ON sy.semester_id = smt.semester_id
        INNER JOIN student_status_table AS sst ON es.student_number = sst.student_number
        INNER JOIN year_level_table AS ylt ON sst.year_level_id = ylt.year_level_id
        INNER JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
        INNER JOIN person_table AS pst ON snt.person_id = pst.person_id
        INNER JOIN dprtmnt_curriculum_table AS dct ON cmt.curriculum_id = dct.curriculum_id
        INNER JOIN dprtmnt_table AS dpt ON dct.dprtmnt_id = dpt.dprtmnt_id;
    `,);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No student data found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching curriculum data:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/get_class_details/:userID', async (req, res) => {
  const { userID } = req.params;
  try {
    const query = `
      SELECT DISTINCT
        snt.student_number, 
        es.status, 
        pst.first_name, 
        pst.middle_name, 
        pst.last_name, 
        pt.program_code, 
        st.description AS section_description, 
        ct.course_id,
        ct.course_description,
        rt.room_description,
        tt.school_time_start,
        tt.school_time_end,
        rdt.description AS day,
        tt.department_section_id, 
        ct.course_code, 
        sy.year_id, 
        sy.semester_id  
      FROM enrolled_subject AS es
      INNER JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
      INNER JOIN person_table AS pst ON snt.person_id = pst.person_id
      INNER JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
      INNER JOIN program_table AS pt ON cct.program_id = pt.program_id
      INNER JOIN course_table AS ct ON es.course_id = ct.course_id
      INNER JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
      LEFT JOIN time_table AS tt
      ON tt.school_year_id = es.active_school_year_id 
      AND tt.department_section_id = es.department_section_id 
      AND tt.course_id = es.course_id 
      INNER JOIN prof_table AS pft ON tt.professor_id = pft.prof_id
      INNER JOIN year_table AS yr ON sy.year_id = yr.year_id
      INNER JOIN semester_table AS smt ON sy.semester_id = smt.semester_id
      INNER JOIN room_day_table AS rdt ON tt.room_day = rdt.id
      INNER JOIN room_table AS rt ON tt.department_room_id = rt.room_id
    WHERE pft.person_id = ?
    `;
    const [result] = await db3.query(query, [userID]);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error("Server Error: ", err);
    res.status(500).send({ message: "Internal Error", err });
  }
});

app.post("/api/grades/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { course_id, active_school_year_id, department_section_id } = req.body;

    if (!course_id || !active_school_year_id || !department_section_id) {
      return res.status(400).json({ error: "Please Select a class to upload the file on" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log("📄 Parsed Excel rows:", rows);
    const studentNumbers = rows
      .map(r => String(r["Student Number"] || r["student_number"]))
      .filter(n => n);

    if (studentNumbers.length === 0) {
      return res.status(400).json({ error: "No valid student numbers" });
    }

    console.log("🔎 Matching with:", {
      studentNumbers,
      course_id,
      active_school_year_id,
      department_section_id
    });

    // Get existing students in DB that match identifiers
    const [existingStudents] = await db3.query(
      `SELECT student_number
       FROM enrolled_subject
       WHERE student_number IN (?) 
         AND course_id = ? 
         AND active_school_year_id = ? 
         AND department_section_id = ?`,
      [studentNumbers, course_id, active_school_year_id, department_section_id]
    );

    if (existingStudents.length === 0) {
      return res.status(400).json({ error: "No matching students found in database" });
    }

    const existingStudentNumbers = existingStudents.map(s => s.student_number);
    let skippedCount = 0;

    console.log("🧠 existingStudentNumbers:", existingStudentNumbers);
    for (const row of rows) {
      const studentNumber = String(row["Student Number"] || row["student_number"]);

      // Skip if student doesn't exist in DB
      if (!existingStudentNumbers.includes(studentNumber)) {
        skippedCount++;
        continue;
      }

      let midterm = row["midterm"];
      let finals = row["finals"];
      let en_remarks = 0;

      if (
        String(midterm).toLowerCase() === "inc" ||
        String(finals).toLowerCase() === "inc"
      ) {
        en_remarks = 3;
        await db3.query(
          `UPDATE enrolled_subject
           SET midterm = ?, finals = ?, final_grade = "0.00", grades_status = "INC"
           WHERE student_number = ? 
             AND course_id = ? 
             AND active_school_year_id = ? 
             AND department_section_id = ?`,
          [midterm, finals, studentNumber, course_id, active_school_year_id, department_section_id]
        );
        continue;
      }

      midterm = parseFloat(midterm);
      finals = parseFloat(finals);
      if (!isNaN(midterm)) midterm = parseFloat(midterm.toFixed(2));
      if (!isNaN(finals)) finals = parseFloat(finals.toFixed(2));

      const finalGrade = ((midterm + finals) / 2).toFixed(2);

      if (midterm === 5.0 || finals === 5.0) {
        en_remarks = 2;
      } else if (finalGrade == 0.0 || finals < 1.0 || midterm < 1.0 || isNaN(midterm) || isNaN(finals)) {
        en_remarks = 0;
      } else if (finalGrade >= 1.0 && finalGrade <= 3.0) {
        en_remarks = 1;
      } else if (finalGrade >= 3.25) {
        en_remarks = 2;
      } else {
        en_remarks = 0;
      }

      await db3.query(
        `UPDATE enrolled_subject
         SET midterm = ?, finals = ?, final_grade = ?, en_remarks = ?
         WHERE student_number = ? 
           AND course_id = ? 
           AND active_school_year_id = ? 
           AND department_section_id = ?`,
        [
          midterm,
          finals,
          finalGrade,
          en_remarks,
          studentNumber,
          course_id,
          active_school_year_id,
          department_section_id
        ]
      );
    }

    res.json({
      success: true,
      message: `Grades updated successfully! Skipped: ${skippedCount}`
    });
  } catch (err) {
    console.error("❌ Excel import error:", err);
    res.status(500).json({ error: "Failed to import Excel" });
  }
});

app.get("/api/section_assigned_to/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const [rows] = await db3.execute(`
      SELECT DISTINCT
		st.id AS section_id,
        st.description AS section_description,
        pgt.program_code
      FROM time_table t
      JOIN room_day_table d ON d.id = t.room_day
      INNER JOIN active_school_year_table asy ON t.school_year_id = asy.id
      INNER JOIN dprtmnt_section_table AS dst ON t.department_section_id = dst.id
      INNER JOIN section_table AS st ON dst.section_id = st.id
      INNER JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
      INNER JOIN program_table AS pgt ON cct.program_id = pgt.program_id
      INNER JOIN prof_table AS pft ON t.professor_id = pft.prof_id
      WHERE pft.person_id = ?
    `, [userID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No Section data found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching curriculum data:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/add_grades", async (req, res) => {
  const { midterm, finals, final_grade, en_remarks, student_number, subject_id } = req.body;
  console.log("Received data:", { midterm, finals, final_grade, en_remarks, student_number, subject_id });

  try {
    const [rows] = await db3.execute(`SELECT id, description, status FROM period_status WHERE id = 3`);
    if (!rows.length || rows[0].status !== 1) {
      return res.status(400).json({ message: "The uploading of grades is still not open." });
    }

    const isIncomplete =
      String(midterm).toLowerCase() === "inc" ||
      String(midterm).toLowerCase() === "incomplete" ||
      String(finals).toLowerCase() === "inc" ||
      String(finals).toLowerCase() === "incomplete";

    if (isIncomplete) {
      const [result] = await db3.execute(
        `UPDATE enrolled_subject 
        SET midterm = ?, finals = ? , final_grade= "0.00", grades_status = 'INC', en_remarks = 3
        WHERE student_number = ? AND course_id = ?`,
        [midterm, finals, student_number, subject_id]
      );

      return result.affectedRows > 0
        ? res.status(200).json({ message: "Grades marked as INC successfully!" })
        : res.status(404).json({ message: "No matching record found to update." });
    }

    const [result] = await db3.execute(
      `UPDATE enrolled_subject 
      SET midterm = ?, finals = ?, final_grade = ?, grades_status = ?, en_remarks = ?
      WHERE student_number = ? AND course_id = ?`,
      [midterm, finals, final_grade, final_grade, en_remarks, student_number, subject_id]
    );

    return result.affectedRows > 0
      ? res.status(200).json({ message: "Grades updated successfully!" })
      : res.status(404).json({ message: "No matching record found to update." });

  } catch (err) {
    console.error("Failed to update grades:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Mark applicant as emailed (action = 1)
app.put("/api/interview_applicants/:applicant_id/action", async (req, res) => {
  const { applicant_id } = req.params;

  try {
    const [result] = await db.execute(
      "UPDATE admission.interview_applicants SET action = 1 WHERE applicant_id = ?",
      [applicant_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.json({ success: true, message: "Applicant marked as emailed" });
  } catch (err) {
    console.error("❌ Error updating action:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post("/api/send-email", async (req, res) => {
  const { to, subject, html, senderName } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ message: "Missing email fields" });
  }

  try {
    await transporter.sendMail({
      from: `"${senderName || "Enrollment Office"}" <${process.env.EMAIL_USER}>`, // ✅ Neutral name + dynamic email
      to,
      subject,
      html,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});


app.put("/api/interview_applicants/accept-top", async (req, res) => {
  const { count, dprtmnt_id } = req.body;

  // Validate inputs
  if (!count || isNaN(count) || count <= 0)
    return res.status(400).json({ message: "Invalid count" });
  if (!dprtmnt_id)
    return res.status(400).json({ message: "Missing department ID" });

  try {
    // 1️⃣ Select top applicants from Waiting List
    const [rows] = await db3.query(
      `SELECT ps.applicant_id
       FROM admission.person_status_table ps
       JOIN admission.interview_applicants ia ON ia.applicant_id = ps.applicant_id
       JOIN admission.applicant_numbering_table ant ON ant.applicant_number = ps.applicant_id
       JOIN admission.person_table p ON p.person_id = ant.person_id
       JOIN enrollment.dprtmnt_curriculum_table dct ON dct.curriculum_id = p.academicProgram
       WHERE ia.status = 'Waiting List' AND dct.dprtmnt_id = ?
       ORDER BY ((ps.qualifying_result + ps.interview_result)/2) DESC
       LIMIT ?`,
      [Number(dprtmnt_id), Number(count)]
    );

    if (!rows.length)
      return res.status(404).json({ message: "No Waiting List applicants found" });

    const ids = rows.map(r => r.applicant_id);

    // 2️⃣ Update their status to Accepted
    const [updateResult] = await db3.query(
      `UPDATE admission.interview_applicants 
       SET status = 'Accepted' 
       WHERE applicant_id IN (?)`,
      [ids]
    );

    res.json({
      message: `Updated ${ids.length} applicants to Accepted in department ${dprtmnt_id}`,
      updated: ids,
    });
  } catch (err) {
    console.error("Error accepting top applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/college/persons", async (req, res) => {
  try {
    // STEP 1: Get all eligible persons (from ENROLLMENT DB)
    const [persons] = await db.execute(`
      SELECT p.*, SUBSTRING(a.applicant_number, 5, 1) AS middle_code
      FROM admission.person_table p
      JOIN admission.person_status_table ps ON p.person_id = ps.person_id
      LEFT JOIN admission.applicant_numbering_table AS a
        ON p.person_id = a.person_id
      WHERE ps.student_registration_status = 0
      AND p.person_id NOT IN (SELECT person_id FROM enrollment.student_numbering_table)
    `);

    if (persons.length === 0) return res.json([]);

    const personIds = persons.map(p => p.person_id);

    // STEP 2: Get all applicant numbers for those person_ids (from ADMISSION DB)
    const [applicantNumbers] = await db.query(`
      SELECT applicant_number, person_id 
      FROM applicant_numbering_table 
      WHERE person_id IN (?)
    `, [personIds]);

    // Create a quick lookup map
    const applicantMap = {};
    for (let row of applicantNumbers) {
      applicantMap[row.person_id] = row.applicant_number;
    }

    // STEP 3: Merge applicant_number into each person object
    const merged = persons.map(person => ({
      ...person,
      applicant_number: applicantMap[person.person_id] || null
    }));

    res.json(merged);

  } catch (err) {
    console.error("❌ Error merging person + applicant ID:", err);
    res.status(500).send("Server error");
  }
});


// 📊 Applicants per Month (this year + last 5 months)
app.get("/api/applicants-per-month", async (req, res) => {
  try {
    const [rows] = await db.query(`
      WITH months AS (
        SELECT DATE_FORMAT(MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL (n-1) MONTH, '%Y-%m') AS month
        FROM (
          SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 
          UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
        ) numbers
      )
      SELECT 
        m.month,
        COALESCE(COUNT(p.person_id), 0) AS total
      FROM months m
      LEFT JOIN admission.person_table p
        ON DATE_FORMAT(p.created_at, '%Y-%m') = m.month
        AND YEAR(p.created_at) = YEAR(CURDATE())
      GROUP BY m.month
      ORDER BY m.month ASC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching applicants per month:", err);
    res.status(500).json({ error: "Failed to fetch applicants per month" });
  }
});


app.put("/api/update_profile_image/:person_id", profileUpload.single("profileImage"), async (req, res) => {
  const { person_id } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filename = req.file.filename;

  try {
    // Update DB (set filename to the same name we saved)
    const [result] = await db3.query(
      "UPDATE prof_table SET profile_image = ? WHERE person_id = ?",
      [filename, person_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json({
      message: "✅ Profile image updated successfully",
      filename,
    });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Database update failed" });
  }
});

// Create announcement
// Use multer for parsing FormData
app.post(
  "/api/announcements",
  announcementUpload.single("image"), // field name must match frontend
  async (req, res) => {
    const { title, content, valid_days, target_role, creator_role, creator_id } = req.body;

    const allowedDays = ["1", "3", "7", "14", "30", "60", "90"];
    if (!valid_days || !allowedDays.includes(valid_days.toString())) {
      return res.status(400).json({ error: "Invalid valid_days value" });
    }

    if (!["student", "faculty", "applicant"].includes(target_role)) {
      return res.status(400).json({ error: "Invalid target_role" });
    }

    if (!["student", "faculty", "applicant"].includes(creator_role)) {
      return res.status(400).json({ error: "Invalid creator_role" });
    }

    try {
      // Step 1: Insert announcement
      const [result] = await db.execute(
        `INSERT INTO announcements 
         (title, content, valid_days, target_role, creator_role, creator_id, expires_at) 
         VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
        [title, content, valid_days, target_role, creator_role, creator_id, valid_days]
      );

      const announcementId = result.insertId;
      let filename = null;

      // Step 2: If file uploaded, rename + save
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        filename = `${announcementId}_announcement${ext}`;
        const oldPath = path.join(__dirname, "uploads", req.file.filename);
        const newPath = path.join(__dirname, "uploads", filename);

        fs.renameSync(oldPath, newPath);

        await db.execute("UPDATE announcements SET file_path = ? WHERE id = ?", [
          filename,
          announcementId,
        ]);
      }

      res.json({
        message: "Announcement created",
        id: announcementId,
        file: filename,
      });
    } catch (err) {
      console.error("Error inserting announcement:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Update announcement by ID
// Update announcement by ID with optional image
app.put(
  "/api/announcements/:id",
  announcementUpload.single("image"), // multer handles uploaded file
  async (req, res) => {
    const { id } = req.params;
    const { title, content, valid_days, target_role } = req.body;

    const allowedDays = ["1", "3", "7", "14", "30", "60", "90"];
    if (!allowedDays.includes(valid_days.toString())) {
      return res.status(400).json({ error: "Invalid valid_days value" });
    }

    if (!["student", "faculty", "applicant"].includes(target_role)) {
      return res.status(400).json({ error: "Invalid target_role" });
    }

    try {
      // Step 1: Update basic fields
      const [result] = await db.execute(
        `UPDATE announcements
         SET title = ?, content = ?, valid_days = ?, target_role = ?,
             expires_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE id = ?`,
        [title, content, valid_days, target_role, valid_days, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      // Step 2: Handle uploaded image if exists
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = `${id}_announcement${ext}`;
        const oldPath = path.join(__dirname, "uploads", req.file.filename);
        const newPath = path.join(__dirname, "uploads", filename);

        fs.renameSync(oldPath, newPath);

        await db.execute(
          "UPDATE announcements SET file_path = ? WHERE id = ?",
          [filename, id]
        );
      }

      res.json({ message: "Announcement updated successfully" });
    } catch (err) {
      console.error("Error updating announcement:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);


// Fetch valid announcements
app.get("/api/announcements", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM announcements WHERE expires_at > NOW() ORDER BY created_at DESC"
  );
  res.json(rows);
});

app.delete("/api/announcements/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "DELETE FROM announcements WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/announcements/upload", announcementUpload.single("file"), async (req, res) => {
  const { title, content, valid_days, target_role, creator_role, creator_id } = req.body;

  try {
    // Step 1: Insert announcement without file_path
    const [result] = await db.execute(
      `INSERT INTO announcements (title, content, valid_days, target_role, creator_role, creator_id, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [title, content, valid_days, target_role, creator_role, creator_id, valid_days]
    );

    const announcementId = result.insertId;

    let filename = null;

    if (req.file) {
      // Step 2: Build new filename using ID
      const ext = path.extname(req.file.originalname).toLowerCase();
      filename = `${announcementId}_announcement_2025${ext}`;
      const oldPath = path.join(__dirname, "uploads", req.file.filename);
      const newPath = path.join(__dirname, "uploads", filename);

      // Step 3: Rename file
      fs.renameSync(oldPath, newPath);

      // Step 4: Update announcement with file_path
      await db.execute(
        "UPDATE announcements SET file_path = ? WHERE id = ?",
        [filename, announcementId]
      );
    }

    res.json({ message: "Announcement created with image", id: announcementId, file: filename });
  } catch (err) {
    console.error("Error uploading announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Only announcements for students
app.get("/api/announcements/student", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM announcements WHERE target_role = 'student' AND expires_at > NOW() ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching student announcements:", err);
    res.status(500).json({ error: "Database error" });
  }
});



app.get("/api/college/persons", async (req, res) => {
  try {
    // STEP 1: Get all eligible persons (from ENROLLMENT DB)
    const [persons] = await db.execute(`
      SELECT p.*, SUBSTRING(a.applicant_number, 5, 1) AS middle_code
      FROM admission.person_table p
      JOIN admission.person_status_table ps ON p.person_id = ps.person_id
      LEFT JOIN admission.applicant_numbering_table AS a
        ON p.person_id = a.person_id
      WHERE ps.student_registration_status = 0
      AND p.person_id NOT IN (SELECT person_id FROM enrollment.student_numbering_table)
    `);

    if (persons.length === 0) return res.json([]);

    const personIds = persons.map(p => p.person_id);

    // STEP 2: Get all applicant numbers for those person_ids (from ADMISSION DB)
    const [applicantNumbers] = await db.query(`
      SELECT applicant_number, person_id 
      FROM applicant_numbering_table 
      WHERE person_id IN (?)
    `, [personIds]);

    // Create a quick lookup map
    const applicantMap = {};
    for (let row of applicantNumbers) {
      applicantMap[row.person_id] = row.applicant_number;
    }

    // STEP 3: Merge applicant_number into each person object
    const merged = persons.map(person => ({
      ...person,
      applicant_number: applicantMap[person.person_id] || null
    }));

    res.json(merged);

  } catch (err) {
    console.error("❌ Error merging person + applicant ID:", err);
    res.status(500).send("Server error");
  }
});

app.post("/api/import-xlsx", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Parse Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: "A",
      defval: "",
      raw: true
    });

    // --- Step 1: Extract metadata (before subjects) ---
    const metadata = {};
    for (const row of rows) {
      if (String(row.A || "").trim().toLowerCase().includes("subject code")) break;
      if (row.A) {
        const key = String(row.A).trim().replace(":", "");
        const value = row.B ? String(row.B).trim() : "";
        metadata[key] = value;
      }
    }

    console.log("📌 Extracted metadata:", metadata);

    const studentNumber = metadata["Student No."] || metadata["Student No"];
    const program_code = metadata["Program"];
    const curriculum_raw = metadata["Curriculum"];
    const year_description = curriculum_raw ? curriculum_raw.split("-")[0].trim() : null;

    if (!studentNumber || !program_code || !year_description) {
      return res.status(400).json({ error: "Missing required metadata from Excel" });
    }

    // --- Step 2: DB lookups for program/year ---
    const [[yearRow]] = await db3.query(
      "SELECT year_id FROM year_table WHERE year_description = ?",
      [year_description]
    );
    if (!yearRow) return res.status(400).json({ error: `Year ${year_description} not found` });

    const [[program]] = await db3.query(
      "SELECT program_id FROM program_table WHERE program_code = ?",
      [program_code]
    );
    if (!program) return res.status(400).json({ error: `Program code ${program_code} not found` });

    const [[curriculum]] = await db3.query(
      "SELECT curriculum_id FROM curriculum_table WHERE year_id = ? AND program_id = ?",
      [yearRow.year_id, program.program_id]
    );
    if (!curriculum) return res.status(400).json({ error: "No matching curriculum found" });

    // --- Step 3: Process each School Year + Semester block ---
    const results = [];
    let currentSY = null;
    let subjects = [];

    for (const row of rows) {
      const text = String(row.A || "").trim();

      // Detect new "School Year" row
      if (/^School Year/i.test(text)) {
        // If we already collected subjects for previous block, save them
        if (currentSY && subjects.length > 0) {
          results.push({ ...currentSY, subjects });
          subjects = [];
        }

        // Extract School Year + Semester
        const syMatch = text.match(/School Year:\s*(\d{4})-(\d{4})/i);
        const normalizedSchoolYear = syMatch ? syMatch[1] : null;

        let normalizedSemester = null;
        if (/first semester/i.test(text)) normalizedSemester = "First Semester";
        else if (/second semester/i.test(text)) normalizedSemester = "Second Semester";
        else if (/summer/i.test(text)) normalizedSemester = "Summer";

        currentSY = { normalizedSchoolYear, normalizedSemester };
      }
      // Detect Subject rows
      else if (currentSY && row.A && !/^Subject Code/i.test(text)) {
        const finalGradeRaw = String(row.D || "").trim();
        let finalGrade = 0.0;
        let enRemark = 0;
        let status = 0;

        if (finalGradeRaw) {
          if (["INC", "INCOMPLETE"].includes(finalGradeRaw.toUpperCase())) {
            enRemark = 3; // Incomplete
          } else {
            const gradeNum = parseFloat(finalGradeRaw);
            if (!isNaN(gradeNum)) {
              finalGrade = gradeNum;
              if (gradeNum >= 3.0) {
                enRemark = 2; // Failed
                status = 1;
              } else if (gradeNum < 3.0) {
                enRemark = 1; // Passed
                status = 0;
              }
            }
          }
        }

        subjects.push({
          course_code: row.A,
          description: row.B || "",
          units: row.C || 0,
          final_grade: finalGrade,
          en_remark: enRemark,
          status
        });
      }
    }

    // Push last block if exists
    if (currentSY && subjects.length > 0) {
      results.push({ ...currentSY, subjects });
    }

    console.log("📘 Parsed results:", results);

    // --- Step 4: Insert/Update per block ---
    let totalInserted = 0, totalUpdated = 0;
    for (const block of results) {
      const { normalizedSchoolYear, normalizedSemester, subjects } = block;

      if (!normalizedSchoolYear || !normalizedSemester) continue;

      const [[schoolYearRow]] = await db3.query(
        "SELECT year_id FROM year_table WHERE year_description = ?",
        [normalizedSchoolYear]
      );
      if (!schoolYearRow) continue;

      const [[semesterRow]] = await db3.query(
        "SELECT semester_id FROM semester_table WHERE semester_description = ?",
        [normalizedSemester]
      );
      if (!semesterRow) continue;

      const [[activeYear]] = await db3.query(
        "SELECT id FROM active_school_year_table WHERE year_id = ? AND semester_id = ?",
        [schoolYearRow.year_id, semesterRow.semester_id]
      );
      if (!activeYear) continue;

      const active_school_year_id = activeYear.id;

      for (const subj of subjects) {
        if (!subj.course_code) continue;

        const [[course]] = await db3.query(
          "SELECT course_id FROM course_table WHERE course_code = ?",
          [subj.course_code]
        );
        if (!course) continue;

        const [result] = await db3.query(
          `UPDATE enrolled_subject
           SET final_grade = ?, en_remarks = ?, status = ?
           WHERE student_number = ?
             AND course_id = ?
             AND curriculum_id = ?
             AND active_school_year_id = ?`,
          [
            subj.final_grade,
            subj.en_remark,
            subj.status,
            studentNumber,
            course.course_id,
            curriculum.curriculum_id,
            active_school_year_id
          ]
        );

        if (result.affectedRows > 0) {
          totalUpdated += result.affectedRows;
        } else {
          await db3.query(
            `INSERT INTO enrolled_subject
              (student_number, curriculum_id, course_id, active_school_year_id,
               midterm, finals, final_grade, en_remarks, department_section_id, status, fe_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              studentNumber,
              curriculum.curriculum_id,
              course.course_id,
              active_school_year_id,
              0.0,
              0.0,
              subj.final_grade,
              subj.en_remark,
              req.body.department_section_id || 0,
              subj.status,
              0
            ]
          );
          totalInserted++;
        }
      }
    }

    res.json({
      success: true,
      updated: totalUpdated,
      inserted: totalInserted,
      studentNumber,
      program_code,
      year_description
    });
  } catch (err) {
    console.error("❌ Excel import error:", err);
    res.status(500).json({ error: "Failed to import Excel" });
  }
});

// 📌 Get interviewer schedules + applicants
app.get("/api/interviewers", async (req, res) => {
  const { query } = req.query;

  try {
    // 1. Find schedules that match interviewer name
    const [schedules] = await db.query(
      "SELECT * FROM interview_exam_schedule WHERE interviewer LIKE ?",
      [`%${query}%`]
    );

    if (schedules.length === 0) {
      return res.json([]);
    }

    // 2. For each schedule, attach applicants
    const results = await Promise.all(
      schedules.map(async (sched) => {
        const [applicants] = await db.query(
          `
          SELECT 
            ia.applicant_id AS applicant_number,
            ia.email_sent,
            ia.status,
            p.person_id,
            p.last_name,
            p.first_name,
            p.middle_name,
            p.program,
            s.interviewer,
            s.building_description,
            s.room_description,
            s.day_description,
            s.start_time,
            s.end_time
          FROM interview_applicants ia
          JOIN applicant_numbering_table an 
            ON ia.applicant_id = an.applicant_number
          JOIN person_table p 
            ON an.person_id = p.person_id
          JOIN interview_exam_schedule s
            ON ia.schedule_id = s.schedule_id
          WHERE ia.schedule_id = ?
          `,
          [sched.schedule_id]
        );

        return { schedule: sched, applicants };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Error in /api/interviewers:", err);
    res.status(500).send("Server error");
  }
});

// 09/26/2025


// GET person details by student_number (Enrollment DB)
app.get("/api/person_id/:student_number", async (req, res) => {
  try {
    const [rows] = await db3.query(
      `SELECT 
         p.*,
         sn.student_number
       FROM student_numbering_table sn
       JOIN person_table p ON p.person_id = sn.person_id
       WHERE sn.student_number = ?`,
      [req.params.student_number]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.json(rows[0]); // ✅ full person data + student_number
  } catch (err) {
    console.error("Error fetching person by student_number:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ NEW: Get persons (Enrollment DB) with student_number
app.get("/api/enrollment_upload_documents", async (req, res) => {
  try {
    const [persons] = await db3.query(`
      SELECT 
        p.person_id,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.profile_img,
        p.height,
        p.generalAverage,
        p.emailAddress,
        sn.student_number
      FROM person_table p
      LEFT JOIN student_numbering_table sn ON p.person_id = sn.person_id
    `);

    res.status(200).json(persons);
  } catch (error) {
    console.error("❌ Error fetching enrollment upload documents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get person by person_id (Enrollment DB)
app.get("/api/enrollment_person/:person_id", async (req, res) => {
  try {
    const [rows] = await db3.query(
      `SELECT * FROM person_table WHERE person_id = ?`,
      [req.params.person_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching enrollment person:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update person (Enrollment DB) safely
app.put("/api/enrollment_person/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove person_id from payload
    delete updates.person_id;

    // If nothing left, just skip
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.json({ message: "No valid fields to update, skipping." });
    }

    // Build SET clause dynamically
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const values = fields.map(field => updates[field]);

    await db3.query(
      `UPDATE person_table SET ${setClause} WHERE person_id = ?`,
      [...values, id]
    );

    res.json({ message: "Enrollment person updated successfully" });
  } catch (err) {
    console.error("❌ Error updating enrollment person:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/student-person-data/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db3.query(
      `SELECT * FROM person_table WHERE person_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching person data:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// Add near your other GET routes in server.js

// Get person_id by applicant_number
app.get("/api/person-by-applicant/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ? LIMIT 1",
      [applicant_number]
    );
    if (!rows.length) return res.status(404).json({ message: "Applicant not found" });
    res.json({ person_id: rows[0].person_id });
  } catch (err) {
    console.error("Error fetching person by applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/document_status/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
         ru.document_status     AS upload_document_status,
         rt.id                  AS requirement_id,
         ua.email               AS evaluator_email,
         ua.role                AS evaluator_role,
         ua.employee_id         AS evaluator_employee_id,
         ua.first_name          AS evaluator_fname,
         ua.middle_name         AS evaluator_mname,
         ua.last_name           AS evaluator_lname,
         ru.created_at,
         ru.last_updated_by
       FROM applicant_numbering_table AS ant
       LEFT JOIN requirement_uploads AS ru 
         ON ant.person_id = ru.person_id
       LEFT JOIN requirements_table AS rt 
         ON ru.requirements_id = rt.id
       LEFT JOIN enrollment.user_accounts ua
         ON ru.last_updated_by = ua.person_id
       WHERE ant.applicant_number = ?
         AND rt.is_verifiable = 1
       ORDER BY ru.created_at DESC`,
      [applicant_number]
    );

    // 🟥 If no uploads found
    if (!rows || rows.length === 0) {
      return res.json({
        document_status: "On Process",
        evaluator: null
      });
    }

    const statuses = rows.map(r => r.upload_document_status);
    const latest = rows[0];

    // 🟡 Determine final document status
    let finalStatus = "On Process";
    if (statuses.every(s => s === "Disapproved / Program Closed")) {
      finalStatus = "Disapproved / Program Closed";
    } else if (statuses.every(s => s === "Documents Verified & ECAT")) {
      finalStatus = "Documents Verified & ECAT";
    }

    // 🟢 Build evaluator display name with employee ID
    // 🟢 Build evaluator display name with employee ID (no HTML tags)
    let actorEmail = null;
    let actorName = "Unknown - System";

    if (latest?.evaluator_email) {
      const role = latest.evaluator_role?.toUpperCase() || "UNKNOWN";
      const empId = latest.evaluator_employee_id
        ? `(${latest.evaluator_employee_id})`
        : "";
      const lname = latest.evaluator_lname || "";
      const fname = latest.evaluator_fname || "";
      const mname = latest.evaluator_mname || "";

      actorEmail = latest.evaluator_email;
      actorName = `${role} ${empId} - ${lname}, ${fname} ${mname}`.trim();
      latest.evaluator_display = `BY: ${actorName} (${actorEmail})`;
    } else {
      latest.evaluator_display = `BY: Unknown - System`;
    }

    // 📝 Create notification message
    const message = `✏️ Document status for Applicant #${applicant_number} set to "${finalStatus}"`;

    // // 💾 Insert notification (only if there's evaluator info)
    // await db.query(
    //   `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name)
    //    VALUES (?, ?, ?, ?, ?)`,
    //   ['update', message, applicant_number, actorEmail, actorName]
    // );

    // // 📢 Emit notification via socket.io
    // io.emit('notification', {
    //   type: 'update',
    //   message,
    //   applicant_number,
    //   actor_email: actorEmail,
    //   actor_name: actorName,
    //   timestamp: new Date().toISOString()
    // });

    return res.json({
      document_status: finalStatus,
      evaluator: latest
    });

  } catch (err) {
    console.error("❌ Error fetching document status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api/document_status/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;
  const { document_status, user_id } = req.body;

  try {
    // ✅ 1. Get requirement IDs that should reflect in overall document_status
    const [verifiableReqs] = await db.query(
      `SELECT id FROM requirements_table WHERE is_verifiable = 1`
    );

    const ids = verifiableReqs.map(r => r.id);
    if (ids.length === 0) {
      return res.status(400).json({ message: "No verifiable requirements found." });
    }

    // ✅ 2. Update only those requirements for the applicant
    await db.query(
      `UPDATE requirement_uploads
       SET document_status = ?,
           last_updated_by = ?
       WHERE person_id = (SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?)
       AND requirements_id IN (?)`,
      [document_status, user_id, applicant_number, ids]
    );

    res.json({ message: "📌 Document status updated dynamically for verifiable requirements." });
  } catch (err) {
    console.error("Error updating document status:", err);
    res.status(500).json({ error: "Failed to update document status" });
  }
});



// Check if applicant's 4 required documents are verified
app.get("/api/document_status/check/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;

  try {
    // Get person_id
    const [personResult] = await db.query(
      "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
      [applicant_number]
    );

    if (personResult.length === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const person_id = personResult[0].person_id;

    // Check statuses for requirement IDs 1,2,3,4
    const [docs] = await db.query(
      `SELECT document_status 
       FROM requirement_uploads 
       WHERE person_id = ? AND requirements_id IN (1,2,3,4)`,
      [person_id]
    );

    if (docs.length < 4) {
      return res.json({ verified: false, message: "Missing required documents" });
    }

    const allVerified = docs.every((d) => d.document_status === "Documents Verified & ECAT");

    res.json({ verified: allVerified });
  } catch (err) {
    console.error("Error checking document status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/pages", async (req, res) => {
  const { page_description, page_group } = req.body;

  try {
    const [result] = await db3.query(
      `INSERT INTO page_table (page_description, page_group) VALUES (?, ?)`,
      [page_description, page_group]
    );

    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Error inserting page data:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/pages", async (req, res) => {
  try {
    const [rows] = await db3.query(`SELECT * FROM page_table ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching pages:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  const { page_description, page_group } = req.body;

  try {
    await db3.query(
      `UPDATE page_table SET page_description = ?, page_group = ? WHERE id = ?`,
      [page_description, page_group, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating page:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/pages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db3.query(`DELETE FROM page_table WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting page:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Get all access for one user
app.get("/api/page_access/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db3.query(
      "SELECT * FROM page_access WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/page_access/:userId/:pageId", async (req, res) => {
  const { userId, pageId } = req.params;

  try {
    const [existing] = await db3.query(
      "SELECT * FROM page_access WHERE user_id = ? AND page_id = ?",
      [userId, pageId]
    );

    if (existing.length > 0) {
      // If record already exists, don't insert again
      return res.status(400).json({ success: false, message: "Access already exists" });
    }

    const [result] = await db3.query(
      `INSERT INTO page_access (user_id, page_id, page_privilege)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE page_privilege = VALUES(page_privilege)`,
      [userId, pageId]
    );

    // ✅ If query succeeded (affected rows > 0)
    if (result.affectedRows > 0) {
      res.json({ success: true, action: "added" });
    } else {
      res.json({ success: false, action: "no changes" });
    }
  } catch (err) {
    console.error("Error inserting access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/page_access/:userId/:pageId", async (req, res) => {
  const { userId, pageId } = req.params;
  try {
    await db3.query(
      "DELETE FROM page_access WHERE user_id = ? AND page_id = ?",
      [userId, pageId]
    );
    res.json({ success: true, action: "deleted" });
  } catch (err) {
    console.error("Error deleting access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/page_access/:userId/:pageId", async (req, res) => {
  const { userId, pageId } = req.params;
  try {
    const [rows] = await db3.query(
      "SELECT page_privilege FROM page_access WHERE user_id = ? AND page_id = ?",
      [userId, pageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The user has not been given a privilege to access this page.",
        hasAccess: false
      });
    }

    res.json(rows[0]);
    console.log(rows[0]);
  } catch (err) {
    console.error("Error checking access:", err);
    res.status(500).json({ error: "Database error" });
  }
});


app.get("/api/program_evaluation/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    const [rows] = await db3.query(`
        SELECT DISTINCT pt.last_name, pt.first_name, pt.middle_name, pgt.program_code, yt.year_description, pgt.program_description, snt.student_number, dpt.dprtmnt_name FROM enrolled_subject AS es
        LEFT JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
        LEFT JOIN person_table AS pt ON snt.person_id = pt.person_id
        LEFT JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
        LEFT JOIN program_table AS pgt ON cct.program_id = pgt.program_id
        LEFT JOIN year_table AS yt ON cct.year_id = yt.year_id
        LEFT JOIN dprtmnt_curriculum_table AS dct ON cct.curriculum_id = dct.curriculum_id
        LEFT JOIN dprtmnt_table AS dpt ON dct.dprtmnt_id = dpt.dprtmnt_id
        WHERE es.student_number = ?;
      `, [student_number]);

    if (rows.length === 0) {
      res.status(404).send({ message: "Student is not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log("Database Error", error);
    res.status(500).send({ message: "Database/Server Error", error });
  }
});

app.get("/api/program_evaluation/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    const [rows] = await db3.query(`
        SELECT DISTINCT 
          pt.last_name, pt.first_name, pt.middle_name, pt.gender, pgt.program_code, pgt.major, yt.year_description, pgt.program_description, snt.student_number, dpt.dprtmnt_name FROM enrolled_subject AS es
        LEFT JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
        LEFT JOIN person_table AS pt ON snt.person_id = pt.person_id
        LEFT JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
        LEFT JOIN program_table AS pgt ON cct.program_id = pgt.program_id
        LEFT JOIN year_table AS yt ON cct.year_id = yt.year_id
        LEFT JOIN dprtmnt_curriculum_table AS dct ON cct.curriculum_id = dct.curriculum_id
        LEFT JOIN dprtmnt_table AS dpt ON dct.dprtmnt_id = dpt.dprtmnt_id
        WHERE es.student_number = ?;
      `, [student_number]);

    if (rows.length === 0) {
      return res.status(404).send({ message: "Student is not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log("Database Error", error);
    res.status(500).send({ message: "Database/Server Error", error });
  }
});

app.get("/api/program_evaluation/details/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    const [rows] = await db3.query(`
        SELECT 
          es.id as enrolled_id, 
          es.final_grade, 
          ct.course_code, 
          st.description as section,
          ct.course_description, 
          ct.course_unit, 
          ct.lab_unit, 
          smt.semester_description, 
          smt.semester_id,
          sy.id as school_year, 
          ct.course_id,
          yt.year_description as current_year,
          yt.year_id,
          pgt.program_code,
          es.en_remarks,
          yt.year_description + 1 as next_year
        FROM enrolled_subject AS es
          LEFT JOIN course_table AS ct ON es.course_id = ct.course_id
          LEFT JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
          LEFT JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
          LEFT JOIN section_table AS st ON dst.section_id = st.id
          LEFT JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
          LEFT JOIN program_table AS pgt ON cct.program_id = pgt.program_id
          LEFT JOIN semester_table AS smt ON sy.semester_id = smt.semester_id
          LEFT JOIN year_table AS yt ON sy.year_id = yt.year_id
        WHERE es.student_number= ?;
    `, [student_number]);

    if (rows.length === 0) {
      return res.status(404).send({ message: "Student Data is not found" });
    }

    res.json(rows);
  } catch (err) {
    res.status(500).send({ message: "Student Data is not found" });
    console.log("Database / Server Error", err)
  }
});

// ✅ GET registrar name (or any prof by role)
app.get("/api/scheduled-by/:role", async (req, res) => {
  const { role } = req.params;

  try {
    const [rows] = await db3.query(
      `
      SELECT first_name, middle_name, last_name 
      FROM user_accounts 
      WHERE role = ? 
      LIMIT 1
      `,
      [role]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No user found for that role" });
    }

    const { first_name, middle_name, last_name } = rows[0];
    const fullName = `${first_name || ""} ${middle_name ? middle_name + " " : ""}${last_name || ""}`.trim();

    res.json({ fullName });
  } catch (err) {
    console.error("❌ Error fetching user by role:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Toggle submitted_medical (1 = checked, 0 = unchecked)
app.put("/api/submitted-medical/:upload_id", async (req, res) => {
  const { upload_id } = req.params;
  const { submitted_medical, user_person_id } = req.body;

  console.log(upload_id, submitted_medical, user_person_id);


  try {
    // 1️⃣ Find person_id for logging
    const [[row]] = await db.query(
      "SELECT person_id FROM requirement_uploads WHERE upload_id = ?",
      [upload_id]
    );
    if (!row) return res.status(404).json({ error: "Upload not found" });

    console.log(row)

    const person_id = row.person_id;

    // 2️⃣ Applicant info
    const [[appInfo]] = await db.query(`
      SELECT ant.applicant_number, pt.last_name, pt.first_name, pt.middle_name
      FROM applicant_numbering_table ant
      JOIN person_table pt ON ant.person_id = pt.person_id
      WHERE ant.person_id = ?
    `, [person_id]);

    const applicant_number = appInfo?.applicant_number || "Unknown";
    const fullName = `${appInfo?.last_name || ""}, ${appInfo?.first_name || ""} ${appInfo?.middle_name?.charAt(0) || ""}.`;

    // 3️⃣ Toggle medical status
    await db.query(
      "UPDATE requirement_uploads SET submitted_medical = ? WHERE person_id = ?",
      [submitted_medical ? 1 : 0, person_id]
    );

    // 4️⃣ Log notification
    const action = submitted_medical ? "✅ Medical submitted" : "❌ Medical unsubmitted";
    const message = `${action} (Applicant #${applicant_number} - ${fullName})`;

    let actorEmail = "earistmis@gmail.com";
    let actorName = "SYSTEM";
    if (user_person_id) {
      const [actorRows] = await db3.query(
        "SELECT email, role FROM user_accounts WHERE person_id = ? LIMIT 1",
        [user_person_id]
      );
      if (actorRows.length > 0) {
        actorEmail = actorRows[0].email;
        actorName = actorRows[0].role ? actorRows[0].role.toUpperCase() : actorEmail;
      }
    }

    await db.query(
      `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [submitted_medical ? "submit_medical" : "unsubmit_medical", message, applicant_number, actorEmail, actorName]
    );

    io.emit("notification", {
      type: submitted_medical ? "submit_medical" : "unsubmit_medical",
      message,
      applicant_number,
      actor_email: actorEmail,
      actor_name: actorName,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message });
  } catch (err) {
    console.error("❌ Error toggling submitted_medical:", err);
    res.status(500).json({ error: "Failed to toggle submitted medical" });
  }
});
app.get("/api/requirements", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, description FROM requirements_table ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requirements" });
  }
});



app.get("/api/program_evaluation/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    const [rows] = await db3.query(`
        SELECT DISTINCT 
          pt.last_name, pt.first_name, pt.schoolLastAttended, pt.profile_img AS profile_image, pt.yearGraduated, pt.middle_name, pt.gender, pt.birthOfDate, rt.id AS requirements, pgt.program_code, pgt.major, yt.year_description, pgt.program_description, snt.student_number, dpt.dprtmnt_name FROM enrolled_subject AS es
        LEFT JOIN student_numbering_table AS snt ON es.student_number = snt.student_number
        LEFT JOIN person_table AS pt ON snt.person_id = pt.person_id
        LEFT JOIN curriculum_table AS cct ON es.curriculum_id = cct.curriculum_id
        LEFT JOIN program_table AS pgt ON cct.program_id = pgt.program_id
        LEFT JOIN year_table AS yt ON cct.year_id = yt.year_id
        LEFT JOIN dprtmnt_curriculum_table AS dct ON cct.curriculum_id = dct.curriculum_id
        LEFT JOIN dprtmnt_table AS dpt ON dct.dprtmnt_id = dpt.dprtmnt_id
        LEFT JOIN requirement_uploads AS ru ON pt.person_id = ru.person_id
        LEFT JOIN requirements_table AS rt ON ru.requirements_id = rt.id
        WHERE es.student_number = ?;
      `, [student_number]);

    if (rows.length === 0) {
      return res.status(404).send({ message: "Student is not found" });
    }

    const studentInfo = {
      ...rows[0], // keep the first row’s data
      requirements: [...new Set(rows.map(r => r.requirements).filter(Boolean))]
    };

    res.json(studentInfo);
    console.log(studentInfo);
  } catch (error) {
    console.log("Database Error", error);
    res.status(500).send({ message: "Database/Server Error", error });
  }
});

app.get("/api/program_evaluation/details/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    const [rows] = await db3.query(`
        SELECT 
          es.id as enrolled_id, 
          es.final_grade, 
          ct.course_code, 
          st.description as section,
          ct.course_description, 
          ct.course_unit, 
          ct.lab_unit, 
          smt.semester_description, 
          smt.semester_id,
          sy.id as school_year, 
          ct.course_id,
          yt.year_description as current_year,
          yt.year_id,
          pgt.program_code,
          pgt.program_description,
          es.en_remarks,
          yt.year_description + 1 as next_year
        FROM enrolled_subject AS es
          LEFT JOIN course_table AS ct ON es.course_id = ct.course_id
          LEFT JOIN active_school_year_table AS sy ON es.active_school_year_id = sy.id
          LEFT JOIN dprtmnt_section_table AS dst ON es.department_section_id = dst.id
          LEFT JOIN section_table AS st ON dst.section_id = st.id
          LEFT JOIN curriculum_table AS cct ON dst.curriculum_id = cct.curriculum_id
          LEFT JOIN program_table AS pgt ON cct.program_id = pgt.program_id
          LEFT JOIN semester_table AS smt ON sy.semester_id = smt.semester_id
          LEFT JOIN year_table AS yt ON sy.year_id = yt.year_id
        WHERE es.student_number= ?;
    `, [student_number]);

    if (rows.length === 0) {
      return res.status(404).send({ message: "Student Data is not found" });
    }

    res.json(rows);
  } catch (err) {
    res.status(500).send({ message: "Student Data is not found" });
    console.log("Database / Server Error", err)
  }
});


app.post("/api/pages", async (req, res) => {
  const { page_description, page_group } = req.body;

  try {
    const [result] = await db3.query(
      `INSERT INTO page_table (page_description, page_group) VALUES (?, ?)`,
      [page_description, page_group]
    );

    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Error inserting page data:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/pages", async (req, res) => {
  try {
    const [rows] = await db3.query(`SELECT * FROM page_table ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching pages:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  const { page_description, page_group } = req.body;

  try {
    await db3.query(
      `UPDATE page_table SET page_description = ?, page_group = ? WHERE id = ?`,
      [page_description, page_group, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating page:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/pages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db3.query(`DELETE FROM page_table WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting page:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Get all access for one user
app.get("/api/page_access/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db3.query(
      "SELECT * FROM page_access WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/page_access/:userId/:pageId", async (req, res) => {
  const { userId, pageId } = req.params;

  try {
    const [existing] = await db3.query(
      "SELECT * FROM page_access WHERE user_id = ? AND page_id = ?",
      [userId, pageId]
    );

    if (existing.length > 0) {
      // If record already exists, don't insert again
      return res.status(400).json({ success: false, message: "Access already exists" });
    }

    const [result] = await db3.query(
      `INSERT INTO page_access (user_id, page_id, page_privilege)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE page_privilege = VALUES(page_privilege)`,
      [userId, pageId]
    );

    // ✅ If query succeeded (affected rows > 0)
    if (result.affectedRows > 0) {
      res.json({ success: true, action: "added" });
    } else {
      res.json({ success: false, action: "no changes" });
    }
  } catch (err) {
    console.error("Error inserting access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/page_access/:userId/:pageId", async (req, res) => {
  const { userId, pageId } = req.params;
  try {
    await db3.query(
      "DELETE FROM page_access WHERE user_id = ? AND page_id = ?",
      [userId, pageId]
    );
    res.json({ success: true, action: "deleted" });
  } catch (err) {
    console.error("Error deleting access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/page_access/:userId/:pageId", async (req, res) => {
  const { userId, pageId } = req.params;
  try {
    const [rows] = await db3.query(
      "SELECT page_privilege FROM page_access WHERE user_id = ? AND page_id = ?",
      [userId, pageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The user has not been given a privilege to access this page.",
        hasAccess: false
      });
    }

    res.json(rows[0]);
    console.log(rows[0]);
  } catch (err) {
    console.error("Error checking access:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Upload and update registrar profile picture
app.put("/api/update_profile_image/:person_id", upload.single("profileImage"), async (req, res) => {
  const { person_id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // ✅ Save filename in db3.user_accounts
    const [result] = await db3.query(
      `UPDATE user_accounts 
       SET profile_picture = ? 
       WHERE person_id = ?`,
      [file.filename, person_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile picture updated successfully.",
      filename: file.filename,
    });
  } catch (err) {
    console.error("❌ Error updating profile picture:", err);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
});


// ✅ Fetch ALL medical records
app.get("/api/medical-requirements", async (req, res) => {
  try {
    const [rows] = await db3.query("SELECT * FROM medical_requirements ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching medical requirements:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Fetch ONE record by student_number (smart version using person_id fallback)
app.get("/api/medical-requirements/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    // Step 1: Try direct match in medical_requirements
    const [directMatch] = await db3.query(
      "SELECT * FROM medical_requirements WHERE student_number = ?",
      [student_number]
    );

    if (directMatch.length > 0) {
      return res.json(directMatch[0]); // found directly
    }

    // Step 2: If not found, check if that number belongs to a person in student_numbering_table
    const [studentMatch] = await db3.query(
      "SELECT person_id FROM student_numbering_table WHERE student_number = ?",
      [student_number]
    );

    if (studentMatch.length === 0) {
      return res.status(404).json({ message: "No record found for this student number." });
    }

    const person_id = studentMatch[0].person_id;

    // Step 3: Find a medical record using the same person_id
    const [viaPerson] = await db3.query(
      "SELECT * FROM medical_requirements WHERE person_id = ?",
      [person_id]
    );

    if (viaPerson.length === 0) {
      return res.status(404).json({ message: "No medical record linked to this person yet." });
    }

    res.json(viaPerson[0]);
  } catch (err) {
    console.error("Error fetching record:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Create or update medical record
app.put("/api/medical-requirements", async (req, res) => {
  const { student_number, ...data } = req.body;

  if (!student_number) {
    return res.status(400).json({ message: "Student number is required." });
  }

  try {
    const [existing] = await db3.query(
      "SELECT id FROM medical_requirements WHERE student_number = ?",
      [student_number]
    );

    if (existing.length > 0) {
      await db3.query("UPDATE medical_requirements SET ? WHERE student_number = ?", [data, student_number]);
      res.json({ success: true, message: "Record updated" });
    } else {
      await db3.query("INSERT INTO medical_requirements SET ?", [{ student_number, ...data }]);
      res.json({ success: true, message: "Record created" });
    }
  } catch (err) {
    console.error("Error saving medical record:", err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Fetch Dental Assessment Record (Smart version)
app.get("/api/dental-assessment/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    // Step 1: Try direct match in medical_requirements
    const [directRows] = await db3.query(
      "SELECT * FROM medical_requirements WHERE student_number = ?",
      [student_number]
    );

    let record = directRows[0];

    // Step 2: If not found, find same person via student_numbering_table
    if (!record) {
      const [studentMatch] = await db3.query(
        "SELECT person_id FROM student_numbering_table WHERE student_number = ?",
        [student_number]
      );

      if (studentMatch.length > 0) {
        const person_id = studentMatch[0].person_id;

        const [viaPerson] = await db3.query(
          "SELECT * FROM medical_requirements WHERE person_id = ?",
          [person_id]
        );

        if (viaPerson.length > 0) {
          record = viaPerson[0];
        }
      }
    }

    // Step 3: If still not found, create blank record
    if (!record) {
      await db3.query("INSERT INTO medical_requirements (student_number) VALUES (?)", [student_number]);
      const [newRows] = await db3.query(
        "SELECT * FROM medical_requirements WHERE student_number = ?",
        [student_number]
      );
      record = newRows[0];
    }

    // Step 4: Parse JSON fields safely
    const jsonFields = [
      "dental_upper_right",
      "dental_upper_left",
      "dental_lower_right",
      "dental_lower_left",
    ];

    jsonFields.forEach((key) => {
      if (!record[key]) record[key] = Array(8).fill("");
      else if (typeof record[key] === "string") {
        try {
          record[key] = JSON.parse(record[key]);
        } catch {
          record[key] = Array(8).fill("");
        }
      }
    });

    res.json(record);
  } catch (err) {
    console.error("❌ Error fetching dental data:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create or Update Dental Assessment
app.put("/api/dental-assessment", async (req, res) => {
  const { student_number, ...data } = req.body;

  if (!student_number) {
    return res.status(400).json({ message: "Student number is required." });
  }

  try {
    // Stringify JSON fields before saving
    const jsonFields = [
      "dental_upper_right",
      "dental_upper_left",
      "dental_lower_right",
      "dental_lower_left",
    ];

    jsonFields.forEach((key) => {
      if (data[key] && typeof data[key] !== "string") {
        data[key] = JSON.stringify(data[key]);
      }
    });

    // Check if record exists by student_number
    const [existing] = await db3.query(
      "SELECT id FROM medical_requirements WHERE student_number = ?",
      [student_number]
    );

    if (existing.length > 0) {
      await db3.query("UPDATE medical_requirements SET ? WHERE student_number = ?", [data, student_number]);
      res.json({ success: true, message: "Dental record updated" });
    } else {
      // Optionally fetch person_id from student_numbering_table
      const [studentRow] = await db3.query(
        "SELECT person_id FROM student_numbering_table WHERE student_number = ?",
        [student_number]
      );
      const person_id = studentRow.length > 0 ? studentRow[0].person_id : null;

      await db3.query("INSERT INTO medical_requirements SET ?", [{ student_number, person_id, ...data }]);
      res.json({ success: true, message: "Dental record created" });
    }
  } catch (err) {
    console.error("❌ Error saving dental data:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PHYSICAL & NEUROLOGICAL EXAMINATION API
app.get("/api/physical-neuro/:student_number", async (req, res) => {
  const { student_number } = req.params;
  try {
    const [rows] = await db3.query(
      "SELECT * FROM medical_requirements WHERE student_number = ?",
      [student_number]
    );

    if (rows.length === 0) {
      // Create a blank record if none exists
      await db3.query("INSERT INTO medical_requirements (student_number) VALUES (?)", [student_number]);
      const [newRows] = await db3.query(
        "SELECT * FROM medical_requirements WHERE student_number = ?",
        [student_number]
      );
      return res.json(newRows[0]);
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching physical/neuro data:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/physical-neuro", async (req, res) => {
  const { student_number, ...data } = req.body;
  if (!student_number) return res.status(400).json({ message: "Student number is required." });

  try {
    const [existing] = await db3.query(
      "SELECT id FROM medical_requirements WHERE student_number = ?",
      [student_number]
    );

    if (existing.length > 0) {
      await db3.query("UPDATE medical_requirements SET ? WHERE student_number = ?", [data, student_number]);
      res.json({ success: true, message: "Physical/Neuro record updated" });
    } else {
      await db3.query("INSERT INTO medical_requirements SET ?", [{ student_number, ...data }]);
      res.json({ success: true, message: "Physical/Neuro record created" });
    }
  } catch (err) {
    console.error("Error saving physical/neuro data:", err);
    res.status(500).json({ error: err.message });
  }
});




app.post('/insert_question', async (req, res) => {
  const { question, choice1, choice2, choice3, choice4, choice5, school_year_id } = req.body;

  try {
    // Step 1: Insert question
    const [result] = await db3.query(
      `
      INSERT INTO question_table 
      (question_description, first_choice, second_choice, third_choice, fourth_choice, fifth_choice)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [question, choice1, choice2, choice3, choice4, choice5]
    );

    // Step 2: Get the inserted question's ID
    const question_id = result.insertId;

    // Step 3: Insert into evaluation_table using that question_id
    await db3.query(
      `
      INSERT INTO evaluation_table (school_year_id, question_id)
      VALUES (?, ?)
      `,
      [school_year_id, question_id]
    );

    res.status(200).send({ message: "Question successfully added and linked to evaluation!" });
  } catch (err) {
    console.error("Database / Server Error:", err);
    res.status(500).send({ message: "Database / Server Error", error: err });
  }
});

app.get('/get_questions', async (req, res) => {
  try {
    const [rows] = await db3.query(`
      SELECT qt.question_description, qt.first_choice, qt.second_choice, qt.third_choice, qt.fourth_choice, qt.fifth_choice, qt.id AS question_id, sy.year_id, sy.semester_id, sy.id as school_year, et.created_at FROM question_table AS qt
      INNER JOIN evaluation_table AS et ON qt.id = et.question_id
      INNER JOIN active_school_year_table AS sy ON et.school_year_id = sy.id
      ORDER BY qt.id ASC;
    `);
    res.status(200).send(rows);
  } catch (err) {
    console.error("Database / Server Error:", err);
    res.status(500).send({ message: "Database / Server Error", error: err });
  }
});

app.put('/update_question/:id', async (req, res) => {
  const { question, choice1, choice2, choice3, choice4, choice5 } = req.body;
  const { id } = req.params;

  try {
    const updateQuery = `
      UPDATE question_table
      SET question_description = ?, 
          first_choice = ?, 
          second_choice = ?, 
          third_choice = ?, 
          fourth_choice = ?, 
          fifth_choice = ?
      WHERE id = ?;
    `;
    await db3.query(updateQuery, [question, choice1, choice2, choice3, choice4, choice5, id]);
    res.status(200).send({ message: "Question successfully updated" });
  } catch (err) {
    console.error("Database / Server Error:", err);
    res.status(500).send({ message: "Database / Server Error", error: err });
  }
});

app.get('/get_questions_for_evaluation', async (req, res) => {
  try {
    const [rows] = await db3.query(`
      SELECT qt.question_description, qt.first_choice, qt.second_choice, qt.third_choice, qt.fourth_choice, qt.fifth_choice, qt.id AS question_id, sy.year_id, sy.semester_id, sy.id as school_year, et.created_at FROM question_table AS qt
      INNER JOIN evaluation_table AS et ON qt.id = et.question_id
      INNER JOIN active_school_year_table AS sy ON et.school_year_id = sy.id
      WHERE sy.astatus = 1 ORDER BY qt.id ASC;
    `);
    res.status(200).send(rows);
  } catch (err) {
    console.error("Database / Server Error:", err);
    res.status(500).send({ message: "Database / Server Error", error: err });
  }
});

app.post('/api/student_evaluation', async (req, res) => {
  const { student_number, school_year_id, prof_id, course_id, question_id, answer } = req.body;

  try {
    await db3.execute(
      `
      INSERT INTO student_evaluation_table
      (student_number, school_year_id, prof_id, course_id, question_id, question_answer)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [student_number, school_year_id, prof_id, course_id, question_id, answer]
    );

    await db3.execute(
      `
      UPDATE enrolled_subject 
      SET fe_status = 1
      WHERE student_number = ? AND course_id = ? AND active_school_year_id = ?
      `,
      [student_number, course_id, school_year_id]
    );

    res.status(200).send({ message: "Evaluation successfully recorded!" });
  } catch (err) {
    console.error("Database / Server Error:", err);
    res.status(500).send({ message: "Database / Server Error", error: err.message });
  }
});

app.get("/api/applicant-status/:applicant_id", async (req, res) => {
  const { applicant_id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT status FROM interview_applicants WHERE applicant_id = ? LIMIT 1",
      [applicant_id]
    );

    if (rows.length === 0) {
      return res.json({ found: false, message: "Applicant not found" });
    }

    res.json({ found: true, status: rows[0].status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/api/applicant-has-score/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM applicant_numbering_table WHERE applicant_number = ? LIMIT 1",
      [applicant_number]
    );

    if (rows.length > 0) {
      res.json({ hasScore: true, score: rows[0] });
    } else {
      res.json({ hasScore: false });
    }
  } catch (err) {
    console.error("Error checking applicant score:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ✅ Fetch Qualifying, Interview, and Exam Results by Person ID
app.get("/api/person_status/:person_id", async (req, res) => {
  const { person_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT qualifying_result, interview_result, exam_result
      FROM person_status_table
      WHERE person_id = ?
      LIMIT 1
      `,
      [person_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No status record found for this person" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching person_status:", err);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/get_prof_data/:id", async (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT pt.prof_id, pt.profile_image, pt.email, pt.fname, pt.mname, pt.lname FROM prof_table AS pt
    WHERE pt.person_id = ?
  `;

  try {
    const [rows] = await db3.query(query, [id]);
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/announcements/faculty", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM announcements WHERE target_role = 'faculty' AND expires_at > NOW() ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching student announcements:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/faculty_evaluation", async (req, res) => {
  const { prof_id, year_id, semester_id } = req.query;
  try {
    const [rows] = await db3.query(
      `
      SELECT 
        pt.prof_id,
        st.course_id,
        ct.course_code,
        sy.year_id, 
        sy.semester_id,
        SUM(CASE WHEN st.question_answer = 1 THEN 1 ELSE 0 END) AS answered_one_count,
        SUM(CASE WHEN st.question_answer = 2 THEN 1 ELSE 0 END) AS answered_two_count,
        SUM(CASE WHEN st.question_answer = 3 THEN 1 ELSE 0 END) AS answered_three_count,
        SUM(CASE WHEN st.question_answer = 4 THEN 1 ELSE 0 END) AS answered_four_count,
        SUM(CASE WHEN st.question_answer = 5 THEN 1 ELSE 0 END) AS answered_five_count
      FROM student_evaluation_table AS st
      INNER JOIN prof_table AS pt ON st.prof_id = pt.prof_id
      INNER JOIN active_school_year_table AS sy ON st.school_year_id = sy.id
      INNER JOIN question_table AS qt ON st.question_id = qt.id
      INNER JOIN course_table AS ct ON st.course_id = ct.course_id
      WHERE pt.prof_id = ? AND sy.year_id = ? AND sy.semester_id = ?
      GROUP BY st.course_id, pt.prof_id;
      `, [prof_id, year_id, semester_id]
    );

    if (rows.length === 0) {
      return res.json([]);
    }

    res.json(rows);
    console.log(rows);
  } catch (err) {
    console.error("❌ Error fetching person_status:", err);
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/insert-logs/faculty/:prof_id", async (req, res) => {
  const { prof_id } = req.params;
  const { message, type } = req.body;

  try {

    const [professorData] = await db3.query(
      "SELECT * FROM prof_table WHERE prof_id = ?", [prof_id]
    );

    if (professorData === 0) {
      res.status(400).send({ message: "No Data found" })
    }

    const prof = professorData[0];
    const profID = prof.prof_id
    const fullName = `${prof.lname}, ${prof.fname} ${prof.mname}`;
    const email = prof.email

    await db.query(
      `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type, message, profID, email, fullName]
    );

    res.json({ success: true, message: "Log inserted" });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/verification-status/:applicant_number", async (req, res) => {
  const { applicant_number } = req.params;

  try {
    // ✅ Step 1: Get person_id from applicant_number
    const [personRows] = await db.query(
      "SELECT person_id FROM applicant_numbering_table WHERE applicant_number = ?",
      [applicant_number]
    );
    if (personRows.length === 0) {
      return res.json({ verified: false, reason: "Applicant not found" });
    }

    const personId = personRows[0].person_id;

    // ✅ Step 2: Count how many verifiable requirements exist
    const [requirements] = await db.query(
      "SELECT COUNT(*) AS total_required FROM requirements_table WHERE is_verifiable = 1"
    );
    const totalRequired = requirements[0]?.total_required || 0;

    // ✅ Step 3: Count how many of those requirements were submitted & verified
    const [verifiedUploads] = await db.query(
      `
      SELECT COUNT(DISTINCT requirements_id) AS total_verified
      FROM requirement_uploads
      WHERE person_id = ?
      AND document_status = 'Documents Verified & ECAT'
      `,
      [personId]
    );
    const totalVerified = verifiedUploads[0]?.total_verified || 0;

    // ✅ Step 4: Check if applicant has an exam schedule
    const [schedule] = await db.query(
      `
      SELECT ees.*
      FROM exam_applicants ea
      JOIN entrance_exam_schedule ees ON ea.schedule_id = ees.schedule_id
      WHERE ea.applicant_id = ?
      `,
      [applicant_number]
    );
    const hasSchedule = schedule.length > 0;

    // ✅ Step 5: Determine if verified
    const fullyVerified = totalVerified >= totalRequired && hasSchedule;

    res.json({
      verified: fullyVerified,
      totalRequired,
      totalVerified,
      hasSchedule,
    });
  } catch (error) {
    console.error("Error checking applicant verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/student_data_as_applicant/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [[person]] = await db3.query(`
      SELECT 
        pt.*,
        ant.applicant_number
      FROM enrollment.person_table pt
      JOIN admission.applicant_numbering_table ant ON pt.person_id = ant.person_id
      WHERE pt.person_id = ? OR ant.applicant_number = ?
      LIMIT 1
    `, [id, id]);

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    // get latest document status + evaluator
    const [rows] = await db.query(`
      SELECT 
        ru.document_status    AS upload_document_status,
        rt.id                 AS requirement_id,
        ua.email              AS evaluator_email,
        ua.role               AS evaluator_role,
        pr.fname              AS evaluator_fname,
        pr.mname              AS evaluator_mname,
        pr.lname              AS evaluator_lname,
        ru.created_at,
        ru.last_updated_by
      FROM enrollment.requirement_uploads AS ru
      LEFT JOIN enrollment.requirements_table AS rt ON ru.requirements_id = rt.id
      LEFT JOIN enrollment.user_accounts ua ON ru.last_updated_by = ua.person_id
      LEFT JOIN enrollment.prof_table pr   ON ua.person_id = pr.person_id
      WHERE ru.person_id = ?
      ORDER BY ru.created_at DESC
      LIMIT 1
    `, [person.person_id]);

    if (rows.length > 0) {
      person.document_status = rows[0].upload_document_status || "On process";
      person.evaluator = rows[0];
    } else {
      person.document_status = "On process";
      person.evaluator = null;
    }

    res.json(person);
  } catch (err) {
    console.error("❌ Error fetching person_with_applicant:", err);
    res.status(500).json({ error: "Failed to fetch person" });
  }
});

app.get("/uploads/by-student/:student_number", async (req, res) => {
  const student_number = req.params.student_number;

  try {
    const [personResult] = await db3.query(
      "SELECT person_id FROM student_numbering_table WHERE student_number = ?",
      [student_number]
    );

    if (personResult.length === 0) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const person_id = personResult[0].person_id;

    const [uploads] = await db3.query(`
      SELECT 
        ru.upload_id,
        ru.requirements_id,
        ru.person_id,
        ru.file_path,
        ru.original_name,
        ru.remarks,
        ru.status,
        ru.document_status,
        ru.registrar_status,
        ru.created_at,
        rt.description,
        CASE
          WHEN LOWER(rt.description) LIKE '%form 138%' THEN 'Form138'
          WHEN LOWER(rt.description) LIKE '%good moral%' THEN 'GoodMoralCharacter'
          WHEN LOWER(rt.description) LIKE '%birth certificate%' THEN 'BirthCertificate'
          WHEN LOWER(rt.description) LIKE '%graduating class%' THEN 'CertificateOfGraduatingClass'
          WHEN LOWER(rt.description) LIKE '%vaccine card%' THEN 'VaccineCard'
          ELSE 'Unknown'
        END AS short_label,
        ua.email AS evaluator_email,
        ua.role  AS evaluator_role,
        pr.lname AS evaluator_lname,
        pr.fname AS evaluator_fname,
        pr.mname AS evaluator_mname
      FROM requirement_uploads ru
      JOIN requirements_table rt 
        ON ru.requirements_id = rt.id
      LEFT JOIN user_accounts ua 
        ON ru.last_updated_by = ua.person_id
      LEFT JOIN .prof_table pr 
        ON ua.person_id = pr.person_id
      WHERE ru.person_id = ?;
    `, [person_id]);

    res.status(200).json(uploads);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.get("/api/document_status/:student_number", async (req, res) => {
  const { student_number } = req.params;

  try {
    const [rows] = await db3.query(
      `SELECT 
         ru.document_status     AS upload_document_status,
         rt.id                  AS requirement_id,
         ua.email               AS evaluator_email,
         ua.role                AS evaluator_role,
         ua.employee_id         AS evaluator_employee_id,
         ua.first_name          AS evaluator_fname,
         ua.middle_name         AS evaluator_mname,
         ua.last_name           AS evaluator_lname,
         ru.created_at,
         ru.last_updated_by
       FROM student_numbering_table AS snt
       LEFT JOIN requirement_uploads AS ru ON snt.person_id = ru.person_id
       LEFT JOIN requirements_table AS rt ON ru.requirements_id = rt.id
       LEFT JOIN enrollment.user_accounts ua ON ru.last_updated_by = ua.person_id
       WHERE snt.student_number = ? AND rt.is_verifiable = 1
       ORDER BY ru.created_at DESC`,
      [student_number]
    );

    // 🟥 If no uploads found
    if (!rows || rows.length === 0) {
      return res.json({
        document_status: "On Process",
        evaluator: null
      });
    }

    const statuses = rows.map(r => r.upload_document_status);
    const latest = rows[0];

    // 🟡 Determine final document status
    let finalStatus = "On Process";
    if (statuses.every(s => s === "Disapproved / Program Closed")) {
      finalStatus = "Disapproved / Program Closed";
    } else if (statuses.every(s => s === "Documents Verified & ECAT")) {
      finalStatus = "Documents Verified & ECAT";
    }

    // 🟢 Build evaluator display name with employee ID
    // 🟢 Build evaluator display name with employee ID (no HTML tags)
    let actorEmail = null;
    let actorName = "Unknown - System";

    if (latest?.evaluator_email) {
      const role = latest.evaluator_role?.toUpperCase() || "UNKNOWN";
      const empId = latest.evaluator_employee_id
        ? `(${latest.evaluator_employee_id})`
        : "";
      const lname = latest.evaluator_lname || "";
      const fname = latest.evaluator_fname || "";
      const mname = latest.evaluator_mname || "";

      actorEmail = latest.evaluator_email;
      actorName = `${role} ${empId} - ${lname}, ${fname} ${mname}`.trim();
      latest.evaluator_display = `BY: ${actorName} (${actorEmail})`;
    } else {
      latest.evaluator_display = `BY: Unknown - System`;
    }

    // 📝 Create notification message
    const message = `✏️ Document status for Student #${student_number} set to "${finalStatus}"`;

    // 💾 Insert notification (only if there's evaluator info)
    await db.query(
      `INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['update', message, student_number, actorEmail, actorName]
    );

    // 📢 Emit notification via socket.io
    io.emit('notification', {
      type: 'update',
      message,
      student_number,
      actor_email: actorEmail,
      actor_name: actorName,
      timestamp: new Date().toISOString()
    });

    return res.json({
      document_status: finalStatus,
      evaluator: latest
    });

  } catch (err) {
    console.error("❌ Error fetching document status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/student_upload_documents_data", async (req, res) => {
  try {
    const [persons] = await db3.query(`
      SELECT 
        pt.person_id,
        pt.first_name,
        pt.middle_name,
        pt.last_name,
        pt.profile_img,
        pt.height,
        pt.generalAverage1,
        pt.emailAddress,
        snt.student_number
      FROM person_table pt
      LEFT JOIN student_numbering_table snt ON pt.person_id = snt.person_id
    `);

    res.status(200).json(persons);
  } catch (error) {
    console.error("❌ Error fetching upload documents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/uploads/student/remarks/:upload_id", async (req, res) => {
  const { upload_id } = req.params;
  const { status, remarks, document_status, user_id } = req.body;

  try {
    await db3.query(
      `UPDATE requirement_uploads 
       SET status = ?, remarks = ?, document_status = ?, last_updated_by = ?
       WHERE upload_id = ?`,
      [status, remarks || null, document_status || null, user_id, upload_id]
    );

    res.json({ message: "Document status updated successfully." });
  } catch (err) {
    console.error("Error updating document status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/student/upload", upload.single("file"), async (req, res) => {
  const { requirements_id, person_id, remarks } = req.body;

  if (!requirements_id || !person_id || !req.file) {
    return res.status(400).json({ error: "Missing required fields or file" });
  }

  try {
    // 🔹 Applicant info
    const [[appInfo]] = await db3.query(`
      SELECT snt.student_number, pt.last_name, pt.first_name, pt.middle_name
      FROM student_numbering_table snt
      LEFT JOIN person_table pt ON snt.person_id = pt.person_id
      WHERE snt.person_id = ?
    `, [person_id]);

    const student_number = appInfo?.student_number || "Unknown";
    const fullName = `${appInfo?.last_name || ""}, ${appInfo?.first_name || ""} ${appInfo?.middle_name?.charAt(0) || ""}.`;

    // 🔹 Requirement description + short label
    const [descRows] = await db3.query(
      "SELECT description, short_label FROM requirements_table WHERE id = ?",
      [requirements_id]
    );

    if (!descRows.length) return res.status(404).json({ message: "Requirement not found" });

    const { description, short_label } = descRows[0];

    // ✅ Use the short_label directly from DB
    const shortLabel = short_label || "Unknown";

    const year = new Date().getFullYear();
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ✅ Construct filename
    const filename = `${applicant_number}_${shortLabel}_${year}${ext}`;
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const finalPath = path.join(uploadDir, filename);

    // 🔹 Delete any existing file for the same applicant + requirement
    const [existingFiles] = await db3.query(
      `SELECT upload_id, file_path FROM requirement_uploads
       WHERE person_id = ? AND requirements_id = ?`,
      [person_id, requirements_id]
    );

    for (const file of existingFiles) {
      const oldPath = path.join(__dirname, "uploads", file.file_path);

      try {
        await fs.promises.unlink(oldPath);
      } catch (err) {
        if (err.code !== "ENOENT") console.warn("File delete warning:", err.message);
      }

      await db3.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [file.upload_id]);
    }

    // 🔹 Save new file
    await fs.promises.writeFile(finalPath, req.file.buffer);

    await db3.query(
      `INSERT INTO requirement_uploads 
        (requirements_id, person_id, file_path, original_name, status, remarks) 
       VALUES (?, ?, ?, ?, 0, ?)`,
      [requirements_id, person_id, filename, req.file.originalname, remarks || null]
    );

    res.status(201).json({ message: "✅ Upload successful" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to save upload", details: err.message });
  }
});

app.delete("/admin/uploads/:uploadId", async (req, res) => {
  const { uploadId } = req.params;

  try {
    // 1️⃣ Get upload row (file + person_id)
    const [uploadRows] = await db3.query(
      "SELECT person_id, file_path FROM requirement_uploads WHERE upload_id = ?",
      [uploadId]
    );
    if (!uploadRows.length) {
      return res.status(404).json({ error: "Upload not found." });
    }

    const { person_id: personId, file_path: filePath } = uploadRows[0];

    // 2️⃣ Student info
    const [[appInfo]] = await db3.query(`
      SELECT snt.student_number, pt.last_name, pt.first_name, pt.middle_name
      FROM student_numbering_table snt
      LEFT JOIN person_table pt ON snt.person_id = pt.person_id
      WHERE snt.person_id = ?;
    `, [personId]);

    const student_number = appInfo?.student_number || "Unknown";
    const fullName = `${appInfo?.last_name || ""}, ${appInfo?.first_name || ""} ${appInfo?.middle_name?.charAt(0) || ""}.`;

    // 3️⃣ Actor (admin performing the action)
    const user_person_id = req.headers["x-person-id"];
    const { actorEmail, actorName } = await getActorInfo(user_person_id);

    // 4️⃣ Delete physical file
    if (filePath) {
      const fullPath = path.join(__dirname, "uploads", filePath);
      try {
        await fs.promises.unlink(fullPath);
        console.log("🗑️ File deleted:", fullPath);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.warn("⚠️ File already missing:", fullPath);
        } else {
          console.error("File delete error:", err);
        }
      }
    }

    // 5️⃣ Delete DB record
    await db.query("DELETE FROM requirement_uploads WHERE upload_id = ?", [uploadId]);

    // 6️⃣ Log notification
    const message = `🗑️ Deleted document (Applicant #${student_number} - ${fullName})`;
    await db.query(
      "INSERT INTO notifications (type, message, applicant_number, actor_email, actor_name, timestamp) VALUES (?, ?, ?, ?, ?, NOW())",
      ["delete", message, student_number, actorEmail, actorName]
    );

    io.emit("notification", {
      type: "delete",
      message,
      student_number,
      actor_email: actorEmail,
      actor_name: actorName,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ message: "✅ Upload deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete the upload." });
  }
});


app.get("/api/get_applicant_account_id/:person_id", async (req, res) => {
  const { person_id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT user_id FROM user_accounts WHERE person_id = ? LIMIT 1",
      [person_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ user_account_id: rows[0].user_id });
  } catch (err) {
    console.error("❌ Error fetching user_account_id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/update_applicant/:user_id", profileUpload.single("profile_picture"), async (req, res) => {
  const { user_id } = req.params;
  const data = req.body;
  const file = req.file;

  try {
    const [existing] = await db.query("SELECT * FROM user_accounts WHERE user_id = ?", [user_id]);
    if (existing.length === 0) return res.status(404).json({ message: "User not found" });
    const applicant_person_id = existing[0].person_id;

    const [applicant] = await db.query("SELECT * FROM applicant_numbering_table WHERE person_id = ?", [applicant_person_id]);

    if (applicant.length === 0) return res.status(404).json({ message: "Applicant not found" });
    const applicant_number = applicant[0].applicant_number;

    const [datas] = await db.query("SELECT * FROM person_table WHERE person_id = ?", [applicant_person_id]);
    const current = datas[0]

    let finalFilename = current.profile_img;

    if (file) {
      const a_id = applicant_number || "unknown";

      const philTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
      const year = new Date(philTime).getFullYear();

      const ext = path.extname(file.originalname).toLowerCase();
      finalFilename = `${a_id}_profile_image_${year}${ext}`;

      const uploadDir = path.join(__dirname, "uploads");
      const tempPath = path.join(uploadDir, file.filename);
      const newPath = path.join(uploadDir, finalFilename);

      if (current.profile_img) {
        const oldPath = path.join(uploadDir, current.profile_img);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      fs.renameSync(tempPath, newPath);
    }

    const sql = `
      UPDATE person_table SET profile_img = ? WHERE person_id = ?
    `;

    const [updated] = await db.query(sql, [finalFilename, applicant_person_id]);

    res.json({
      success: true,
      message: "Applicant updated successfully!",
      updated
    });

  } catch (error) {
    console.error("❌ Error updating registrar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



http.listen(5000, () => {
  console.log("Server with Socket.IO running on port 5000");
});
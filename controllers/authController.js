import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ LOGIN
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ PLAIN PASSWORD CHECK
    if (password !== user.rows[0].password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: user.rows[0]
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ SEND OTP
export const sendOTP = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP();

    await pool.query(
      "INSERT INTO otp_verifications (username, otp, expires_at) VALUES ($1,$2,NOW() + INTERVAL '5 minutes')",
      [username, otp]
    );

    await sendEmail(user.rows[0].email, otp);

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.log("OTP ERROR:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { username, otp, newPassword } = req.body;

  try {
    const record = await pool.query(
      "SELECT * FROM otp_verifications WHERE username=$1 AND otp=$2 ORDER BY id DESC LIMIT 1",
      [username, otp]
    );

    if (record.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await pool.query(
      "UPDATE users SET password=$1 WHERE username=$2",
      [newPassword, username]
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    console.log("RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ VERIFY ADMIN (FIXED)
export const verifyAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND role='Admin'",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // ✅ PLAIN CHECK
    if (password !== user.rows[0].password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Verified" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE USER (FIXED)
export const createUser = async (req, res) => {
  const { 
    name, email, mobile, username, password, role, courses, profile_image,
    adminUsername, adminPassword   // 🔥 ADD
  } = req.body;

  try {

    // 🔥 ADMIN VERIFY AGAIN HERE
    const admin = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND role='Admin'",
      [adminUsername]
    );

    if (admin.rows.length === 0) {
      return res.status(403).json({ message: "Invalid Admin" });
    }

    if (adminPassword !== admin.rows[0].password) {
      return res.status(403).json({ message: "Wrong Admin Password" });
    }

    if (!name || !email || !mobile || !username || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔥 ROLE VALIDATION (YAHAN ADD KARO)
    if (!["Admin", "Faculty"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ Username check
    const userByUsername = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (userByUsername.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // ✅ Email check
    const userByEmail = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userByEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Mobile check
    const userByMobile = await pool.query(
      "SELECT * FROM users WHERE mobile=$1",
      [mobile]
    );

    if (userByMobile.rows.length > 0) {
      return res.status(400).json({ message: "Mobile already exists" });
    }

    // ✅ Insert
    const user = await pool.query(
      `INSERT INTO users (name,email,mobile,username,password,role,courses,profile_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        name,
        email,
        mobile,
        username,
        password,
        role,
        courses ? [courses] : null, // ✅ FIX
        profile_image
      ]
    );

    res.status(201).json(user.rows[0]);

  } catch (err) {
    console.log("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
import pool from "../config/db.js";

export const createStudent = async (req, res) => {
  const { name, email, mobile, birth_date } = req.body;

  try {
    const exists = await pool.query(
      "SELECT * FROM students WHERE email=$1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const student = await pool.query(
      "INSERT INTO students (name,email,mobile,birth_date) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, mobile, birth_date]
    );

    res.json(student.rows[0]);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await pool.query(`
      SELECT 
        id,
        name,
        email,
        mobile,
        TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date
      FROM students
      ORDER BY id DESC
    `);

    res.json(students.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students" });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, birth_date } = req.body;

  try {
    await pool.query(
      "UPDATE students SET name=$1,email=$2,mobile=$3,birth_date=$4 WHERE id=$5",
      [name, email, mobile, birth_date, id]
    );

    res.json({ message: "Updated" });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔥 main delete (cascade handle karega)
    await pool.query("DELETE FROM students WHERE id=$1", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await pool.query(`
      SELECT 
        id,
        name,
        email,
        mobile,
        TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date
      FROM students
      WHERE id = $1
    `, [req.params.id]);

    if (student.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student.rows[0]);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getStudentFullDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔥 STUDENT INFO
    const student = await pool.query(
      `SELECT id, name, email, mobile,
       TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date
       FROM students WHERE id=$1`,
      [id]
    );

    // 🔥 ATTENDANCE HISTORY (ALL BATCHES)
    const attendance = await pool.query(`
      SELECT 
        a.date,
        a.start_time,
        a.end_time,
        a.topic,
        b.batch_name,
        ad.status
      FROM attendance_details ad
      JOIN attendance a ON ad.attendance_id = a.id
      JOIN batches b ON a.batch_id = b.id
      WHERE ad.student_id = $1
      ORDER BY a.date DESC
    `, [id]);

    // 🔥 REMOVE DUPLICATE ATTENDANCE BY DATE + TIME + TOPIC
    const uniqueAttendance = [];
    const seen = new Set();

    attendance.rows.forEach((a) => {

      const key = `${a.date}-${a.start_time}-${a.end_time}-${a.topic}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueAttendance.push(a);
      }

    });

    // 🔥 COUNT
    const present = uniqueAttendance.filter(
      r => r.status === "Present"
    ).length;

    const total = uniqueAttendance.length;

    const absent = total - present;

    // 🔥 EXACT PERCENTAGE
    const percentage =
      total === 0
        ? 0
        : Number(((present / total) * 100).toFixed(2));

    res.json({
      student: student.rows[0],
      attendance: uniqueAttendance,
      stats: {
        present,
        absent,
        total,
        percentage
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching student profile" });
  }
};
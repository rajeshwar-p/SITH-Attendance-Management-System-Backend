import pool from "../config/db.js";

// CREATE BATCH
export const createBatch = async (req, res) => {
  const { batch_name, faculty_id } = req.body;

  try {
    // ✅ SINGLE duplicate check (only once)
    const exists = await pool.query(
      "SELECT * FROM batches WHERE LOWER(batch_name)=LOWER($1)",
      [batch_name]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Batch already exists" });
    }

    const batch = await pool.query(
      "INSERT INTO batches (batch_name, faculty_id) VALUES ($1,$2) RETURNING *",
      [batch_name, faculty_id]
    );

    res.json(batch.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD STUDENTS TO BATCH
export const addStudentsToBatch = async (req, res) => {
  const { batch_id, studentIds } = req.body;

  for (let id of studentIds) {
    await pool.query(
      "INSERT INTO batch_students (batch_id,student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [batch_id, id]
    );
  }

  res.json({ message: "Students added" });
};

// 📌 GET ALL BATCHES WITH STUDENT COUNT
export const getBatches = async (req, res) => {
  try {
    const data = await pool.query(`
      SELECT 
        b.id,
        b.batch_name,
        b.faculty_id,

        COALESCE(u.name, 'No Faculty') AS faculty_name,

        /* 🔥 TOTAL STUDENTS */
        COUNT(DISTINCT bs.student_id) AS total_students,

        /* 🔥 TOTAL LECTURES / SESSIONS */
        COUNT(DISTINCT a.id) AS total_sessions

      FROM batches b

      LEFT JOIN users u
        ON b.faculty_id = u.id

      LEFT JOIN batch_students bs
        ON b.id = bs.batch_id

      LEFT JOIN attendance a
        ON b.id = a.batch_id

      GROUP BY b.id, u.name

      ORDER BY b.id DESC
    `);

    res.json(data.rows);

  } catch (err) {
    console.error("BATCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 GET BATCH DETAILS
export const getBatchDetails = async (req, res) => {
  const { id } = req.params;

  // 🔥 CRITICAL VALIDATION
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Invalid batch id" });
  }

  try {
    const batch = await pool.query(
      `SELECT b.*, u.name AS faculty_name
       FROM batches b
       LEFT JOIN users u ON b.faculty_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    const students = await pool.query(
      `SELECT s.* FROM students s
       JOIN batch_students bs ON s.id = bs.student_id
       WHERE bs.batch_id=$1`,
      [id]
    );

    res.json({
      batch: batch.rows[0] || {},
      students: students.rows || []
    });

  } catch (err) {
    console.error("BATCH DETAILS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 REMOVE STUDENTS
export const removeStudentsFromBatch = async (req, res) => {
  const { batch_id, studentIds } = req.body;

  for (let id of studentIds) {
    await pool.query(
      "DELETE FROM batch_students WHERE batch_id=$1 AND student_id=$2",
      [batch_id, id]
    );
  }

  res.json({ message: "Students removed" });
};

// ✅ UPDATE BATCH
export const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { batch_name, faculty_id } = req.body;

  try {
    await pool.query(
      "UPDATE batches SET batch_name=$1, faculty_id=$2 WHERE id=$3",
      [batch_name, faculty_id || null, id]
    );

    res.json({ message: "Batch updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// ✅ DELETE BATCH
export const deleteBatch = async (req, res) => {
  const { id } = req.params;

  try {

    // ===============================
    // 1️⃣ Delete attendance_details
    // ===============================

    await pool.query(`
      DELETE FROM attendance_details
      WHERE attendance_id IN (
        SELECT id FROM attendance
        WHERE batch_id = $1
      )
    `, [id]);

    // ===============================
    // 2️⃣ Delete attendance
    // ===============================

    await pool.query(
      "DELETE FROM attendance WHERE batch_id = $1",
      [id]
    );

    // ===============================
    // 3️⃣ Delete batch_students
    // ===============================

    await pool.query(
      "DELETE FROM batch_students WHERE batch_id = $1",
      [id]
    );

    // ===============================
    // 4️⃣ Finally delete batch
    // ===============================

    await pool.query(
      "DELETE FROM batches WHERE id = $1",
      [id]
    );

    res.json({
      success: true,
      message: "Batch deleted successfully"
    });

  } catch (err) {

    console.error("DELETE BATCH ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};

export const updateBatchStudents = async (req, res) => {
  const { batch_id, studentIds } = req.body;

  try {
    await pool.query("DELETE FROM batch_students WHERE batch_id=$1", [batch_id]);

    for (let id of studentIds) {
      await pool.query(
        "INSERT INTO batch_students (batch_id,student_id) VALUES ($1,$2)",
        [batch_id, id]
      );
    }

    res.json({ message: "Updated" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
};

// 🔥 GET FULL DATA (ALL BATCHES)
export const getFullBatchData = async (req, res) => {
  try {
    const batches = await pool.query(`
      SELECT b.id, b.batch_name, u.name AS faculty_name
      FROM batches b
      LEFT JOIN users u ON b.faculty_id = u.id
    `);

    let result = [];

    for (let b of batches.rows) {

      const students = await pool.query(`
        SELECT s.id, s.name
        FROM batch_students bs
        JOIN students s ON bs.student_id = s.id
        WHERE bs.batch_id = $1
      `, [b.id]);

      const sessions = await pool.query(`
        SELECT date, start_time, end_time, topic
        FROM attendance
        WHERE batch_id = $1
        ORDER BY date DESC
      `, [b.id]);

      result.push({
        ...b,
        students: students.rows,
        sessions: sessions.rows
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching batch report" });
  }
};

// 🔥 SINGLE BATCH FULL DATA
export const getSingleBatchFull = async (req, res) => {
  const { id } = req.params;

  try {
    const batch = await pool.query(`
      SELECT b.id, b.batch_name, u.name AS faculty_name
      FROM batches b
      LEFT JOIN users u ON b.faculty_id = u.id
      WHERE b.id = $1
    `, [id]);

    const students = await pool.query(`
      SELECT s.id, s.name
      FROM batch_students bs
      JOIN students s ON bs.student_id = s.id
      WHERE bs.batch_id = $1
    `, [id]);

    const sessions = await pool.query(`
      SELECT date, start_time, end_time, topic
      FROM attendance
      WHERE batch_id = $1
      ORDER BY date DESC
    `, [id]);

    res.json({
      ...batch.rows[0],
      students: students.rows,
      sessions: sessions.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching batch" });
  }
};

export const getSingleBatchFullDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔥 Batch Info
    const batch = await pool.query(`
      SELECT b.id, b.batch_name, u.name AS faculty_name
      FROM batches b
      LEFT JOIN users u ON b.faculty_id = u.id
      WHERE b.id = $1
    `, [id]);

    // 🔥 Students
    const students = await pool.query(`
      SELECT s.id, s.name
      FROM batch_students bs
      JOIN students s ON bs.student_id = s.id
      WHERE bs.batch_id = $1
    `, [id]);

    // 🔥 FULL ATTENDANCE (with student-wise records)
    const sessions = await pool.query(`
      SELECT 
        a.id,
        a.date,
        a.start_time,
        a.end_time,
        a.topic,
        json_agg(
          json_build_object(
            'name', s.name,
            'status', ad.status,
            'reason', ad.reason
          )
        ) AS students
      FROM attendance a
      LEFT JOIN attendance_details ad ON a.id = ad.attendance_id
      LEFT JOIN students s ON ad.student_id = s.id
      WHERE a.batch_id = $1
      GROUP BY a.id
      ORDER BY a.date DESC
    `, [id]);

    res.json({
      ...batch.rows[0],
      students: students.rows,
      sessions: sessions.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching detailed batch data" });
  }
};
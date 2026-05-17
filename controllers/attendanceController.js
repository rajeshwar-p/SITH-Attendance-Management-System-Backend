import pool from "../config/db.js";

export const createAttendance = async (req, res) => {
  const client = await pool.connect();

  try {
    const { batch_id, date, start_time, end_time, topic, records } = req.body;

    await client.query("BEGIN");

    // 🔥 DUPLICATE CHECK
    const exists = await client.query(
      "SELECT * FROM attendance WHERE batch_id=$1 AND date=$2",
      [batch_id, date]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");   // 🔥 MUST
      return res.status(400).json({
        message: "Attendance already exists for this date"
      });
    }

    const attendance = await client.query(
      `INSERT INTO attendance (batch_id,date,start_time,end_time,topic)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [batch_id, date, start_time, end_time, topic]
    );

    const attendanceId = attendance.rows[0].id;

    for (let r of records) {
      await client.query(
        "INSERT INTO attendance_details (attendance_id,student_id,status,reason) VALUES ($1,$2,$3,$4)",
        [attendanceId, r.student_id, r.status, r.reason || null]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Attendance saved" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Error saving attendance" });
  } finally {
    client.release();
  }
};

// 📌 GET ATTENDANCE HISTORY (Batch-wise)
export const getAttendanceByBatch = async (req, res) => {
  const { batch_id } = req.params;

  const data = await pool.query(
    `SELECT 
      id,
      batch_id,
      TO_CHAR(date, 'YYYY-MM-DD') AS date,
      start_time,
      end_time,
      topic
    FROM attendance
    WHERE batch_id=$1
    ORDER BY date DESC`,
    [batch_id]
  );

  res.json(data.rows);
};

// 📌 VIEW SINGLE ATTENDANCE (with students)
export const getAttendanceDetails = async (req, res) => {
  const { id } = req.params;

  const attendance = await pool.query(
    "SELECT * FROM attendance WHERE id=$1",
    [id]
  );

  const details = await pool.query(
    `SELECT s.id, s.name, s.email, ad.status, ad.reason
    FROM attendance_details ad
    JOIN students s ON ad.student_id = s.id
    WHERE ad.attendance_id=$1`,
    [id]
  );

  res.json({
    attendance: attendance.rows[0],
    students: details.rows
  });
};

// 📌 DELETE ATTENDANCE
export const deleteAttendance = async (req, res) => {

  const { id } = req.params;

  try {

    // 🔥 FIRST delete attendance details
    await pool.query(
      "DELETE FROM attendance_details WHERE attendance_id = $1",
      [id]
    );

    // 🔥 THEN delete attendance
    await pool.query(
      "DELETE FROM attendance WHERE id = $1",
      [id]
    );

    res.json({
      success: true,
      message: "Attendance deleted successfully"
    });

  } catch (err) {

    console.error(
      "DELETE ATTENDANCE ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete attendance"
    });
  }
};

// 📌 UPDATE ATTENDANCE
export const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { date, start_time, end_time, topic, records } = req.body;

  await pool.query(
    `UPDATE attendance 
    SET date=$1, start_time=$2, end_time=$3, topic=$4 
    WHERE id=$5`,
    [date, start_time, end_time, topic, id]
  );

  // delete old
  await pool.query("DELETE FROM attendance_details WHERE attendance_id=$1", [id]);

  // insert new
  for (let r of records) {
    await pool.query(
      "INSERT INTO attendance_details (attendance_id,student_id,status,reason) VALUES ($1,$2,$3,$4)",
      [id, r.student_id, r.status, r.reason || null]
    );
  }

  res.json({ message: "Attendance updated" });
};

// 🔥 CHECK ATTENDANCE EXISTS (batch + date)
export const checkAttendanceExists = async (req, res) => {
  try {
    const { batch_id, date, exclude_id } = req.query;

    if (!batch_id || !date) {
      return res.status(400).json({
        message: "batch_id and date are required"
      });
    }

    const result = await pool.query(
      `SELECT id FROM attendance 
      WHERE batch_id=$1 
      AND date=$2 
      AND id != $3`,
      [batch_id, date, exclude_id || 0]
    );

    res.json({
      exists: result.rows.length > 0
    });

  } catch (err) {
    console.error("CHECK ERROR:", err);
    res.status(500).json({
      message: "Error checking attendance"
    });
  }
};
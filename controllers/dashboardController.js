import pool from "../config/db.js";

// 📊 DASHBOARD DATA
export const getDashboardData = async (req, res) => {
  try {
    // 1️⃣ Total Students
    const totalStudents = await pool.query(
      "SELECT COUNT(*) FROM students"
    );

    // 2️⃣ Total Batches
    const totalBatches = await pool.query(
      "SELECT COUNT(*) FROM batches"
    );

    // 3️⃣ Today Attendance
    const today = new Date().toISOString().split("T")[0];

    const attendance = await pool.query(
      `SELECT ad.status FROM attendance a
       JOIN attendance_details ad ON a.id = ad.attendance_id
       WHERE a.date = $1`,
      [today]
    );

    let present = 0;
    let absent = 0;

    attendance.rows.forEach((r) => {
      if (r.status === "Present") present++;
      else absent++;
    });

    // 4️⃣ Birthday Students
    const birthdays = await pool.query(
      `SELECT * FROM students
       WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)`
    );

    // 5️⃣ Batch-wise Student Count (Graph)
    const batchStats = await pool.query(
      `SELECT b.batch_name, COUNT(bs.student_id) as total
       FROM batches b
       LEFT JOIN batch_students bs ON b.id = bs.batch_id
       GROUP BY b.batch_name`
    );

    res.json({
      totalStudents: totalStudents.rows[0].count,
      totalBatches: totalBatches.rows[0].count,
      todayPresent: present,
      todayAbsent: absent,
      birthdays: birthdays.rows,
      batchStats: batchStats.rows
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};
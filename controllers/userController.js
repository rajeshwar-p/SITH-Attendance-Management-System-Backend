import pool from "../config/db.js";

// GET PROFILE
export const getProfile = async (req, res) => {
  const user = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [req.user.id]
  );

  res.json(user.rows[0]);
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {

  try {

    let {
      name,
      email,
      mobile,
      profile_image,
      courses,
      role
    } = req.body;

    // ✅ FORCE ARRAY FORMAT
    if (!Array.isArray(courses)) {
      courses = [courses];
    }

    const updatedUser = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2,
        mobile = $3,
        profile_image = $4,
        courses = $5,
        role = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        name,
        email,
        mobile,
        profile_image,
        courses,
        role,
        req.user.id
      ]
    );

    res.json(updatedUser.rows[0]);

  } catch (err) {

    console.log("PROFILE ERROR:", err);

    res.status(500).json({
      message: "Error updating profile"
    });

  }

};

export const getStaffUsers = async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT id, name, role 
       FROM users 
       ORDER BY name ASC`
    );

    res.json(users.rows);
  } catch (err) {
    console.log("USER LOAD ERROR:", err);
    res.status(500).json({ message: "Error loading users" });
  }
};
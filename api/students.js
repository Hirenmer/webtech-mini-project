const { getPool } = require("./_db");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") return res.status(405).json({error:"Method not allowed"});
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, enrollment_no, student_name FROM students ORDER BY enrollment_no"
    );
    return res.status(200).json({students: rows});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error:"Unable to load students. Check DATABASE_URL and database connectivity."});
  }
};

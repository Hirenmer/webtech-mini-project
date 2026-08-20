const { getPool } = require("./_db");

function clean(v){ return typeof v === "string" ? v.trim() : v; }

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  try {
    const body = req.body || {};
    const s1 = Number(body.student1_id);
    const s2 = body.student2_id === null || body.student2_id === undefined || body.student2_id === "" ? null : Number(body.student2_id);
    const title = clean(body.project_title);
    const category = clean(body.category);
    const abstractText = clean(body.abstract);
    const functionalities = clean(body.functionalities);

    if (!s1 || !title || !category || !abstractText || !functionalities) {
      return res.status(400).json({error:"Please fill all required fields."});
    }
    if (s2 !== null && s1 === s2) {
      return res.status(400).json({error:"Student 1 and Student 2 cannot be the same."});
    }

    const pool = getPool();

    const ids = s2 === null ? [s1, s1] : [s1, s1, s2, s2];
    const studentSql = s2 === null
      ? "SELECT id FROM projects WHERE student1_id=? OR student2_id=? LIMIT 1"
      : "SELECT id FROM projects WHERE student1_id=? OR student2_id=? OR student1_id=? OR student2_id=? LIMIT 1";
    const [existing] = await pool.execute(studentSql, ids);
    if (existing.length) {
      return res.status(409).json({error:"One of the selected students is already registered in another project."});
    }

    // Group number was commented out in the uploaded PHP version, so this Vercel version
    // generates a unique group number automatically.
    const [countRows] = await pool.query("SELECT COUNT(*) AS c FROM projects");
    const groupNo = "G" + String(Number(countRows[0].c) + 1).padStart(3,"0");

    const [result] = await pool.execute(
      `INSERT INTO projects
       (group_no, student1_id, student2_id, project_title, category, abstract, functionalities)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [groupNo, s1, s2, title, category, abstractText, functionalities]
    );

    return res.status(201).json({success:true, project_id:result.insertId, group_no:groupNo});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error:"Database error. Check your MySQL schema and DATABASE_URL."});
  }
};

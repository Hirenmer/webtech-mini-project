const { getPool } = require("./_db");

function clean(v) {
  return typeof v === "string" ? v.trim() : v;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body || {};

    const s1 = Number(body.student1_id);

    const s2 =
      body.student2_id === null ||
      body.student2_id === undefined ||
      body.student2_id === ""
        ? null
        : Number(body.student2_id);

    const title = clean(body.project_title);
    const category = clean(body.category);
    const abstractText = clean(body.abstract);
    const functionalities = clean(body.functionalities);

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------
    if (
      !s1 ||
      !title ||
      !category ||
      !abstractText ||
      !functionalities
    ) {
      return res.status(400).json({
        error: "Please fill all required fields."
      });
    }

    // -----------------------------------------
    // Student 1 and Student 2 cannot be same
    // -----------------------------------------
    if (s2 !== null && s1 === s2) {
      return res.status(400).json({
        error: "Student 1 and Student 2 cannot be the same."
      });
    }

    const pool = getPool();

    // -----------------------------------------
    // Verify Student 1 exists
    // -----------------------------------------
    const [student1Rows] = await pool.execute(
      `SELECT id, enrollment_no, student_name
       FROM students
       WHERE id = ?`,
      [s1]
    );

    if (student1Rows.length === 0) {
      return res.status(400).json({
        error: "Student 1 does not exist."
      });
    }

    // -----------------------------------------
    // Verify Student 2 exists if selected
    // -----------------------------------------
    let student2 = null;

    if (s2 !== null) {
      const [student2Rows] = await pool.execute(
        `SELECT id, enrollment_no, student_name
         FROM students
         WHERE id = ?`,
        [s2]
      );

      if (student2Rows.length === 0) {
        return res.status(400).json({
          error: "Student 2 does not exist."
        });
      }

      student2 = student2Rows[0];
    }

    const student1 = student1Rows[0];

    // -----------------------------------------
    // Check whether Student 1 already has project
    // -----------------------------------------
    const [existingStudent1] = await pool.execute(
      `SELECT id, group_no
       FROM projects
       WHERE student1_id = ?
          OR student2_id = ?
       LIMIT 1`,
      [s1, s1]
    );

    if (existingStudent1.length > 0) {
      return res.status(409).json({
        error:
          "Student 1 is already registered in another project."
      });
    }

    // -----------------------------------------
    // Check whether Student 2 already has project
    // -----------------------------------------
    if (s2 !== null) {
      const [existingStudent2] = await pool.execute(
        `SELECT id, group_no
         FROM projects
         WHERE student1_id = ?
            OR student2_id = ?
         LIMIT 1`,
        [s2, s2]
      );

      if (existingStudent2.length > 0) {
        return res.status(409).json({
          error:
            "Student 2 is already registered in another project."
        });
      }
    }

    // -----------------------------------------
    // Generate Group Number
    // -----------------------------------------
    const [lastGroup] = await pool.query(
      `SELECT group_no
       FROM projects
       ORDER BY id DESC
       LIMIT 1`
    );

    let groupNumber = 1;

    if (lastGroup.length > 0) {
      const lastNumber = parseInt(
        String(lastGroup[0].group_no).replace("G", ""),
        10
      );

      if (!isNaN(lastNumber)) {
        groupNumber = lastNumber + 1;
      }
    }

    const groupNo =
      "G" + String(groupNumber).padStart(3, "0");

    // -----------------------------------------
    // Insert project
    // -----------------------------------------

    let result;

    if (s2 === null) {

      // ---------------------------------------
      // Single Student Project
      // ---------------------------------------
      [result] = await pool.execute(
        `INSERT INTO projects
        (
          group_no,
          student1_id,
          student1_enrollment_no,
          student2_id,
          student2_enrollment_no,
          project_title,
          category,
          abstract,
          functionalities
        )
        VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?)`,
        [
          groupNo,
          student1.id,
          student1.enrollment_no,
          title,
          category,
          abstractText,
          functionalities
        ]
      );

    } else {

      // ---------------------------------------
      // Two Student Project
      // ---------------------------------------
      [result] = await pool.execute(
        `INSERT INTO projects
        (
          group_no,
          student1_id,
          student1_enrollment_no,
          student2_id,
          student2_enrollment_no,
          project_title,
          category,
          abstract,
          functionalities
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          groupNo,
          student1.id,
          student1.enrollment_no,
          student2.id,
          student2.enrollment_no,
          title,
          category,
          abstractText,
          functionalities
        ]
      );
    }

    // -----------------------------------------
    // Successful response
    // -----------------------------------------
    return res.status(201).json({
      success: true,
      message: "Project registered successfully.",
      project_id: result.insertId,
      group_no: groupNo,
      student1: {
        enrollment_no: student1.enrollment_no,
        name: student1.student_name
      },
      student2: student2
        ? {
            enrollment_no: student2.enrollment_no,
            name: student2.student_name
          }
        : null
    });

  } catch (err) {

    console.error("PROJECT SUBMISSION ERROR:", err);

    return res.status(500).json({
      error: "Database error.",
      details: err.message
    });
  }
};

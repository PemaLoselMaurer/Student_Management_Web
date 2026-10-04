/**
 * Restores the database to a known state before each JMeter run (Lab 6).
 *  - removes every record created by JMeter (student IDs starting with "9")
 *  - (re)creates the dummy login accounts listed in jmeter-lab/data/users.csv
 *
 * Usage: DATABASE_URL=postgres://... node scripts/reset-jmeter-data.js
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { createPool, initSchema } = require("../src/db");

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/cst_sms";
const USERS_CSV = path.join(__dirname, "..", "..", "jmeter-lab", "data", "users.csv");

async function main() {
  const pool = createPool(DATABASE_URL);
  await initSchema(pool);

  const removed = await pool.query("DELETE FROM students WHERE student_id LIKE '9%'");

  const rows = fs
    .readFileSync(USERS_CSV, "utf8")
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split(","));

  for (const [studentId, password, name] of rows) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO students (student_id, password_hash, name, email, program)
       VALUES ($1, $2, $3, $4, 'BE Software Engineering')
       ON CONFLICT (student_id) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name,
             email = EXCLUDED.email, program = EXCLUDED.program, updated_at = now()`,
      [studentId, hash, name, `${studentId}@cst.test`]
    );
  }

  const total = await pool.query("SELECT COUNT(*)::int AS n FROM students");
  console.log(
    `Removed ${removed.rowCount} JMeter-created records, seeded ${rows.length} login accounts, ` +
      `${total.rows[0].n} students in table.`
  );
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

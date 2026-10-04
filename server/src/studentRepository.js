/**
 * Postgres-backed CRUD operations for student records (Lab 5).
 * Talks to a real database via the injected `pg` Pool - no mocking.
 * All student data (including credentials) is persisted here; passwords are
 * bcrypt-hashed before storage and never returned to callers.
 */

const bcrypt = require("bcryptjs");

const POSTGRES_UNIQUE_VIOLATION = "23505";
const BCRYPT_SALT_ROUNDS = 10;

class DuplicateStudentError extends Error {
  constructor(studentId) {
    super(`Student ID ${studentId} is already registered`);
    this.name = "DuplicateStudentError";
  }
}

class StudentNotFoundError extends Error {
  constructor(studentId) {
    super(`Student ID ${studentId} was not found`);
    this.name = "StudentNotFoundError";
  }
}

function toStudent(row) {
  if (!row) return null;
  return {
    studentId: row.student_id,
    name: row.name,
    email: row.email,
    program: row.program,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createStudent(pool, { studentId, name, password = null, email = null, program = null }) {
  const passwordHash = password ? await bcrypt.hash(password, BCRYPT_SALT_ROUNDS) : null;
  try {
    const result = await pool.query(
      `INSERT INTO students (student_id, password_hash, name, email, program)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, passwordHash, name, email, program]
    );
    return toStudent(result.rows[0]);
  } catch (err) {
    if (err.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new DuplicateStudentError(studentId);
    }
    throw err;
  }
}

async function getStudent(pool, studentId) {
  const result = await pool.query("SELECT * FROM students WHERE student_id = $1", [studentId]);
  return toStudent(result.rows[0]);
}

// Fetches a student and verifies the supplied plaintext password against the
// stored bcrypt hash. Returns the safe student record on success, null otherwise.
async function authenticateStudent(pool, studentId, password) {
  const result = await pool.query("SELECT * FROM students WHERE student_id = $1", [studentId]);
  const row = result.rows[0];
  if (!row || !row.password_hash) return null;

  const matches = await bcrypt.compare(password, row.password_hash);
  return matches ? toStudent(row) : null;
}

async function listStudents(pool) {
  const result = await pool.query("SELECT * FROM students ORDER BY student_id ASC");
  return result.rows.map(toStudent);
}

async function updateStudent(pool, studentId, { name, email, program, password }) {
  const existing = await getStudent(pool, studentId);
  if (!existing) {
    throw new StudentNotFoundError(studentId);
  }
  const passwordHash = password ? await bcrypt.hash(password, BCRYPT_SALT_ROUNDS) : null;
  const result = await pool.query(
    `UPDATE students
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         program = COALESCE($4, program),
         password_hash = COALESCE($5, password_hash),
         updated_at = now()
     WHERE student_id = $1
     RETURNING *`,
    [studentId, name, email, program, passwordHash]
  );
  return toStudent(result.rows[0]);
}

async function deleteStudent(pool, studentId) {
  const result = await pool.query("DELETE FROM students WHERE student_id = $1 RETURNING *", [
    studentId,
  ]);
  if (result.rowCount === 0) {
    throw new StudentNotFoundError(studentId);
  }
  return toStudent(result.rows[0]);
}

module.exports = {
  DuplicateStudentError,
  StudentNotFoundError,
  createStudent,
  getStudent,
  authenticateStudent,
  listStudents,
  updateStudent,
  deleteStudent,
};

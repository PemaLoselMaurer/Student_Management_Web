/**
 * PostgreSQL connection pool + schema setup for the Student Management System.
 * Used both by the running server (server.js, via DATABASE_URL) and by the
 * Testcontainers integration tests (which point it at an ephemeral container).
 */
const { Pool } = require("pg");

function createPool(connectionString) {
  return new Pool({ connectionString });
}

async function initSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      student_id VARCHAR(8) PRIMARY KEY,
      password_hash VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      program VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function resetSchema(pool) {
  await pool.query("TRUNCATE TABLE students;");
}

module.exports = { createPool, initSchema, resetSchema };

/**
 * Lab 5 - Integration tests for the Postgres-backed Student CRUD API.
 *
 * These tests spin up a REAL PostgreSQL database using Testcontainers (no
 * mocking of the database) and exercise the /api/students endpoints
 * end-to-end: create, retrieve, list, update, delete, duplicate handling,
 * and handling of invalid/non-existent records.
 */
const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const request = require("supertest");

const { createApp } = require("../src/app");
const { createPool, initSchema, resetSchema } = require("../src/db");

jest.setTimeout(120000); // container pull/start can be slow on first run

let container;
let pool;
let app;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  pool = createPool(container.getConnectionUri());
  await initSchema(pool);
  app = createApp(pool);
});

afterAll(async () => {
  await pool.end();
  await container.stop();
});

beforeEach(async () => {
  await resetSchema(pool);
});

describe("POST /api/students - create/register a student", () => {
  test("creates a new student with valid data", async () => {
    const res = await request(app)
      .post("/api/students")
      .send({ studentId: "10000001", name: "Sonam Dorji", email: "sonam@example.com", program: "SWE" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      studentId: "10000001",
      name: "Sonam Dorji",
      email: "sonam@example.com",
      program: "SWE",
    });
  });

  test("rejects an invalid (non-numeric / wrong length) Student ID", async () => {
    const res = await request(app)
      .post("/api/students")
      .send({ studentId: "abc123", name: "Bad Id" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("rejects a student with a missing name", async () => {
    const res = await request(app).post("/api/students").send({ studentId: "10000002" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  test("prevents a duplicate Student ID from being registered twice", async () => {
    await request(app)
      .post("/api/students")
      .send({ studentId: "10000003", name: "Tashi Wangmo" });

    const dup = await request(app)
      .post("/api/students")
      .send({ studentId: "10000003", name: "Different Name" });

    expect(dup.status).toBe(409);
    expect(dup.body.error).toMatch(/already registered/i);
  });
});

describe("GET /api/students/:studentId - view/search a student", () => {
  test("returns the student when found", async () => {
    await request(app)
      .post("/api/students")
      .send({ studentId: "10000004", name: "Karma Wangchuk" });

    const res = await request(app).get("/api/students/10000004");
    expect(res.status).toBe(200);
    expect(res.body.studentId).toBe("10000004");
    expect(res.body.name).toBe("Karma Wangchuk");
  });

  test("returns 404 for a non-existent student", async () => {
    const res = await request(app).get("/api/students/99999999");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("returns 400 for a malformed student id", async () => {
    const res = await request(app).get("/api/students/xyz");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/students - list registered students", () => {
  test("returns all registered students", async () => {
    await request(app).post("/api/students").send({ studentId: "10000005", name: "Student A" });
    await request(app).post("/api/students").send({ studentId: "10000006", name: "Student B" });

    const res = await request(app).get("/api/students");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const ids = res.body.map((s) => s.studentId).sort();
    expect(ids).toEqual(["10000005", "10000006"]);
  });

  test("returns an empty list when no students are registered", async () => {
    const res = await request(app).get("/api/students");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("PUT /api/students/:studentId - update student information", () => {
  test("updates an existing student's details", async () => {
    await request(app)
      .post("/api/students")
      .send({ studentId: "10000007", name: "Original Name", program: "SWE" });

    const res = await request(app)
      .put("/api/students/10000007")
      .send({ name: "Updated Name", program: "CS" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
    expect(res.body.program).toBe("CS");
  });

  test("returns 404 when updating a non-existent student", async () => {
    const res = await request(app)
      .put("/api/students/99999998")
      .send({ name: "Nobody" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/students/:studentId - delete a student record", () => {
  test("deletes an existing student", async () => {
    await request(app).post("/api/students").send({ studentId: "10000008", name: "To Delete" });

    const del = await request(app).delete("/api/students/10000008");
    expect(del.status).toBe(204);

    const getAfter = await request(app).get("/api/students/10000008");
    expect(getAfter.status).toBe(404);
  });

  test("returns 404 when deleting a non-existent student", async () => {
    const res = await request(app).delete("/api/students/99999997");
    expect(res.status).toBe(404);
  });
});

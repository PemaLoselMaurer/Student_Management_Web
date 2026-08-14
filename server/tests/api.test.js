/**
 * Integration tests for the Express API, covering the end-to-end flows behind
 * TC13, TC23-TC25, TC30-TC33 (login, payment verification/receipt, duplicate
 * module registration, and results access control).
 */
const request = require("supertest");
const { createApp } = require("../src/app");
const { resetStore } = require("../src/store");

let app;

beforeEach(() => {
  resetStore();
  app = createApp();
});

async function login(studentId = "02240353", password = "Cst2026a") {
  const res = await request(app).post("/api/login").send({ studentId, password });
  return res.body.token;
}

describe("POST /api/register", () => {
  test("creates a new student with valid Student ID and password", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ studentId: "11223344", password: "NewPass9x" });
    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe("11223344");
  });

  test("rejects a duplicate Student ID", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ studentId: "02240353", password: "AnotherOne1" });
    expect(res.status).toBe(409);
  });

  test("rejects an invalid password on registration", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ studentId: "55667788", password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/login - TC13", () => {
  test("valid Student ID + valid password logs the student in", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ studentId: "02240353", password: "Cst2026a" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("wrong password is rejected", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ studentId: "02240353", password: "WrongPass1" });
    expect(res.status).toBe(401);
  });
});

describe("Payment submission and verification - TC23-TC25", () => {
  test("TC23: valid screenshot + valid transaction number, verified by bank -> receipt generated", async () => {
    const token = await login();

    const submit = await request(app)
      .post("/api/payment")
      .set("Authorization", `Bearer ${token}`)
      .field("paymentMethod", "mobile-banking")
      .field("transactionNumber", "452-908371245")
      .field("moduleCode", "SWE302")
      .attach("screenshot", Buffer.from("fake-image-bytes"), "receipt.jpg");
    expect(submit.status).toBe(201);

    const verify = await request(app)
      .post("/api/payment/verify")
      .set("Authorization", `Bearer ${token}`);
    expect(verify.status).toBe(200);
    expect(verify.body.verified).toBe(true);
    expect(verify.body.receiptIssued).toBe(true);
    expect(verify.body.receiptId).toMatch(/^RCPT-/);
  });

  test("TC25: transaction number does not match bank record -> registration remains incomplete", async () => {
    const token = await login();

    await request(app)
      .post("/api/payment")
      .set("Authorization", `Bearer ${token}`)
      .field("paymentMethod", "mobile-banking")
      .field("transactionNumber", "999-999999999")
      .field("moduleCode", "SWE302")
      .attach("screenshot", Buffer.from("fake-image-bytes"), "receipt.png");

    const verify = await request(app)
      .post("/api/payment/verify")
      .set("Authorization", `Bearer ${token}`);
    expect(verify.status).toBe(200);
    expect(verify.body.verified).toBe(false);
    expect(verify.body.status).toBe("incomplete");
    expect(verify.body.receiptIssued).toBe(false);
  });

  test("TC16/TC17 equivalents at the API layer: bad file type and missing file are rejected", async () => {
    const token = await login();

    const badType = await request(app)
      .post("/api/payment")
      .set("Authorization", `Bearer ${token}`)
      .field("paymentMethod", "mobile-banking")
      .field("transactionNumber", "452-908371245")
      .attach("screenshot", Buffer.from("fake"), "receipt.pdf");
    expect(badType.status).toBe(400);

    const missingFile = await request(app)
      .post("/api/payment")
      .set("Authorization", `Bearer ${token}`)
      .field("paymentMethod", "mobile-banking")
      .field("transactionNumber", "452-908371245");
    expect(missingFile.status).toBe(400);
  });

  test("payment endpoints require authentication", async () => {
    const res = await request(app).post("/api/payment/verify");
    expect(res.status).toBe(401);
  });
});

describe("Registration decision + duplicate registration - TC26-TC30", () => {
  async function verifiedPayment(token, moduleCode) {
    await request(app)
      .post("/api/payment")
      .set("Authorization", `Bearer ${token}`)
      .field("paymentMethod", "mobile-banking")
      .field("transactionNumber", "452-908371245")
      .field("moduleCode", moduleCode)
      .attach("screenshot", Buffer.from("fake"), "receipt.jpg");
    await request(app).post("/api/payment/verify").set("Authorization", `Bearer ${token}`);
  }

  test("TC26: payment verified, drug report not verified, period open -> rejected with drug report message", async () => {
    const token = await login();
    await verifiedPayment(token, "SWE401");

    const res = await request(app)
      .post("/api/registration/decide")
      .set("Authorization", `Bearer ${token}`)
      .send({ moduleCode: "SWE401", drugReportVerified: false });
    expect(res.body.allowed).toBe(false);
    expect(res.body.message).toBe("Drug testing report not verified.");
  });

  test("TC27: payment not verified -> rejected with tuition payment message", async () => {
    const token = await login();

    const res = await request(app)
      .post("/api/registration/decide")
      .set("Authorization", `Bearer ${token}`)
      .send({ moduleCode: "SWE401", drugReportVerified: true });
    expect(res.body.allowed).toBe(false);
    expect(res.body.message).toBe("Tuition payment not verified.");
  });

  test("TC28: payment + drug report verified, period closed -> rejected", async () => {
    const token = await login();
    await verifiedPayment(token, "SWE401");
    await request(app).put("/api/admin/settings").send({ registrationPeriodOpen: false });

    const res = await request(app)
      .post("/api/registration/decide")
      .set("Authorization", `Bearer ${token}`)
      .send({ moduleCode: "SWE401", drugReportVerified: true });
    expect(res.body.allowed).toBe(false);
    expect(res.body.message).toBe("Registration period is closed.");
  });

  test("TC29: payment + drug report verified, period open -> registration allowed", async () => {
    const token = await login();
    await verifiedPayment(token, "SWE401");

    const res = await request(app)
      .post("/api/registration/decide")
      .set("Authorization", `Bearer ${token}`)
      .send({ moduleCode: "SWE401", drugReportVerified: true });
    expect(res.body.allowed).toBe(true);
  });

  test("TC30: registering the same module twice in one semester is rejected on the second attempt", async () => {
    const token = await login();
    await verifiedPayment(token, "SWE302"); // already enrolled in the seed data

    const res = await request(app)
      .post("/api/registration/decide")
      .set("Authorization", `Bearer ${token}`)
      .send({ moduleCode: "SWE302", drugReportVerified: true });
    expect(res.body.allowed).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

describe("Results access control - TC31-TC33", () => {
  test("TC31: a registered student can view Module Code, Title and Grade", async () => {
    const token = await login("02240353", "Cst2026a"); // seeded as already enrolled in SWE302
    const res = await request(app).get("/api/results").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { moduleCode: "SWE302", moduleTitle: "Software Testing & Quality Assurance", grade: "A" },
    ]);
  });

  test("TC32: an unregistered student is denied access to results", async () => {
    const token = await login("87654321", "Bhutan2026Cs"); // seeded with no enrolled modules
    const res = await request(app).get("/api/results").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/access denied/i);
  });

  test("TC33: a registered student can download results as a PDF document", async () => {
    const token = await login("02240353", "Cst2026a");
    const res = await request(app)
      .get("/api/results/download")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toMatch(/attachment/);
  });

  test("an unregistered student cannot download results", async () => {
    const token = await login("87654321", "Bhutan2026Cs");
    const res = await request(app)
      .get("/api/results/download")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

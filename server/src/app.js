const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");

const { getState } = require("./store");
const {
  validateStudentId,
  validatePassword,
  validatePaymentMethod,
  validatePaymentScreenshot,
  validateTransactionNumber,
  verifyPayment,
  decideRegistration,
} = require("./validators");
const studentRepository = require("./studentRepository");
const { DuplicateStudentError, StudentNotFoundError } = studentRepository;

const upload = multer({ storage: multer.memoryStorage() });

function createApp(pool) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- auth helpers -------------------------------------------------------

  function issueToken(studentId) {
    const token = crypto.randomBytes(24).toString("hex");
    getState().sessions.set(token, studentId);
    return token;
  }

  function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const studentId = token && getState().sessions.get(token);
    if (!studentId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.studentId = studentId;
    next();
  }

  // --- R1-R4: registration / login (student records live in Postgres) -----

  app.post("/api/register", async (req, res) => {
    const { studentId, password } = req.body || {};

    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return res.status(400).json({ error: idCheck.error });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

    try {
      await studentRepository.createStudent(pool, {
        studentId,
        password,
        name: req.body.name || "",
      });
      return res.status(201).json({ studentId });
    } catch (err) {
      if (err instanceof DuplicateStudentError) {
        return res.status(409).json({ error: "Student ID already registered" });
      }
      return res.status(500).json({ error: "Failed to register student" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { studentId, password } = req.body || {};

    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return res.status(400).json({ error: idCheck.error });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

    const student = await studentRepository.authenticateStudent(pool, studentId, password);
    if (!student) {
      return res.status(401).json({ error: "Invalid Student ID or password" });
    }

    const token = issueToken(studentId);
    return res.status(200).json({ token, studentId, name: student.name });
  });

  // --- R5-R9: payment submission & verification ----------------------------

  app.post("/api/payment", requireAuth, upload.single("screenshot"), (req, res) => {
    const { paymentMethod, transactionNumber, moduleCode } = req.body || {};

    const methodCheck = validatePaymentMethod(paymentMethod);
    if (!methodCheck.valid) return res.status(400).json({ error: methodCheck.error });

    const screenshotCheck = validatePaymentScreenshot(req.file && req.file.originalname);
    if (!screenshotCheck.valid) return res.status(400).json({ error: screenshotCheck.error });

    const txnCheck = validateTransactionNumber(transactionNumber);
    if (!txnCheck.valid) return res.status(400).json({ error: txnCheck.error });

    const record = {
      studentId: req.studentId,
      moduleCode: moduleCode || null,
      transactionNumber,
      screenshotFilename: req.file.originalname,
      verified: false,
      status: "submitted",
      receiptIssued: false,
      receiptId: null,
    };
    getState().payments.set(req.studentId, record);
    return res.status(201).json(record);
  });

  app.get("/api/payment/status", requireAuth, (req, res) => {
    const record = getState().payments.get(req.studentId) || null;
    return res.status(200).json(record);
  });

  // R8/R9 - simulated bank verification of a previously submitted payment
  app.post("/api/payment/verify", requireAuth, (req, res) => {
    const { payments, bankRecords } = getState();
    const record = payments.get(req.studentId);
    if (!record) {
      return res.status(404).json({ error: "No payment submitted" });
    }

    const txnCheck = validateTransactionNumber(record.transactionNumber);
    const result = verifyPayment({
      screenshotProvided: Boolean(record.screenshotFilename),
      transactionNumberValid: txnCheck.valid,
      matchesBankRecord: bankRecords.has(record.transactionNumber),
    });

    record.verified = result.verified;
    record.status = result.status;
    record.receiptIssued = result.receiptIssued;
    record.receiptId = result.receiptIssued ? `RCPT-${crypto.randomBytes(4).toString("hex")}` : null;
    payments.set(req.studentId, record);

    return res.status(200).json(record);
  });

  // --- Decision table: registration eligibility ----------------------------

  app.post("/api/registration/decide", requireAuth, (req, res) => {
    const { moduleCode, drugReportVerified } = req.body || {};
    if (!moduleCode) {
      return res.status(400).json({ error: "moduleCode is required" });
    }

    const { payments, enrolledModules, settings, registrations } = getState();
    const enrollmentKey = `${req.studentId}:${moduleCode}`;

    if (enrolledModules.has(enrollmentKey)) {
      const outcome = { allowed: false, message: "Module already registered for this semester." };
      registrations.set(enrollmentKey, { ...outcome, moduleCode, updatedAt: Date.now() });
      return res.status(200).json(outcome);
    }

    const paymentRecord = payments.get(req.studentId);
    const outcome = decideRegistration({
      paymentVerified: Boolean(paymentRecord && paymentRecord.verified),
      drugReportVerified: Boolean(drugReportVerified),
      registrationPeriodOpen: Boolean(settings.registrationPeriodOpen),
    });

    registrations.set(enrollmentKey, { ...outcome, moduleCode, updatedAt: Date.now() });
    if (outcome.allowed) {
      enrolledModules.set(enrollmentKey, "current");
    }

    return res.status(200).json(outcome);
  });

  // demo/admin toggle used to exercise C3 (Registration Period Open?) from the UI
  app.put("/api/admin/settings", (req, res) => {
    const { registrationPeriodOpen } = req.body || {};
    if (typeof registrationPeriodOpen === "boolean") {
      getState().settings.registrationPeriodOpen = registrationPeriodOpen;
    }
    return res.status(200).json(getState().settings);
  });

  app.get("/api/admin/settings", (req, res) => {
    return res.status(200).json(getState().settings);
  });

  // --- Section 4: results -------------------------------------------------

  function isRegistered(studentId) {
    const { enrolledModules } = getState();
    for (const key of enrolledModules.keys()) {
      if (key.startsWith(`${studentId}:`)) return true;
    }
    return false;
  }

  app.get("/api/results", requireAuth, (req, res) => {
    if (!isRegistered(req.studentId)) {
      return res.status(403).json({ error: "Access denied - results not displayed" });
    }
    const results = getState().results.get(req.studentId) || [];
    return res.status(200).json(results);
  });

  app.get("/api/results/download", requireAuth, (req, res) => {
    if (!isRegistered(req.studentId)) {
      return res.status(403).json({ error: "Access denied - results not displayed" });
    }
    const results = getState().results.get(req.studentId) || [];

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="results-${req.studentId}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(18).text("CST College - Student Results", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Student ID: ${req.studentId}`);
    doc.moveDown();
    results.forEach((r) => {
      doc.text(`${r.moduleCode}  -  ${r.moduleTitle}  -  Grade: ${r.grade}`);
    });
    if (results.length === 0) {
      doc.text("No results on file.");
    }
    doc.end();
  });

  app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

  // --- Lab 5: Student CRUD (add/view/list/update/delete), Postgres-backed --

  app.post("/api/students", async (req, res) => {
    const { studentId, name, email, program, password } = req.body || {};

    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return res.status(400).json({ error: idCheck.error });
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const student = await studentRepository.createStudent(pool, {
        studentId,
        name,
        email,
        program,
        password,
      });
      return res.status(201).json(student);
    } catch (err) {
      if (err instanceof DuplicateStudentError) {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.get("/api/students", async (req, res) => {
    const students = await studentRepository.listStudents(pool);
    return res.status(200).json(students);
  });

  app.get("/api/students/:studentId", async (req, res) => {
    const idCheck = validateStudentId(req.params.studentId);
    if (!idCheck.valid) return res.status(400).json({ error: idCheck.error });

    const student = await studentRepository.getStudent(pool, req.params.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    return res.status(200).json(student);
  });

  app.put("/api/students/:studentId", async (req, res) => {
    const idCheck = validateStudentId(req.params.studentId);
    if (!idCheck.valid) return res.status(400).json({ error: idCheck.error });

    const { name, email, program, password } = req.body || {};
    try {
      const student = await studentRepository.updateStudent(pool, req.params.studentId, {
        name,
        email,
        program,
        password,
      });
      return res.status(200).json(student);
    } catch (err) {
      if (err instanceof StudentNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/students/:studentId", async (req, res) => {
    const idCheck = validateStudentId(req.params.studentId);
    if (!idCheck.valid) return res.status(400).json({ error: idCheck.error });

    try {
      await studentRepository.deleteStudent(pool, req.params.studentId);
      return res.status(204).send();
    } catch (err) {
      if (err instanceof StudentNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: "Failed to delete student" });
    }
  });

  return app;
}

module.exports = { createApp };

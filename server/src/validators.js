/**
 * Pure validation / business-rule functions derived from the SWE302 Lab 1 SRS (R1-R9)
 * and the Student Registration decision table. Kept dependency-free so they can be
 * unit tested directly (Equivalence Partitioning / Boundary Value Analysis / Decision Table).
 */

const ALLOWED_SCREENSHOT_EXTENSIONS = ["jpg", "jpeg", "png"];
const STUDENT_ID_LENGTH = 8;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 12;
const TRANSACTION_NUMBER_REGEX = /^\d{3}-\d{9}$/;

function fail(error) {
  return { valid: false, error };
}

function ok() {
  return { valid: true, error: null };
}

// R1, R2 - Student ID is mandatory, exactly 8 digits, numeric only
function validateStudentId(studentId) {
  if (studentId === undefined || studentId === null || studentId === "") {
    return fail("Student ID is required");
  }
  if (!/^\d+$/.test(studentId)) {
    return fail("Student ID must be numeric only");
  }
  if (studentId.length !== STUDENT_ID_LENGTH) {
    return fail(`Student ID must be exactly ${STUDENT_ID_LENGTH} digits`);
  }
  return ok();
}

// R3, R4 - Password is mandatory, 8-12 chars, >=1 upper, >=1 lower, >=1 number
function validatePassword(password) {
  if (password === undefined || password === null || password === "") {
    return fail("Password is required");
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return fail(
      `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`
    );
  }
  if (!/[A-Z]/.test(password)) {
    return fail("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    return fail("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    return fail("Password must contain at least one number");
  }
  return ok();
}

// R5 - Payment must be made via Mobile Banking only
function validatePaymentMethod(method) {
  if (method !== "mobile-banking") {
    return fail("Payment not accepted - Mobile Banking only");
  }
  return ok();
}

// R6 - Payment screenshot is mandatory; must be JPG, JPEG or PNG
function validatePaymentScreenshot(filename) {
  if (!filename) {
    return fail("Payment screenshot is required");
  }
  const parts = filename.split(".");
  const extension = parts.length > 1 ? parts.pop().toLowerCase() : "";
  if (!ALLOWED_SCREENSHOT_EXTENSIONS.includes(extension)) {
    return fail("Only JPG, JPEG or PNG accepted");
  }
  return ok();
}

// R7 - Transaction number is mandatory; format = 3 digits + hyphen + 9 digits (13 chars)
function validateTransactionNumber(transactionNumber) {
  if (!transactionNumber) {
    return fail("Transaction number is required");
  }
  if (!transactionNumber.includes("-")) {
    return fail("Hyphen separator missing");
  }
  if (!TRANSACTION_NUMBER_REGEX.test(transactionNumber)) {
    return fail("Invalid transaction number format");
  }
  return ok();
}

// R8, R9 - verification outcome for a submitted payment
function verifyPayment({ screenshotProvided, transactionNumberValid, matchesBankRecord }) {
  if (screenshotProvided && transactionNumberValid && matchesBankRecord) {
    return { verified: true, status: "complete", receiptIssued: true };
  }
  return { verified: false, status: "incomplete", receiptIssued: false };
}

// Decision table (Step 4): C1 Tuition Payment Verified, C2 Drug Testing Report Verified,
// C3 Registration Period Open. Message priority: Payment -> Drug Testing Report -> Registration Period.
function decideRegistration({ paymentVerified, drugReportVerified, registrationPeriodOpen }) {
  if (!paymentVerified) {
    return { allowed: false, message: "Tuition payment not verified." };
  }
  if (!drugReportVerified) {
    return { allowed: false, message: "Drug testing report not verified." };
  }
  if (!registrationPeriodOpen) {
    return { allowed: false, message: "Registration period is closed." };
  }
  return { allowed: true, message: null };
}

module.exports = {
  ALLOWED_SCREENSHOT_EXTENSIONS,
  STUDENT_ID_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  TRANSACTION_NUMBER_REGEX,
  validateStudentId,
  validatePassword,
  validatePaymentMethod,
  validatePaymentScreenshot,
  validateTransactionNumber,
  verifyPayment,
  decideRegistration,
};

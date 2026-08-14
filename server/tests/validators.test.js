/**
 * Equivalence Partitioning unit tests (Lab 1, Activity 1) for validateStudentId,
 * validatePassword, validatePaymentScreenshot and validateTransactionNumber.
 */
const {
  validateStudentId,
  validatePassword,
  validatePaymentMethod,
  validatePaymentScreenshot,
  validateTransactionNumber,
} = require("../src/validators");

describe("validateStudentId (R1, R2) - Activity 1 table 2.1 / TC01-TC05", () => {
  test("TC01: 8 numeric digits is valid", () => {
    expect(validateStudentId("02240353").valid).toBe(true);
  });

  test("TC02 / R1: empty value is rejected as required", () => {
    const result = validateStudentId("");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  test("TC03: 7 digits (below length) is rejected", () => {
    const result = validateStudentId("0224035");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exactly 8 digits/i);
  });

  test("TC04: 9 digits (above length) is rejected", () => {
    const result = validateStudentId("022403531");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exactly 8 digits/i);
  });

  test("TC05: alphabetic character is rejected as non-numeric", () => {
    const result = validateStudentId("02A40353");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/numeric only/i);
  });

  test("10 digits (above length) is rejected", () => {
    expect(validateStudentId("0224024012").valid).toBe(false);
  });

  test("value containing a space is rejected as non-numeric", () => {
    const result = validateStudentId("0224 35");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/numeric only/i);
  });
});

describe("validatePassword (R3, R4) - Activity 1 table 2.2 / TC06-TC12", () => {
  test("TC06: 8 chars with upper/lower/digit is valid", () => {
    expect(validatePassword("Cst2026a").valid).toBe(true);
  });

  test("12 chars satisfying all rules is valid", () => {
    expect(validatePassword("Bhutan2026Cs").valid).toBe(true);
  });

  test("TC07 / R3: empty value is rejected as required", () => {
    const result = validatePassword("");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  test("TC08: 7 chars (below minimum) is rejected", () => {
    const result = validatePassword("Cst2026");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/8-12 characters/i);
  });

  test("TC09: 13 chars (above maximum) is rejected", () => {
    const result = validatePassword("Cst2026abcdef");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/8-12 characters/i);
  });

  test("14 chars (above maximum) is rejected", () => {
    expect(validatePassword("Bhutan2026Cst1").valid).toBe(false);
  });

  test("TC10: missing uppercase letter is rejected", () => {
    const result = validatePassword("cst2026ab");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/uppercase/i);
  });

  test("TC11: missing lowercase letter is rejected", () => {
    const result = validatePassword("CST2026AB");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/lowercase/i);
  });

  test("TC12: missing numeric digit is rejected", () => {
    const result = validatePassword("CstPassword");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/number/i);
  });
});

describe("validatePaymentMethod (R5) - TC14", () => {
  test("mobile-banking is accepted", () => {
    expect(validatePaymentMethod("mobile-banking").valid).toBe(true);
  });

  test("TC14: cash payment is rejected", () => {
    const result = validatePaymentMethod("cash");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mobile banking only/i);
  });
});

describe("validatePaymentScreenshot (R6) - Activity 1 table 2.3 / TC15-TC17", () => {
  test.each(["receipt.jpg", "receipt.jpeg", "receipt.png"])(
    "TC15: %s is an allowed file type",
    (filename) => {
      expect(validatePaymentScreenshot(filename).valid).toBe(true);
    }
  );

  test("TC16: receipt.pdf is rejected", () => {
    const result = validatePaymentScreenshot("receipt.pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/JPG, JPEG or PNG/i);
  });

  test("receipt.gif is rejected", () => {
    expect(validatePaymentScreenshot("receipt.gif").valid).toBe(false);
  });

  test("TC17: no file selected is rejected as required", () => {
    const result = validatePaymentScreenshot(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });
});

describe("validateTransactionNumber (R7) - Activity 1 table 2.4 / TC18-TC22", () => {
  test("TC18: 3 digits + hyphen + 9 digits is valid", () => {
    expect(validateTransactionNumber("452-908371245").valid).toBe(true);
  });

  test("TC22 / required: empty value is rejected", () => {
    const result = validateTransactionNumber("");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  test("only 2 digits before the hyphen is rejected", () => {
    expect(validateTransactionNumber("45-908371245").valid).toBe(false);
  });

  test("4 digits before the hyphen is rejected", () => {
    expect(validateTransactionNumber("4523-908371245").valid).toBe(false);
  });

  test("TC19: only 8 digits after the hyphen (12 chars) is rejected", () => {
    const result = validateTransactionNumber("452-90837124");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid transaction number format/i);
  });

  test("TC20: 10 digits after the hyphen (14 chars) is rejected", () => {
    const result = validateTransactionNumber("452-9083712456");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid transaction number format/i);
  });

  test("TC21: missing hyphen separator is rejected with a specific message", () => {
    const result = validateTransactionNumber("452908371245");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/hyphen separator missing/i);
  });

  test("alphabetic characters in the numeric segment are rejected", () => {
    expect(validateTransactionNumber("ABC-908371245").valid).toBe(false);
  });
});

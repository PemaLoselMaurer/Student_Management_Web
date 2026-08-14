/**
 * Boundary Value Analysis unit tests (Lab 1, Activity 2, tables 3.1-3.3).
 */
const { validateStudentId, validatePassword, validateTransactionNumber } = require("../src/validators");

describe("3.1 Student ID length boundary (R2 - exactly 8 digits)", () => {
  test("Lower - 1: 7 digits is rejected", () => {
    expect(validateStudentId("0418056").valid).toBe(false);
  });
  test("On boundary: 8 digits is accepted", () => {
    expect(validateStudentId("04180567").valid).toBe(true);
  });
  test("Upper + 1: 9 digits is rejected", () => {
    expect(validateStudentId("041805678").valid).toBe(false);
  });
});

describe("3.2 Password length boundary (R4 - 8 to 12 characters)", () => {
  test("Min - 1: 7 chars is rejected", () => {
    expect(validatePassword("Cst2026").valid).toBe(false);
  });
  test("Min: 8 chars is accepted", () => {
    expect(validatePassword("Cst2026a").valid).toBe(true);
  });
  test("Min + 1: 9 chars is accepted", () => {
    expect(validatePassword("Cst2026ab").valid).toBe(true);
  });
  test("Max - 1: 11 chars is accepted", () => {
    expect(validatePassword("Cst2026abcd").valid).toBe(true);
  });
  test("Max: 12 chars is accepted", () => {
    expect(validatePassword("Cst2026abcde").valid).toBe(true);
  });
  test("Max + 1: 13 chars is rejected", () => {
    expect(validatePassword("Cst2026abcdef").valid).toBe(false);
  });
});

describe("3.3 Transaction Number boundary (R7 - 3 digits + hyphen + 9 digits = 13 chars)", () => {
  test("Total - 1: second segment one digit short (12 chars) is rejected", () => {
    expect(validateTransactionNumber("452-90837124").valid).toBe(false);
  });
  test("Correct format: 13 chars is accepted", () => {
    expect(validateTransactionNumber("452-908371245").valid).toBe(true);
  });
  test("Total + 1: second segment one digit too long (14 chars) is rejected", () => {
    expect(validateTransactionNumber("452-9083712456").valid).toBe(false);
  });
  test("Segment shift: correct total length but wrong split (2 + 10) is rejected", () => {
    expect(validateTransactionNumber("45-9083712456").valid).toBe(false);
  });
});

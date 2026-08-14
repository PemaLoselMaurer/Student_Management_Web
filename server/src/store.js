/**
 * In-memory data store for the demo Student Management System.
 * Not persisted - intended for lab/demo purposes. `resetStore()` lets tests
 * start from a clean, deterministic state.
 */

function seed() {
  return {
    students: new Map([
      ["02240353", { studentId: "02240353", password: "Cst2026a", name: "Pema Losel Maurer" }],
      ["87654321", { studentId: "87654321", password: "Bhutan2026Cs", name: "Demo Student" }],
    ]),
    sessions: new Map(), // token -> studentId
    payments: new Map(), // studentId -> payment record
    registrations: new Map(), // `${studentId}:${moduleCode}` -> { allowed, message, moduleCode, updatedAt }
    results: new Map([
      [
        "02240353",
        [{ moduleCode: "SWE302", moduleTitle: "Software Testing & Quality Assurance", grade: "A" }],
      ],
    ]),
    settings: {
      registrationPeriodOpen: true,
    },
    // mock "bank" records used to verify a submitted transaction number (R8/R9)
    bankRecords: new Set(["452-908371245"]),
    // module registrations already on file, keyed by `${studentId}:${moduleCode}` -> semester, used for TC30
    enrolledModules: new Map([["02240353:SWE302", "Autumn 2026"]]),
  };
}

let state = seed();

function resetStore() {
  state = seed();
}

function getState() {
  return state;
}

module.exports = { getState, resetStore };

/**
 * In-memory store for the SMS's transactional/session data (Lab 1-4 SRS).
 * Student master records themselves now live in Postgres - see db.js and
 * studentRepository.js - since that's the data this store used to hold.
 * `resetStore()` lets tests start from a clean, deterministic state.
 */

function seed() {
  return {
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

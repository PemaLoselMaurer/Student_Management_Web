/**
 * Decision Table unit tests (Lab 1, Activity 3 - Student Registration).
 * Conditions: C1 Tuition Payment Verified, C2 Drug Testing Report Verified,
 * C3 Registration Period Open. Message priority: Payment -> Drug Report -> Period.
 * All 2^3 = 8 rule combinations are exercised (Rule 1 = TC29, Rule 2 = TC28,
 * Rule 3/4 = TC26, Rule 5-8 = TC27).
 */
const { decideRegistration } = require("../src/validators");

describe("decideRegistration - all 8 rule combinations", () => {
  test("Rule 1 (Y,Y,Y) / TC29: registration allowed", () => {
    const result = decideRegistration({
      paymentVerified: true,
      drugReportVerified: true,
      registrationPeriodOpen: true,
    });
    expect(result.allowed).toBe(true);
    expect(result.message).toBeNull();
  });

  test("Rule 2 (Y,Y,N) / TC28: rejected - registration period is closed", () => {
    const result = decideRegistration({
      paymentVerified: true,
      drugReportVerified: true,
      registrationPeriodOpen: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Registration period is closed.");
  });

  test("Rule 3 (Y,N,Y) / TC26: rejected - drug testing report not verified", () => {
    const result = decideRegistration({
      paymentVerified: true,
      drugReportVerified: false,
      registrationPeriodOpen: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Drug testing report not verified.");
  });

  test("Rule 4 (Y,N,N): rejected - drug testing report not verified", () => {
    const result = decideRegistration({
      paymentVerified: true,
      drugReportVerified: false,
      registrationPeriodOpen: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Drug testing report not verified.");
  });

  test("Rule 5 (N,Y,Y) / TC27: rejected - tuition payment not verified", () => {
    const result = decideRegistration({
      paymentVerified: false,
      drugReportVerified: true,
      registrationPeriodOpen: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Tuition payment not verified.");
  });

  test("Rule 6 (N,Y,N): rejected - tuition payment not verified", () => {
    const result = decideRegistration({
      paymentVerified: false,
      drugReportVerified: true,
      registrationPeriodOpen: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Tuition payment not verified.");
  });

  test("Rule 7 (N,N,Y): rejected - tuition payment not verified", () => {
    const result = decideRegistration({
      paymentVerified: false,
      drugReportVerified: false,
      registrationPeriodOpen: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Tuition payment not verified.");
  });

  test("Rule 8 (N,N,N): rejected - tuition payment not verified", () => {
    const result = decideRegistration({
      paymentVerified: false,
      drugReportVerified: false,
      registrationPeriodOpen: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.message).toBe("Tuition payment not verified.");
  });
});

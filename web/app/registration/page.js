"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSession } from "@/lib/api";

export default function RegistrationPage() {
  const [moduleCode, setModuleCode] = useState("SWE401");
  const [drugReportVerified, setDrugReportVerified] = useState(true);
  const [periodOpen, setPeriodOpen] = useState(true);
  const [outcome, setOutcome] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!getSession()) {
      router.push("/login");
      return;
    }
    api
      .getSettings()
      .then((s) => setPeriodOpen(s.registrationPeriodOpen))
      .catch(() => {});
  }, [router]);

  async function togglePeriod() {
    const next = !periodOpen;
    const settings = await api.setSettings(next);
    setPeriodOpen(settings.registrationPeriodOpen);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOutcome(null);
    setLoading(true);
    try {
      const data = await api.decideRegistration(moduleCode, drugReportVerified);
      setOutcome(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="card max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1">Course registration</h1>
        <p className="text-sm text-slate-500 mb-4">
          To register for a module, your tuition payment must be verified, your health clearance must be on file,
          and the registration window must be open.
        </p>

        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 mb-4 flex items-center justify-between text-sm">
          <span>
            Registration window:{" "}
            <span className={periodOpen ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
              {periodOpen ? "Open" : "Closed"}
            </span>
          </span>
          <button onClick={togglePeriod} className="btn-secondary !px-2 !py-1 text-xs">
            Registrar override
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Module Code</label>
            <input
              className="field-input"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
              placeholder="SWE401"
            />
            <p className="text-xs text-slate-400 mt-1">
              Make sure this matches a module with a verified payment on the Payment page.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={drugReportVerified}
              onChange={(e) => setDrugReportVerified(e.target.checked)}
            />
            Health &amp; drug clearance on file
          </label>

          {error ? <p className="alert-error">{error}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Checking..." : "Register for module"}
          </button>
        </form>

        {outcome ? (
          <div className={`mt-4 ${outcome.allowed ? "alert-success" : "alert-error"}`}>
            {outcome.allowed ? `You're registered for ${moduleCode}.` : outcome.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

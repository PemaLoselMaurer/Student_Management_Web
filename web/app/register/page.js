"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.register(studentId, password);
      setSuccess("Account created. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="card max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-slate-500 mb-4">
          Use the 8-digit Student ID printed on your admission letter, and choose a password to protect your
          account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Student ID</label>
            <input
              className="field-input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 02240353"
              maxLength={12}
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              maxLength={20}
            />
            <p className="text-xs text-slate-400 mt-1">
              8&ndash;12 characters, with at least one uppercase letter, one lowercase letter and one number.
            </p>
          </div>

          {error ? <p className="alert-error">{error}</p> : null}
          {success ? <p className="alert-success">{success}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Already registered?{" "}
          <a href="/login" className="text-brand-600 font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

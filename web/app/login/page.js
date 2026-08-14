"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setSession } from "@/lib/api";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(studentId, password);
      setSession(data);
      router.push("/payment");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="card max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-4">Log in with your Student ID and password to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Student ID</label>
            <input
              className="field-input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="02240353"
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error ? <p className="alert-error">{error}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          New here?{" "}
          <a href="/register" className="text-brand-600 font-medium hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}

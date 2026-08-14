const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getSession() {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("sms_token");
  const studentId = window.localStorage.getItem("sms_studentId");
  const name = window.localStorage.getItem("sms_name");
  if (!token || !studentId) return null;
  return { token, studentId, name };
}

export function setSession({ token, studentId, name }) {
  window.localStorage.setItem("sms_token", token);
  window.localStorage.setItem("sms_studentId", studentId);
  window.localStorage.setItem("sms_name", name || "");
}

export function clearSession() {
  window.localStorage.removeItem("sms_token");
  window.localStorage.removeItem("sms_studentId");
  window.localStorage.removeItem("sms_name");
}

async function request(path, { method = "GET", body, isForm = false, auth = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const session = getSession();
    if (session) headers["Authorization"] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const error = new Error((data && data.error) || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  register: (studentId, password) => request("/api/register", { method: "POST", body: { studentId, password } }),
  login: (studentId, password) => request("/api/login", { method: "POST", body: { studentId, password } }),
  submitPayment: (formData) => request("/api/payment", { method: "POST", body: formData, isForm: true, auth: true }),
  paymentStatus: () => request("/api/payment/status", { auth: true }),
  verifyPayment: () => request("/api/payment/verify", { method: "POST", auth: true }),
  decideRegistration: (moduleCode, drugReportVerified) =>
    request("/api/registration/decide", {
      method: "POST",
      auth: true,
      body: { moduleCode, drugReportVerified },
    }),
  getSettings: () => request("/api/admin/settings"),
  setSettings: (registrationPeriodOpen) =>
    request("/api/admin/settings", { method: "PUT", body: { registrationPeriodOpen } }),
  getResults: () => request("/api/results", { auth: true }),
  resultsDownloadUrl: () => `${API_URL}/api/results/download`,
};

export { API_URL };

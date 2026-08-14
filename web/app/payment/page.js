"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSession } from "@/lib/api";

export default function PaymentPage() {
  const [moduleCode, setModuleCode] = useState("SWE401");
  const [paymentMethod, setPaymentMethod] = useState("mobile-banking");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!getSession()) {
      router.push("/login");
      return;
    }
    api
      .paymentStatus()
      .then(setRecord)
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("moduleCode", moduleCode);
      formData.append("paymentMethod", paymentMethod);
      formData.append("transactionNumber", transactionNumber);
      if (file) formData.append("screenshot", file);

      const data = await api.submitPayment(formData);
      setRecord(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError("");
    setVerifying(true);
    try {
      const data = await api.verifyPayment();
      setRecord(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="card max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1">Pay tuition fees</h1>
        <p className="text-sm text-slate-500 mb-4">
          Pay via Mobile Banking, then upload your payment confirmation and transaction number below so we can
          verify it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Module Code</label>
            <input
              className="field-input"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
              placeholder="SWE302"
            />
          </div>

          <div>
            <label className="field-label">Payment Method</label>
            <select
              className="field-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="mobile-banking">Mobile Banking</option>
              <option value="cash">Cash / Bank Counter</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Only Mobile Banking payments can be verified online.</p>
          </div>

          <div>
            <label className="field-label">Transaction Number</label>
            <input
              className="field-input"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="452-908371245"
            />
          </div>

          <div>
            <label className="field-label">Payment Confirmation Screenshot</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="field-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-slate-400 mt-1">JPG, JPEG or PNG only.</p>
          </div>

          {error ? <p className="alert-error">{error}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Submitting..." : "Submit payment"}
          </button>
        </form>
      </div>

      {record ? (
        <div className="card max-w-lg mx-auto">
          <h2 className="font-semibold mb-2">Payment status</h2>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-slate-500">Module</dt>
            <dd>{record.moduleCode}</dd>
            <dt className="text-slate-500">Transaction No.</dt>
            <dd>{record.transactionNumber}</dd>
            <dt className="text-slate-500">Status</dt>
            <dd className="capitalize">{record.status}</dd>
            {record.receiptIssued ? (
              <>
                <dt className="text-slate-500">Receipt</dt>
                <dd className="text-emerald-600 font-medium">{record.receiptId}</dd>
              </>
            ) : null}
          </dl>

          {!record.verified ? (
            <button onClick={handleVerify} disabled={verifying} className="btn-secondary mt-4">
              {verifying ? "Checking with bank..." : "Confirm & verify payment"}
            </button>
          ) : (
            <p className="alert-success mt-4">Payment confirmed &mdash; your electronic receipt is ready.</p>
          )}
          {record.status === "incomplete" ? (
            <p className="alert-error mt-4">
              We couldn&apos;t verify this payment. Please double-check your transaction number and try again.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

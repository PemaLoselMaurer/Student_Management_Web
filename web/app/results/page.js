"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSession } from "@/lib/api";

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    api
      .getResults()
      .then(setResults)
      .catch((err) => setError(err.message));
  }, [router]);

  async function handleDownload() {
    const session = getSession();
    setDownloading(true);
    try {
      const res = await fetch(api.resultsDownloadUrl(), {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error("Download failed - access denied");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `results-${session.studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="card max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1">Your results</h1>
        <p className="text-sm text-slate-500 mb-4">Grades appear here once you&apos;re registered for a module.</p>

        {error ? <p className="alert-error">{error}</p> : null}

        {results && results.length > 0 ? (
          <>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-2">Module Code</th>
                  <th className="py-2">Module Title</th>
                  <th className="py-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.moduleCode} className="border-b border-slate-100">
                    <td className="py-2">{r.moduleCode}</td>
                    <td className="py-2">{r.moduleTitle}</td>
                    <td className="py-2 font-semibold">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={handleDownload} disabled={downloading} className="btn-primary mt-4">
              {downloading ? "Preparing PDF..." : "Download results (PDF)"}
            </button>
          </>
        ) : results && results.length === 0 ? (
          <p className="text-sm text-slate-500">No results on file yet.</p>
        ) : null}
      </div>
    </div>
  );
}

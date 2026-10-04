/**
 * Lab 6 - builds the Section 7 results tables from the .jtl and *_resources.csv files.
 *
 * Steady-state rule (applied identically to every run): samples that START before
 * (first sample start + ramp-up) are excluded, so statistics cover only the period
 * in which all virtual users were active. Percentiles use the nearest-rank method,
 * so they can differ by a millisecond or two from the JMeter HTML dashboard, which
 * reports the whole run including ramp-up.
 *
 * Usage: node analyze-results.js   ->  results/summary.md and results/summary.csv
 */
const fs = require("fs");
const path = require("path");

const RESULTS = path.join(__dirname, "results");
const RUNS = [
  { name: "baseline_r1", load: "Baseline", users: 5, ramp: 5, duration: 65, think: "1-2 s" },
  { name: "baseline_r2", load: "Baseline", users: 5, ramp: 5, duration: 65, think: "1-2 s" },
  { name: "moderate_r1", load: "Moderate", users: 20, ramp: 10, duration: 70, think: "1-2 s" },
  { name: "moderate_r2", load: "Moderate", users: 20, ramp: 10, duration: 70, think: "1-2 s" },
  { name: "higher_r1", load: "Higher", users: 50, ramp: 20, duration: 80, think: "1-2 s" },
  { name: "higher_r2", load: "Higher", users: 50, ramp: 20, duration: 80, think: "1-2 s" },
  { name: "nothink_moderate_r1", load: "Moderate, no think time", users: 20, ramp: 10, duration: 70, think: "0" },
  { name: "nothink_moderate_r2", load: "Moderate, no think time", users: 20, ramp: 10, duration: 70, think: "0" },
];
const TX_PREFIX = "TX ";

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function readCsv(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = parseCsvLine(l);
    return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  });
}

function percentile(sorted, p) {
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
}

function stats(samples, windowSec) {
  const t = samples.map((s) => s.elapsed).sort((a, b) => a - b);
  const errors = samples.filter((s) => !s.success).length;
  return {
    samples: t.length,
    avg: t.reduce((a, b) => a + b, 0) / t.length,
    median: percentile(t, 50),
    p95: percentile(t, 95),
    p99: percentile(t, 99),
    max: t[t.length - 1],
    errorPct: (errors / t.length) * 100,
    throughput: t.length / windowSec,
  };
}

function analyseRun(run) {
  const rows = readCsv(path.join(RESULTS, `${run.name}.jtl`)).map((r) => ({
    ts: Number(r.timeStamp),
    elapsed: Number(r.elapsed),
    label: r.label,
    success: r.success === "true",
  }));
  const start = rows.reduce((m, r) => Math.min(m, r.ts), Infinity);
  const steadyFrom = start + run.ramp * 1000;
  const end = rows.reduce((m, r) => Math.max(m, r.ts + r.elapsed), 0);
  const windowSec = (end - steadyFrom) / 1000;
  const steady = rows.filter((r) => r.ts >= steadyFrom);

  const labels = [...new Set(steady.map((r) => r.label))].sort();
  const perLabel = labels.map((label) => ({
    label,
    ...stats(steady.filter((r) => r.label === label), windowSec),
  }));
  const requests = steady.filter((r) => !r.label.startsWith(TX_PREFIX));

  const res = readCsv(path.join(RESULTS, `${run.name}_resources.csv`)).filter(
    (r) => r.api_cpu_pct !== undefined
  );
  const col = (k) => res.map((r) => Number(r[k]));
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const resources = {
    totalCpuAvg: avg(col("total_cpu_pct")),
    totalCpuMax: Math.max(...col("total_cpu_pct")),
    apiCpuAvg: avg(col("api_cpu_pct")),
    apiCpuMax: Math.max(...col("api_cpu_pct")),
    apiMemMax: Math.max(...col("api_mem_mb")),
    jmeterCpuAvg: avg(col("jmeter_cpu_pct")),
    jmeterMemMax: Math.max(...col("jmeter_mem_mb")),
    pgCpuAvg: avg(col("postgres_cpu_pct")),
    pgCpuMax: Math.max(...col("postgres_cpu_pct")),
    minFreeMb: Math.min(...col("available_mb")),
  };

  return {
    run,
    windowSec,
    excluded: rows.length - steady.length,
    perLabel,
    allRequests: { label: "ALL requests (excl. TX)", ...stats(requests, windowSec) },
    resources,
  };
}

const f0 = (n) => n.toFixed(0);
const f1 = (n) => n.toFixed(1);
const f2 = (n) => n.toFixed(2);

const results = RUNS.map(analyseRun);
const md = [];
const csv = [
  "run,load,users,ramp_s,duration_s,think,steady_window_s,label,samples,avg_ms,median_ms,p95_ms,p99_ms,max_ms,error_pct,throughput_per_s",
];

md.push("# Lab 6 results (steady state, ramp-up excluded)\n");
md.push("Throughput unit: completed samples per second over the steady window. " +
  "Request rows and transaction (TX) rows are reported separately; the TX row is the sum of " +
  "02 Create + 04 View Created + 05 Update and excludes timer delay.\n");

md.push("## 1. Overview per run (all individual requests, TX excluded)\n");
md.push("| Run | Users | Ramp-up | Duration | Think time | Steady window | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput req/s |");
md.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const r of results) {
  const s = r.allRequests;
  md.push(`| ${r.run.name} | ${r.run.users} | ${r.run.ramp} s | ${r.run.duration} s | ${r.run.think} | ${f1(r.windowSec)} s | ${s.samples} | ${f1(s.avg)} | ${s.median} | ${s.p95} | ${s.p99} | ${s.max} | ${f2(s.errorPct)} | ${f1(s.throughput)} |`);
}

md.push("\n## 2. Transaction: TX Create and Verify Student\n");
md.push("| Run | Users | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput tx/s |");
md.push("|---|---|---|---|---|---|---|---|---|---|");
for (const r of results) {
  const s = r.perLabel.find((l) => l.label.startsWith(TX_PREFIX));
  if (s) md.push(`| ${r.run.name} | ${r.run.users} | ${s.samples} | ${f1(s.avg)} | ${s.median} | ${s.p95} | ${s.p99} | ${s.max} | ${f2(s.errorPct)} | ${f2(s.throughput)} |`);
}

md.push("\n## 3. Per operation, per run\n");
for (const r of results) {
  md.push(`### ${r.run.name} (${r.run.users} users, ramp-up ${r.run.ramp} s, ${r.run.duration} s, think ${r.run.think}; ${r.excluded} ramp-up samples excluded)\n`);
  md.push("| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |");
  md.push("|---|---|---|---|---|---|---|---|---|");
  for (const s of [...r.perLabel, r.allRequests]) {
    md.push(`| ${s.label} | ${s.samples} | ${f1(s.avg)} | ${s.median} | ${s.p95} | ${s.p99} | ${s.max} | ${f2(s.errorPct)} | ${f2(s.throughput)} |`);
  }
  md.push("");
}

md.push("## 4. Resource usage (sampled every second for the whole run; % of all 20 logical CPUs)\n");
md.push("| Run | Total CPU avg / max % | API (node) CPU avg / max % | API mem max MB | JMeter CPU avg % | JMeter mem max MB | PostgreSQL CPU avg / max % | Min free RAM MB |");
md.push("|---|---|---|---|---|---|---|---|");
for (const r of results) {
  const x = r.resources;
  md.push(`| ${r.run.name} | ${f1(x.totalCpuAvg)} / ${f1(x.totalCpuMax)} | ${f1(x.apiCpuAvg)} / ${f1(x.apiCpuMax)} | ${f0(x.apiMemMax)} | ${f1(x.jmeterCpuAvg)} | ${f0(x.jmeterMemMax)} | ${f1(x.pgCpuAvg)} / ${f1(x.pgCpuMax)} | ${f0(x.minFreeMb)} |`);
}
md.push("\nOne logical CPU = 5 % of the machine, so a single-threaded process that is fully busy shows about 5 %.");

for (const r of results) {
  for (const s of [...r.perLabel, r.allRequests]) {
    csv.push([r.run.name, r.run.load, r.run.users, r.run.ramp, r.run.duration, r.run.think, f1(r.windowSec),
      `"${s.label}"`, s.samples, f1(s.avg), s.median, s.p95, s.p99, s.max, f2(s.errorPct), f2(s.throughput)].join(","));
  }
}

fs.writeFileSync(path.join(RESULTS, "summary.md"), md.join("\n") + "\n");
fs.writeFileSync(path.join(RESULTS, "summary.csv"), csv.join("\n") + "\n");
console.log(md.slice(0, 30).join("\n"));

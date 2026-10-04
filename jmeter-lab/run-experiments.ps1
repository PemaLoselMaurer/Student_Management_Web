<#
  Lab 6 - runs the measured JMeter experiments in non-GUI mode.

  For every run it:
    1. resets the database (removes JMeter-created students, re-seeds login accounts)
    2. samples CPU / memory of the API (node) and JMeter (java) once per second
    3. runs JMeter non-GUI, writing results\<run>.jtl and the HTML dashboard reports\<run>\

  Prerequisites: the API is running on http://localhost:4000 (see README.md),
  and the JMeter GUI is closed so it does not compete for CPU.

  Usage (PowerShell, from this folder):
    $env:DATABASE_URL = "postgres://postgres:<password>@localhost:5432/cst_sms"
    .\run-experiments.ps1                         # warm-up + all measured runs
    .\run-experiments.ps1 -Runs baseline_r1       # a single run
#>
param(
  [string[]]$Runs,
  [string]$JMeterBin = "$env:USERPROFILE\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin"
)

$ErrorActionPreference = "Stop"
$LabDir = $PSScriptRoot
$ServerDir = Join-Path $LabDir "..\server"
$Plan = Join-Path $LabDir "performance_test.jmx"

# name, users, ramp-up (s), duration (s) = ramp-up + 60 s measured, think-time constant / random (ms)
$AllRuns = @(
  @{ Name = "warmup";          Users = 5;  Ramp = 5;  Duration = 25; ThinkConst = 1000; ThinkRand = 1000 },
  @{ Name = "baseline_r1";     Users = 5;  Ramp = 5;  Duration = 65; ThinkConst = 1000; ThinkRand = 1000 },
  @{ Name = "moderate_r1";     Users = 20; Ramp = 10; Duration = 70; ThinkConst = 1000; ThinkRand = 1000 },
  @{ Name = "higher_r1";       Users = 50; Ramp = 20; Duration = 80; ThinkConst = 1000; ThinkRand = 1000 },
  @{ Name = "baseline_r2";     Users = 5;  Ramp = 5;  Duration = 65; ThinkConst = 1000; ThinkRand = 1000 },
  @{ Name = "moderate_r2";     Users = 20; Ramp = 10; Duration = 70; ThinkConst = 1000; ThinkRand = 1000 },
  @{ Name = "higher_r2";       Users = 50; Ramp = 20; Duration = 80; ThinkConst = 1000; ThinkRand = 1000 },
  # focused comparison: moderate load with think time removed
  @{ Name = "nothink_moderate_r1"; Users = 20; Ramp = 10; Duration = 70; ThinkConst = 0; ThinkRand = 0 },
  @{ Name = "nothink_moderate_r2"; Users = 20; Ramp = 10; Duration = 70; ThinkConst = 0; ThinkRand = 0 }
)
if ($Runs) { $AllRuns = $AllRuns | Where-Object { $Runs -contains $_.Name } }

if (-not $env:DATABASE_URL) { throw "Set `$env:DATABASE_URL first (see README.md)." }
try { Invoke-RestMethod http://localhost:4000/api/health | Out-Null }
catch { throw "API is not reachable on http://localhost:4000 - start it first (see README.md)." }
if (Get-Process java -ErrorAction SilentlyContinue) {
  Write-Warning "A java process is already running (JMeter GUI?). Close it so it does not skew resource figures."
}

$ServerPid = (Get-NetTCPConnection -LocalPort 4000 -State Listen).OwningProcess | Select-Object -First 1
New-Item -ItemType Directory -Force (Join-Path $LabDir "results"), (Join-Path $LabDir "reports") | Out-Null

$Monitor = {
  param($ServerPid, $OutFile, $StopFile)
  $cores = [Environment]::ProcessorCount
  # CPU % is relative to the whole machine (100 % = all logical cores busy)
  "time,total_cpu_pct,available_mb,api_cpu_pct,api_mem_mb,jmeter_cpu_pct,jmeter_mem_mb,postgres_cpu_pct,postgres_mem_mb" |
    Set-Content $OutFile
  # Performance counters are used because PostgreSQL runs as a service whose CPU time
  # Get-Process cannot read. Per-process "% Processor Time" is per core, so divide by $cores.
  $counters = '\Processor(_Total)\% Processor Time', '\Memory\Available MBytes',
              '\Process(*)\% Processor Time', '\Process(*)\Working Set', '\Process(*)\ID Process'
  while (-not (Test-Path $StopFile)) {
    $samples = (Get-Counter $counters -SampleInterval 1 -MaxSamples 1 -ErrorAction SilentlyContinue).CounterSamples
    $byInstance = @{}
    foreach ($s in $samples | Where-Object { $_.Path -like '*\process(*' }) {
      $key = $s.InstanceName + "|" + ($s.Path -replace '^.*\\process\(([^)]*)\)\\.*$', '$1')
      if (-not $byInstance[$key]) { $byInstance[$key] = @{ Name = $s.InstanceName } }
      $byInstance[$key][($s.Path -replace '^.*\\', '')] = $s.CookedValue
    }
    $procs = $byInstance.Values
    $fields = @((Get-Date).ToString("HH:mm:ss"),
                ("{0:F1}" -f ($samples | Where-Object { $_.Path -like '*\processor(_total)\*' }).CookedValue),
                ("{0:F0}" -f ($samples | Where-Object { $_.Path -like '*\available mbytes' }).CookedValue))
    foreach ($group in @(($procs | Where-Object { $_['id process'] -eq $ServerPid }),
                         ($procs | Where-Object { $_.Name -like 'java*' }),
                         ($procs | Where-Object { $_.Name -like 'postgres*' }))) {
      $cpu = ($group | ForEach-Object { $_['% processor time'] } | Measure-Object -Sum).Sum
      $mem = ($group | ForEach-Object { $_['working set'] } | Measure-Object -Sum).Sum
      $fields += ("{0:F1}" -f ($cpu / $cores)), ("{0:F0}" -f ($mem / 1MB))
    }
    $fields -join "," | Add-Content $OutFile
  }
}

foreach ($run in $AllRuns) {
  $name = $run.Name
  $jtl = Join-Path $LabDir "results\$name.jtl"
  $report = Join-Path $LabDir "reports\$name"
  $resources = Join-Path $LabDir "results\${name}_resources.csv"
  $stopFile = Join-Path $env:TEMP "jmeter-monitor-$name.stop"
  foreach ($old in @($jtl, $report, $resources, $stopFile)) {
    if (Test-Path $old) { Remove-Item -Recurse -Force $old }
  }

  Write-Host "`n=== $name : $($run.Users) users, ramp-up $($run.Ramp) s, duration $($run.Duration) s, think $($run.ThinkConst)+0..$($run.ThinkRand) ms ===" -ForegroundColor Cyan

  Push-Location $ServerDir
  node scripts/reset-jmeter-data.js
  Pop-Location

  $job = Start-Job -ScriptBlock $Monitor -ArgumentList $ServerPid, $resources, $stopFile

  $jmeterArgs = @(
    "-n", "-t", "`"$Plan`"", "-l", "`"$jtl`"", "-j", "`"$(Join-Path $LabDir "results\$name.log")`"",
    "-Jusers=$($run.Users)", "-Jrampup=$($run.Ramp)", "-Jloops=-1", "-Jduration=$($run.Duration)",
    "-JthinkConst=$($run.ThinkConst)", "-JthinkRand=$($run.ThinkRand)"
  )
  if ($name -ne "warmup") { $jmeterArgs += @("-e", "-o", "`"$report`"") }

  Write-Host "jmeter.bat $($jmeterArgs -join ' ')"
  & (Join-Path $JMeterBin "jmeter.bat") @jmeterArgs

  New-Item -ItemType File $stopFile | Out-Null
  Wait-Job $job -Timeout 10 | Out-Null
  Remove-Job $job -Force
  Remove-Item $stopFile -ErrorAction SilentlyContinue
}

Write-Host "`nAll runs finished. Results: $LabDir\results   Reports: $LabDir\reports" -ForegroundColor Green

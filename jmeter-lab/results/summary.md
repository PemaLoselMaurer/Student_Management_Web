# Lab 6 results (steady state, ramp-up excluded)

Throughput unit: completed samples per second over the steady window. Request rows and transaction (TX) rows are reported separately; the TX row is the sum of 02 Create + 04 View Created + 05 Update and excludes timer delay.

## 1. Overview per run (all individual requests, TX excluded)

| Run | Users | Ramp-up | Duration | Think time | Steady window | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput req/s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline_r1 | 5 | 5 s | 65 s | 1-2 s | 58.9 s | 197 | 2.2 | 2 | 5 | 8 | 10 | 0.00 | 3.3 |
| baseline_r2 | 5 | 5 s | 65 s | 1-2 s | 57.7 s | 193 | 2.3 | 2 | 5 | 7 | 8 | 0.00 | 3.3 |
| moderate_r1 | 20 | 10 s | 70 s | 1-2 s | 58.4 s | 774 | 2.1 | 1 | 5 | 8 | 44 | 0.00 | 13.3 |
| moderate_r2 | 20 | 10 s | 70 s | 1-2 s | 58.3 s | 775 | 2.9 | 1 | 5 | 36 | 145 | 0.00 | 13.3 |
| higher_r1 | 50 | 20 s | 80 s | 1-2 s | 58.5 s | 1943 | 1.6 | 1 | 4 | 7 | 138 | 0.00 | 33.2 |
| higher_r2 | 50 | 20 s | 80 s | 1-2 s | 58.4 s | 1948 | 1.6 | 1 | 4 | 6 | 71 | 0.00 | 33.3 |
| nothink_moderate_r1 | 20 | 10 s | 70 s | 0 | 59.9 s | 176075 | 6.8 | 7 | 11 | 14 | 29 | 0.00 | 2938.6 |
| nothink_moderate_r2 | 20 | 10 s | 70 s | 0 | 59.9 s | 176807 | 6.7 | 7 | 11 | 14 | 43 | 0.00 | 2951.1 |

## 2. Transaction: TX Create and Verify Student

| Run | Users | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput tx/s |
|---|---|---|---|---|---|---|---|---|---|
| baseline_r1 | 5 | 28 | 7.9 | 8 | 14 | 14 | 14 | 0.00 | 0.48 |
| baseline_r2 | 5 | 27 | 8.7 | 8 | 13 | 13 | 13 | 0.00 | 0.47 |
| moderate_r1 | 20 | 105 | 7.9 | 7 | 12 | 15 | 49 | 0.00 | 1.80 |
| moderate_r2 | 20 | 107 | 10.6 | 7 | 30 | 89 | 130 | 0.00 | 1.83 |
| higher_r1 | 50 | 260 | 5.9 | 5 | 9 | 18 | 140 | 0.00 | 4.44 |
| higher_r2 | 50 | 265 | 5.6 | 5 | 9 | 21 | 66 | 0.00 | 4.54 |
| nothink_moderate_r1 | 20 | 25148 | 23.2 | 23 | 29 | 38 | 52 | 0.00 | 419.71 |
| nothink_moderate_r2 | 20 | 25250 | 22.9 | 23 | 29 | 38 | 58 | 0.00 | 421.45 |

## 3. Per operation, per run

### baseline_r1 (5 users, ramp-up 5 s, 65 s, think 1-2 s; 12 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 27 | 1.7 | 2 | 3 | 4 | 4 | 0.00 | 0.46 |
| 02 Create Student | 30 | 3.1 | 3 | 5 | 8 | 8 | 0.00 | 0.51 |
| 03 View Student by ID | 28 | 1.4 | 1 | 2 | 2 | 2 | 0.00 | 0.48 |
| 04 View Created Student | 29 | 1.4 | 1 | 3 | 6 | 6 | 0.00 | 0.49 |
| 05 Update Student | 28 | 3.5 | 3 | 5 | 10 | 10 | 0.00 | 0.48 |
| 06 Payment Status (auth) | 29 | 1.2 | 1 | 3 | 5 | 5 | 0.00 | 0.49 |
| 07 Delete Student | 26 | 2.9 | 3 | 4 | 5 | 5 | 0.00 | 0.44 |
| TX Create and Verify Student | 28 | 7.9 | 8 | 14 | 14 | 14 | 0.00 | 0.48 |
| ALL requests (excl. TX) | 197 | 2.2 | 2 | 5 | 8 | 10 | 0.00 | 3.35 |

### baseline_r2 (5 users, ramp-up 5 s, 65 s, think 1-2 s; 16 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 26 | 1.5 | 1 | 2 | 5 | 5 | 0.00 | 0.45 |
| 02 Create Student | 30 | 3.7 | 3 | 7 | 8 | 8 | 0.00 | 0.52 |
| 03 View Student by ID | 27 | 1.7 | 2 | 4 | 4 | 4 | 0.00 | 0.47 |
| 04 View Created Student | 29 | 1.7 | 2 | 3 | 4 | 4 | 0.00 | 0.50 |
| 05 Update Student | 28 | 3.4 | 3 | 5 | 5 | 5 | 0.00 | 0.49 |
| 06 Payment Status (auth) | 28 | 1.0 | 1 | 2 | 3 | 3 | 0.00 | 0.49 |
| 07 Delete Student | 25 | 3.0 | 3 | 5 | 5 | 5 | 0.00 | 0.43 |
| TX Create and Verify Student | 27 | 8.7 | 8 | 13 | 13 | 13 | 0.00 | 0.47 |
| ALL requests (excl. TX) | 193 | 2.3 | 2 | 5 | 7 | 8 | 0.00 | 3.35 |

### moderate_r1 (20 users, ramp-up 10 s, 70 s, think 1-2 s; 94 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 110 | 1.6 | 1 | 3 | 8 | 11 | 0.00 | 1.88 |
| 02 Create Student | 111 | 3.0 | 3 | 7 | 8 | 9 | 0.00 | 1.90 |
| 03 View Student by ID | 112 | 1.4 | 1 | 3 | 7 | 8 | 0.00 | 1.92 |
| 04 View Created Student | 111 | 1.7 | 1 | 3 | 3 | 44 | 0.00 | 1.90 |
| 05 Update Student | 112 | 3.3 | 3 | 6 | 7 | 8 | 0.00 | 1.92 |
| 06 Payment Status (auth) | 108 | 0.9 | 1 | 2 | 7 | 8 | 0.00 | 1.85 |
| 07 Delete Student | 110 | 2.7 | 3 | 5 | 6 | 7 | 0.00 | 1.88 |
| TX Create and Verify Student | 105 | 7.9 | 7 | 12 | 15 | 49 | 0.00 | 1.80 |
| ALL requests (excl. TX) | 774 | 2.1 | 1 | 5 | 8 | 44 | 0.00 | 13.25 |

### moderate_r2 (20 users, ramp-up 10 s, 70 s, think 1-2 s; 91 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 108 | 2.8 | 1 | 2 | 17 | 145 | 0.00 | 1.85 |
| 02 Create Student | 110 | 3.1 | 3 | 5 | 9 | 60 | 0.00 | 1.89 |
| 03 View Student by ID | 107 | 1.6 | 1 | 3 | 10 | 36 | 0.00 | 1.83 |
| 04 View Created Student | 114 | 3.3 | 1 | 7 | 44 | 124 | 0.00 | 1.95 |
| 05 Update Student | 113 | 4.2 | 3 | 8 | 26 | 87 | 0.00 | 1.94 |
| 06 Payment Status (auth) | 111 | 1.0 | 1 | 2 | 6 | 7 | 0.00 | 1.90 |
| 07 Delete Student | 112 | 4.4 | 3 | 7 | 81 | 91 | 0.00 | 1.92 |
| TX Create and Verify Student | 107 | 10.6 | 7 | 30 | 89 | 130 | 0.00 | 1.83 |
| ALL requests (excl. TX) | 775 | 2.9 | 1 | 5 | 36 | 145 | 0.00 | 13.29 |

### higher_r1 (50 users, ramp-up 20 s, 80 s, think 1-2 s; 415 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 277 | 1.3 | 1 | 2 | 5 | 12 | 0.00 | 4.73 |
| 02 Create Student | 278 | 2.5 | 2 | 4 | 9 | 138 | 0.00 | 4.75 |
| 03 View Student by ID | 280 | 1.0 | 1 | 2 | 6 | 9 | 0.00 | 4.79 |
| 04 View Created Student | 276 | 1.1 | 1 | 2 | 6 | 7 | 0.00 | 4.72 |
| 05 Update Student | 280 | 2.2 | 2 | 4 | 9 | 15 | 0.00 | 4.79 |
| 06 Payment Status (auth) | 277 | 0.7 | 1 | 1 | 7 | 16 | 0.00 | 4.73 |
| 07 Delete Student | 275 | 2.1 | 2 | 4 | 9 | 27 | 0.00 | 4.70 |
| TX Create and Verify Student | 260 | 5.9 | 5 | 9 | 18 | 140 | 0.00 | 4.44 |
| ALL requests (excl. TX) | 1943 | 1.6 | 1 | 4 | 7 | 138 | 0.00 | 33.21 |

### higher_r2 (50 users, ramp-up 20 s, 80 s, think 1-2 s; 419 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 00 Login | 1 | 56.0 | 56 | 56 | 56 | 56 | 0.00 | 0.02 |
| 01 List Students | 279 | 1.5 | 1 | 2 | 5 | 35 | 0.00 | 4.78 |
| 02 Create Student | 276 | 1.9 | 1 | 4 | 5 | 15 | 0.00 | 4.72 |
| 03 View Student by ID | 277 | 1.0 | 1 | 2 | 5 | 8 | 0.00 | 4.74 |
| 04 View Created Student | 278 | 1.5 | 1 | 2 | 8 | 59 | 0.00 | 4.76 |
| 05 Update Student | 278 | 2.4 | 2 | 4 | 17 | 23 | 0.00 | 4.76 |
| 06 Payment Status (auth) | 280 | 0.7 | 1 | 1 | 2 | 26 | 0.00 | 4.79 |
| 07 Delete Student | 279 | 2.1 | 1 | 4 | 5 | 71 | 0.00 | 4.78 |
| TX Create and Verify Student | 265 | 5.6 | 5 | 9 | 21 | 66 | 0.00 | 4.54 |
| ALL requests (excl. TX) | 1948 | 1.6 | 1 | 4 | 6 | 71 | 0.00 | 33.34 |

### nothink_moderate_r1 (20 users, ramp-up 10 s, 70 s, think 0; 27302 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 25154 | 7.0 | 7 | 9 | 13 | 23 | 0.00 | 419.81 |
| 02 Create Student | 25152 | 6.7 | 7 | 9 | 13 | 21 | 0.00 | 419.78 |
| 03 View Student by ID | 25153 | 6.7 | 7 | 9 | 13 | 22 | 0.00 | 419.80 |
| 04 View Created Student | 25153 | 6.4 | 6 | 9 | 13 | 22 | 0.00 | 419.80 |
| 05 Update Student | 25154 | 10.1 | 10 | 13 | 18 | 29 | 0.00 | 419.81 |
| 06 Payment Status (auth) | 25152 | 3.5 | 3 | 5 | 7 | 14 | 0.00 | 419.78 |
| 07 Delete Student | 25157 | 7.0 | 7 | 9 | 13 | 22 | 0.00 | 419.86 |
| TX Create and Verify Student | 25148 | 23.2 | 23 | 29 | 38 | 52 | 0.00 | 419.71 |
| ALL requests (excl. TX) | 176075 | 6.8 | 7 | 11 | 14 | 29 | 0.00 | 2938.65 |

### nothink_moderate_r2 (20 users, ramp-up 10 s, 70 s, think 0; 28124 ramp-up samples excluded)

| Operation | Samples | Avg ms | Median ms | p95 ms | p99 ms | Max ms | Error % | Throughput /s |
|---|---|---|---|---|---|---|---|---|
| 01 List Students | 25262 | 7.0 | 7 | 9 | 13 | 29 | 0.00 | 421.65 |
| 02 Create Student | 25255 | 6.7 | 7 | 9 | 12 | 37 | 0.00 | 421.53 |
| 03 View Student by ID | 25260 | 6.7 | 7 | 9 | 13 | 36 | 0.00 | 421.62 |
| 04 View Created Student | 25255 | 6.3 | 6 | 9 | 13 | 35 | 0.00 | 421.53 |
| 05 Update Student | 25258 | 9.9 | 10 | 13 | 18 | 43 | 0.00 | 421.58 |
| 06 Payment Status (auth) | 25257 | 3.5 | 3 | 5 | 7 | 22 | 0.00 | 421.57 |
| 07 Delete Student | 25260 | 7.0 | 7 | 9 | 13 | 34 | 0.00 | 421.62 |
| TX Create and Verify Student | 25250 | 22.9 | 23 | 29 | 38 | 58 | 0.00 | 421.45 |
| ALL requests (excl. TX) | 176807 | 6.7 | 7 | 11 | 14 | 43 | 0.00 | 2951.11 |

## 4. Resource usage (sampled every second for the whole run; % of all 20 logical CPUs)

| Run | Total CPU avg / max % | API (node) CPU avg / max % | API mem max MB | JMeter CPU avg % | JMeter mem max MB | PostgreSQL CPU avg / max % | Min free RAM MB |
|---|---|---|---|---|---|---|---|
| baseline_r1 | 6.7 / 31.7 | 0.0 / 0.5 | 173 | 0.3 | 241 | 0.0 / 0.1 | 4421 |
| baseline_r2 | 5.8 / 19.7 | 0.0 / 0.7 | 173 | 0.3 | 237 | 0.0 / 0.1 | 4821 |
| moderate_r1 | 6.5 / 17.4 | 0.1 / 1.2 | 173 | 0.4 | 294 | 0.0 / 0.2 | 4611 |
| moderate_r2 | 6.4 / 16.5 | 0.1 / 0.9 | 173 | 0.4 | 277 | 0.0 / 0.2 | 4757 |
| higher_r1 | 6.3 / 18.1 | 0.2 / 1.4 | 173 | 0.4 | 372 | 0.1 / 0.3 | 4686 |
| higher_r2 | 6.3 / 19.7 | 0.2 / 1.3 | 173 | 0.4 | 360 | 0.0 / 0.6 | 4501 |
| nothink_moderate_r1 | 13.2 / 27.0 | 4.0 / 5.1 | 174 | 2.0 | 841 | 1.7 / 2.6 | 4269 |
| nothink_moderate_r2 | 13.5 / 25.2 | 3.9 / 5.0 | 176 | 2.0 | 841 | 1.6 / 2.8 | 4276 |

One logical CPU = 5 % of the machine, so a single-threaded process that is fully busy shows about 5 %.

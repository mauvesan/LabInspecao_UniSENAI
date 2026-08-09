# D4.5.6F.3.2.3 — Transactional UTF-8 Safe Drill-down UI

Frontend-only patch over the validated F.2/F.3.1 state. Uses Node fileURLToPath() for correct Windows path resolution, validates all payloads before writes, backs up every existing target, and rolls back on failure. No SQL required.

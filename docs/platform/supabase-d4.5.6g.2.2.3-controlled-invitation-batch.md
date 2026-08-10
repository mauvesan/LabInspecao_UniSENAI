# D4.5.6G.2.2.3 — Controlled Invitation Batch

Administrative Node executor for CSTSAM124N6.

## Security

Uses `SUPABASE_URL` and `SUPABASE_SECRET_KEY` from the local process environment.
Never use a `VITE_*` variable for the secret key. Never place the secret key under `src/`.

## Modes

Dry run:
`node scripts/admin/d456g223-controlled-invitation-batch.mjs --dry-run`

Execute:
`node scripts/admin/d456g223-controlled-invitation-batch.mjs --execute`

The dry run is the default if `--execute` is absent.

## Idempotency

Before every invitation, the executor reloads Auth users and reclassifies the student.
If a user appeared since planning, it does not send a duplicate invitation and reports
`AUTH_USER_APPEARED_READY_TO_LINK`.

The executor does not update `students.auth_user_id`; linking belongs to G.2.2.4.

## Failure behavior

Stops after the first invite failure. Re-run safely after resolving the cause; already
created Auth users will be discovered on re-execution instead of being invited again.

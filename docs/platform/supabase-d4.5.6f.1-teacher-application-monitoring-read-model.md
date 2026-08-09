# D4.5.6F.1 — Teacher Application Monitoring Read Model

## RPC

`public.teacher_get_assessment_application_monitoring(p_application_id uuid)`

## Authorization

Preserves the already validated teacher-side contract:

`private.require_teacher()`

No new teacher-to-class authorization model is invented in this increment.

## Population

The operational population is the union of:

- active class memberships for the application class;
- students with an individual application rule.

Effective eligibility follows the existing enforcement semantics:

- `deny` => blocked;
- `allow` => eligible;
- `inherit` => eligible only with active class membership.

## Student metrics

The read model derives:

- effective attempts and schedule;
- attempts used / remaining;
- best and latest percentage;
- ever passed / latest passed;
- late submission flags;
- first / last attempt;
- attempt limit reached;
- primary operational state.

No state is persisted.

## Summary

Returns counts for:

- eligible;
- blocked;
- with attempt;
- without attempt;
- passed;
- not passed;
- attempt limit reached;
- late submission;
- total attempts;
- average attempt percentage;
- average best percentage by student.

## Security

The RPC does not return:

- answers_json;
- questions_json;
- answer keys.

It performs no write operation and does not modify scorer, enforcement or application management.

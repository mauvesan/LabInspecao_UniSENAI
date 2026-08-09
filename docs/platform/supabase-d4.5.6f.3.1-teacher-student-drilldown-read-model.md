# D4.5.6F.3.1 — Teacher Student Drill-down Read Model

## RPC

`teacher_get_assessment_application_student_history(p_application_id uuid, p_student_id uuid)`

## Purpose

Provides a read-only drill-down for one student inside one assessment
application.

Returns:

- application identity and schedule;
- student identity and eligibility;
- effective individual schedule/attempt limit;
- attempts used/remaining;
- best/latest percentage;
- approval and late-submission flags;
- formal attempts in reverse chronological order.

Does not return:

- answers_json;
- questions_json;
- answer keys;
- feedback keys.

No score or grade mutation is possible.

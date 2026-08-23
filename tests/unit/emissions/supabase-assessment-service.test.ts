import { describe, expect, it, vi } from 'vitest';
import {
  EmissionsAssessmentService,
  createEmissionsActivityPayload,
} from '../../../src/platform/emissions/emissions-assessment-service.js';
import { generateRandomDiagnosticCase } from '../../../src/modules/gases/diagnostics-model.js';

describe('emissions assessment Supabase integration', () => {
  it('separates the public case snapshot from the private answer key', () => {
    const diagnosticCase = generateRandomDiagnosticCase({ seed: 42, level: 'advanced' });
    const payload = createEmissionsActivityPayload(diagnosticCase, {
      modelVersion: 'emissions-model-1.0.0',
      regulationVersion: 'conama-418-2009-r1',
    });
    expect(payload.caseSnapshotPublic).not.toHaveProperty('answerKey');
    expect(payload.caseSnapshotPublic).not.toHaveProperty('faults');
    expect(payload.caseSnapshotPublic).not.toHaveProperty('remap');
    expect(payload.answerKey.primaryFaultId).toBeTruthy();
    expect(payload.expectedEvidence).toEqual(expect.any(Array));
  });

  it('uses teacher RPC to create an activity without exposing direct table writes', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 'activity-1', error: null });
    const service = new EmissionsAssessmentService({ client: { rpc } as never });
    const diagnosticCase = generateRandomDiagnosticCase({ seed: 7, level: 'basic' });
    const payload = createEmissionsActivityPayload(diagnosticCase, {
      modelVersion: 'model-v1',
      regulationVersion: 'reg-v1',
    });
    await expect(
      service.createActivity({ classId: 'class-1', publish: true, ...payload }),
    ).resolves.toBe('activity-1');
    expect(rpc).toHaveBeenCalledWith(
      'teacher_create_emissions_activity',
      expect.objectContaining({
        p_class_id: 'class-1',
        p_publish: true,
      }),
    );
  });

  it('submits seed and structured answer through secure server-side scorer RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { score: 85 }, error: null });
    const service = new EmissionsAssessmentService({ client: { rpc } as never });
    const submission = {
      primaryFaultId: 'rich-mixture',
      additionalFaultIds: [],
      primarySeverity: 'moderate',
      evidenceIds: ['co-high'],
      reasoning: 'CO elevado e lambda indicam mistura rica.',
    };
    await service.submitAttempt({ activityId: 'activity-1', submission, seed: 12345 });
    expect(rpc).toHaveBeenCalledWith(
      'submit_emissions_attempt',
      expect.objectContaining({
        p_activity_id: 'activity-1',
        p_submission: submission,
        p_seed: 12345,
        p_valid: true,
      }),
    );
  });

  it('loads only the student-facing activity and own history through RPCs', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: { activity_id: 'a1', case_snapshot: {} }, error: null })
      .mockResolvedValueOnce({ data: { activity_id: 'a1', attempts: [] }, error: null });
    const service = new EmissionsAssessmentService({ client: { rpc } as never });
    await service.getActivity('a1');
    await service.getHistory('a1');
    expect(rpc).toHaveBeenNthCalledWith(1, 'student_get_emissions_activity', {
      p_activity_id: 'a1',
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'student_get_emissions_history', {
      p_activity_id: 'a1',
    });
  });
});

import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export class StudentAccessStatusService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async readAll() {
    const { data, error } = await this.client.rpc('teacher_get_student_access_status');

    if (error) {
      const wrappedError = new Error('Não foi possível carregar o estado de acesso dos alunos.');

      wrappedError.cause = error;
      throw wrappedError;
    }

    return (data || []).map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name || '',
      enrollment: row.enrollment || '',
      studentEmail: row.student_email || '',
      studentStatus: row.student_status || '',

      authUserId: row.auth_user_id || null,
      authEmail: row.auth_email || '',

      accessStatus: row.access_status || 'not_provisioned',

      invitedAt: row.invited_at || null,
      confirmationSentAt: row.confirmation_sent_at || null,
      emailConfirmedAt: row.email_confirmed_at || null,
      lastSignInAt: row.last_sign_in_at || null,

      onboardingRequired: row.onboarding_required === true,

      onboardingCompletedAt: row.onboarding_completed_at || null,
    }));
  }
}

let studentAccessStatusService = null;

export function getStudentAccessStatusService() {
  if (!studentAccessStatusService) {
    studentAccessStatusService = new StudentAccessStatusService();
  }

  return studentAccessStatusService;
}

import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export class StudentInvitationService {
  constructor({ client } = {}) {
    this.client = client || getSupabaseAuthClient();
  }

  /**
   * Envia ou provisiona o acesso de um aluno.
   *
   * @param {string} studentId
   * @returns {Promise<{
   *   student_id: string,
   *   student_name: string,
   *   enrollment: string,
   *   email: string,
   *   auth_user_id: string,
   *   status: 'invite_sent' | 'existing_auth_linked'
   * }>}
   */
  async inviteStudent(studentId) {
    const normalizedStudentId = String(studentId || '').trim();

    if (!normalizedStudentId) {
      throw new Error('Não foi possível identificar o aluno para envio do convite.');
    }

    const { data, error } = await this.client.functions.invoke('invite-student', {
      body: {
        student_id: normalizedStudentId,
      },
    });

    if (error) {
      let remoteMessage = '';

      const context = error?.context;

      if (context) {
        try {
          /*
           * Em algumas versões do supabase-js,
           * context pode ser uma Response.
           */
          if (typeof context.clone === 'function' && typeof context.json === 'function') {
            const payload = await context.clone().json();

            remoteMessage = payload?.error?.message || payload?.message || '';
          } else if (typeof context === 'object') {
            remoteMessage = context?.error?.message || context?.message || '';
          }
        } catch {
          // Mantém fallback para error.message.
        }
      }

      throw new Error(
        remoteMessage || error.message || 'Não foi possível enviar o convite ao aluno.',
      );
    }

    if (!data?.ok) {
      throw new Error(data?.error?.message || 'Não foi possível enviar o convite ao aluno.');
    }

    return data.data;
  }
}

let studentInvitationService = null;

export function getStudentInvitationService() {
  if (!studentInvitationService) {
    studentInvitationService = new StudentInvitationService();
  }

  return studentInvitationService;
}

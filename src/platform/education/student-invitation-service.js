import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export class StudentInvitationService {
  /**
   * @param {{ client?: import('@supabase/supabase-js').SupabaseClient }} [options]
   */
  constructor({ client } = {}) {
    this.client = client || getSupabaseAuthClient();
  }

  /**
   * Envia o primeiro convite de acesso do aluno.
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
    return this.execute(studentId, 'invite');
  }

  /**
   * Reenvia o acesso para um aluno já provisionado,
   * sem recriar profile, auth_user_id ou vínculo acadêmico.
   *
   * A Edge Function valida se o aluno continua elegível
   * para reenvio antes de disparar um novo link.
   *
   * @param {string} studentId
   * @returns {Promise<{
   *   student_id: string,
   *   student_name: string,
   *   enrollment: string,
   *   email: string,
   *   auth_user_id: string,
   *   status: 'invite_resent'
   * }>}
   */
  async resendStudentInvitation(studentId) {
    return this.execute(studentId, 'resend');
  }

  /**
   * Executa uma operação de convite na Edge Function.
   *
   * @param {string} studentId
   * @param {'invite' | 'resend'} operation
   */
  async execute(studentId, operation) {
    const normalizedStudentId = String(studentId || '').trim();

    if (!normalizedStudentId) {
      throw new Error(
        operation === 'resend'
          ? 'Não foi possível identificar o aluno para reenvio do convite.'
          : 'Não foi possível identificar o aluno para envio do convite.',
      );
    }

    if (operation !== 'invite' && operation !== 'resend') {
      throw new Error('A operação de convite solicitada é inválida.');
    }

    const { data, error } = await this.client.functions.invoke('invite-student', {
      body: {
        student_id: normalizedStudentId,
        operation,
      },
    });

    if (error) {
      const remoteError = await this.readRemoteError(error);

      throw new Error(
        remoteError?.message ||
          error.message ||
          (operation === 'resend'
            ? 'Não foi possível reenviar o convite ao aluno.'
            : 'Não foi possível enviar o convite ao aluno.'),
      );
    }

    if (!data?.ok) {
      throw new Error(
        data?.error?.message ||
          (operation === 'resend'
            ? 'Não foi possível reenviar o convite ao aluno.'
            : 'Não foi possível enviar o convite ao aluno.'),
      );
    }

    return data.data;
  }

  /**
   * Extrai, quando possível, a resposta JSON devolvida pela
   * Edge Function em erros HTTP.
   *
   * @param {unknown} error
   * @returns {Promise<{ code?: string, message?: string } | null>}
   */
  async readRemoteError(error) {
    const context = error?.context;

    if (!context) {
      return null;
    }

    try {
      if (typeof context.clone === 'function' && typeof context.json === 'function') {
        const payload = await context.clone().json();

        return {
          code: payload?.error?.code || payload?.code || '',
          message: payload?.error?.message || payload?.message || '',
        };
      }

      if (typeof context === 'object') {
        return {
          code: context?.error?.code || context?.code || '',
          message: context?.error?.message || context?.message || '',
        };
      }
    } catch {
      // O fallback de execute() usa error.message.
    }

    return null;
  }
}

let studentInvitationService = null;

export function getStudentInvitationService() {
  if (!studentInvitationService) {
    studentInvitationService = new StudentInvitationService();
  }

  return studentInvitationService;
}

import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export function mapStudentProgressRows(rows = []) {
  return Object.fromEntries(
    rows.map((row) => [
      row.module_code,
      {
        moduleCode: row.module_code,
        bestPercentage: Number(row.best_percentage ?? 0),
        completed: Boolean(row.completed),
        firstPassedAt: row.first_passed_at || null,
        lastAttemptAt: row.last_attempt_at || null,
        attemptCount: Number(row.attempt_count ?? 0),
      },
    ]),
  );
}

export class StudentProgressService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async readOwnProgress() {
    const result = await this.client
      .from('student_progress')
      .select('module_code,best_percentage,completed,first_passed_at,last_attempt_at,attempt_count')
      .order('module_code');

    if (result.error) {
      const error = new Error(
        result.error.message || 'Não foi possível carregar o progresso remoto.',
      );
      error.cause = result.error;
      throw error;
    }

    return mapStudentProgressRows(result.data || []);
  }
}

let service = null;

export function getStudentProgressService() {
  if (!service) {
    service = new StudentProgressService();
  }

  return service;
}

export function resetStudentProgressServiceForTests() {
  service = null;
}

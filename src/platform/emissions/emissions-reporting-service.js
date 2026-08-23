import { getSupabaseAuthClient } from '../supabase/supabase-client.js';
export class EmissionsReportingService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }
  async readActivityAnalytics(activityId) {
    const [activity, results, attempts, students, diagnostics, audit] = await Promise.all([
      this.client.from('emissions_activities').select('*').eq('id', activityId).single(),
      this.client.from('emissions_results').select('*').eq('activity_id', activityId),
      this.client
        .from('emissions_attempts')
        .select('*')
        .eq('activity_id', activityId)
        .order('attempted_at'),
      this.client.from('students').select('id,name,enrollment,status'),
      this.client.rpc('teacher_get_emissions_diagnostic_analytics', { p_activity_id: activityId }),
      this.client
        .from('emissions_teacher_audit')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(50),
    ]);
    for (const r of [activity, results, attempts, students, diagnostics, audit])
      if (r.error) throw r.error;
    return {
      activity: activity.data,
      results: results.data || [],
      attempts: attempts.data || [],
      students: students.data || [],
      diagnostics: diagnostics.data || {},
      audit: audit.data || [],
    };
  }
  async listActivities() {
    const { data, error } = await this.client
      .from('emissions_activities')
      .select('id,title,class_id,status,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

import { getSupabaseAuthClient } from '../../platform/supabase/supabase-client.js';
import { MODEL_VERSION, REGULATION_VERSION } from './model/constants.js';
import { FAULT_CATALOG_VERSION } from './diagnostics-model.js';
import { createPublicActivitySnapshot, DEFAULT_SCORING_WEIGHTS } from './teacher-library-model.js';

function clientOrThrow(client) {
  const resolved = client || getSupabaseAuthClient();
  if (!resolved) throw new Error('Supabase não configurado.');
  return resolved;
}

export function createEmissionsTeacherLibraryService(client) {
  const supabase = clientOrThrow(client);
  return {
    async listVehicles() {
      const { data, error } = await supabase
        .from('emissions_vehicle_library')
        .select('*')
        .order('vehicle_id');
      if (error) throw error;
      return data || [];
    },

    async saveVehicle(vehicle) {
      const payload = { ...vehicle };
      const existing = await this.listVehicles();
      const row = existing.find((item) => item.vehicle_id === vehicle.vehicleId);
      if (row) {
        const { error } = await supabase
          .from('emissions_vehicle_library')
          .update({ payload, archived: Boolean(vehicle.archived) })
          .eq('id', row.id);
        if (error) throw error;
        await this.audit('VEHICLE_EDITED', 'vehicle', vehicle.vehicleId, 1, 'Veículo editado');
        return row.id;
      }
      return this.importVehicle(vehicle);
    },
    async archiveVehicle(vehicleId, archived = true) {
      const { error } = await supabase
        .from('emissions_vehicle_library')
        .update({ archived })
        .eq('vehicle_id', vehicleId);
      if (error) throw error;
      await this.audit(
        'VEHICLE_EDITED',
        'vehicle',
        vehicleId,
        1,
        archived ? 'Veículo arquivado' : 'Veículo restaurado',
      );
    },
    async importVehicle(vehicle) {
      const { data, error } = await supabase.rpc('teacher_import_emissions_vehicle', {
        p_vehicle_id: vehicle.vehicleId,
        p_payload: vehicle,
      });
      if (error) throw error;
      return data;
    },
    async listClasses() {
      const { data, error } = await supabase
        .from('classes')
        .select('id,name,term,status')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    async listCases() {
      const { data, error } = await supabase
        .from('emissions_case_masters')
        .select('*, emissions_case_versions(*)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async assignCaseToClass(
      caseRecord,
      classId,
      { publish = true, calibrationProfileId = null, calibrationVersion = 1 } = {},
    ) {
      const publicSnapshot = createPublicActivitySnapshot(caseRecord, {
        calibrationProfileId,
        calibrationVersion,
      });
      const { data, error } = await supabase.rpc('teacher_create_emissions_activity', {
        p_class_id: classId,
        p_title: caseRecord.title,
        p_case_snapshot_public: publicSnapshot,
        p_answer_key: caseRecord.answerKey || {},
        p_expected_evidence: caseRecord.expectedEvidence || [],
        p_scoring_weights: caseRecord.scoringWeights || DEFAULT_SCORING_WEIGHTS,
        p_model_version: MODEL_VERSION,
        p_regulation_version: REGULATION_VERSION,
        p_fault_catalog_version: FAULT_CATALOG_VERSION,
        p_case_version: caseRecord.version || 1,
        p_calibration_profile_id: calibrationProfileId,
        p_calibration_version: calibrationVersion,
        p_publish: publish,
      });
      if (error) throw error;
      await this.audit(
        'CASE_ASSIGNED',
        'case',
        caseRecord.caseId,
        caseRecord.version || 1,
        'Caso atribuído a turma',
        { classId, activityId: data },
      );
      return data;
    },
    async createCaseVersion(masterId, caseId, version, payload) {
      const { error } = await supabase
        .from('emissions_case_versions')
        .insert({ case_master_id: masterId, version, payload });
      if (error) throw error;
      const { error: masterError } = await supabase
        .from('emissions_case_masters')
        .update({ current_version: version, title: payload.title || caseId })
        .eq('id', masterId);
      if (masterError) throw masterError;
      await this.audit(
        'CASE_VERSION_CREATED',
        'case',
        caseId,
        version,
        'Nova versão do caso criada',
      );
    },
    async archiveCase(caseId, archived = true) {
      const { error } = await supabase
        .from('emissions_case_masters')
        .update({ status: archived ? 'archived' : 'draft' })
        .eq('case_id', caseId);
      if (error) throw error;
      await this.audit(
        'CASE_ARCHIVED',
        'case',
        caseId,
        null,
        archived ? 'Caso arquivado' : 'Caso restaurado',
      );
    },
    async importCase(caseRecord) {
      const { data, error } = await supabase.rpc('teacher_import_emissions_case', {
        p_case_id: caseRecord.caseId,
        p_title: caseRecord.title,
        p_payload: caseRecord,
      });
      if (error) throw error;
      return data;
    },
    async listCalibrationProfiles() {
      const { data, error } = await supabase
        .from('emissions_calibration_profiles')
        .select('*')
        .order('calibration_profile_id')
        .order('version', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async saveCalibrationProfile(profile, changes = []) {
      const profileId = profile.id || crypto.randomUUID();
      const { error } = await supabase.from('emissions_calibration_profiles').insert({
        id: profileId,
        calibration_profile_id: profile.calibrationProfileId,
        name: profile.name,
        description: profile.description || '',
        version: profile.version,
        parameters: profile.parameters,
        protected_default: Boolean(profile.protectedDefault),
      });
      if (error) throw error;
      await this.audit(
        'CALIBRATION_CHANGED',
        'calibration',
        profile.calibrationProfileId,
        profile.version,
        'Perfil de calibração salvo',
        { changes },
      );
      return profileId;
    },
    async audit(action, entityType, entityId, entityVersion = null, summary = '', metadata = {}) {
      const { data, error } = await supabase.rpc('teacher_log_emissions_audit', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_entity_version: entityVersion,
        p_summary: summary,
        p_metadata: metadata,
      });
      if (error) throw error;
      return data;
    },
    async listAudit(limit = 100) {
      const { data, error } = await supabase
        .from('emissions_teacher_audit')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  };
}

import { LocalEducationRepository } from './local-education-repository.js';
import { SupabaseEducationRepository } from './supabase-education-repository.js';
export function summarizeEducationState(s) {
  return {
    classes: s.classes.length,
    students: s.students.length,
    assessments: s.assessments.length,
  };
}
export function compareEducationStates(a, b) {
  const local = summarizeEducationState(a),
    remote = summarizeEducationState(b);
  return {
    local,
    remote,
    matches:
      local.classes === remote.classes &&
      local.students === remote.students &&
      local.assessments === remote.assessments,
  };
}
export async function runEducationRepositoryDiagnostic({
  localRepository = new LocalEducationRepository(),
  remoteRepository = new SupabaseEducationRepository(),
} = {}) {
  return compareEducationStates(localRepository.read(), await remoteRepository.read());
}

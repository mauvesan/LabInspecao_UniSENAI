/**
 * Contrato estável da persistência educacional.
 *
 * A interface é documentada em JavaScript para manter compatibilidade com a
 * base atual. Implementações locais ou remotas devem oferecer estes métodos.
 */
export const EDUCATION_REPOSITORY_METHODS = Object.freeze([
  'read',
  'write',
  'addClass',
  'updateClass',
  'setClassStatus',
  'addStudent',
  'updateStudent',
  'setStudentStatus',
  'addAssessment',
  'updateAssessment',
  'setAssessmentStatus',
  'duplicateAssessment',
  'exportData',
  'importData',
]);

export function assertEducationRepository(repository) {
  for (const method of EDUCATION_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') {
      throw new TypeError(`Repositório educacional inválido: método ${method} ausente.`);
    }
  }
  return repository;
}

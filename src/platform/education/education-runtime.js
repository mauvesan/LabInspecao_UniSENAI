import { config } from '../../config.js';
import { educationRepository } from './education-repository.js';

const EMPTY_STATE = Object.freeze({
  classes: [],
  students: [],
  assessments: [],
});

let cachedState = null;
let loadingPromise = null;
let lastError = null;

function normalizeState(state) {
  return {
    classes: Array.isArray(state?.classes) ? state.classes : [],
    students: Array.isArray(state?.students) ? state.students : [],
    assessments: Array.isArray(state?.assessments) ? state.assessments : [],
  };
}

export function educationProvider() {
  return config.education.persistenceProvider;
}

export function educationProviderLabel() {
  return educationProvider() === 'supabase' ? 'Supabase · remoto' : 'Local · portátil';
}

export function isRemoteEducationProvider() {
  return educationProvider() === 'supabase';
}

export function getCachedEducationState() {
  return cachedState ? normalizeState(cachedState) : null;
}

export function getEducationRuntimeStatus() {
  return {
    provider: educationProvider(),
    loading: Boolean(loadingPromise),
    ready: Boolean(cachedState),
    error: lastError,
  };
}

export async function loadEducationState({ force = false } = {}) {
  if (cachedState && !force) return normalizeState(cachedState);
  if (loadingPromise && !force) return loadingPromise;

  lastError = null;

  loadingPromise = Promise.resolve(educationRepository.read())
    .then((state) => {
      cachedState = normalizeState(state);
      return normalizeState(cachedState);
    })
    .catch((error) => {
      lastError = error instanceof Error ? error : new Error(String(error));
      throw lastError;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

export function primeLocalEducationState() {
  if (isRemoteEducationProvider()) return null;

  try {
    cachedState = normalizeState(educationRepository.read());
    lastError = null;
    return normalizeState(cachedState);
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    cachedState = normalizeState(EMPTY_STATE);
    return normalizeState(cachedState);
  }
}

export async function runEducationMutation(operation) {
  const result = await Promise.resolve(operation(educationRepository));
  await loadEducationState({ force: true });
  return result;
}

export async function exportEducationData() {
  return Promise.resolve(educationRepository.exportData());
}

export async function importEducationData(payload) {
  const result = await Promise.resolve(educationRepository.importData(payload));
  await loadEducationState({ force: true });
  return result;
}

export function resetEducationRuntimeForTests() {
  cachedState = null;
  loadingPromise = null;
  lastError = null;
}

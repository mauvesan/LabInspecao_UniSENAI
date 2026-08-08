export const config = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME || 'LabInspeÃ§Ã£o_UniSENAI',

  appVersion: import.meta.env.VITE_APP_VERSION || '4.3.0-D4.3.2',

  classGroup: import.meta.env.VITE_CLASS_GROUP || '6SEM_2026',

  access: {
    enabled: String(import.meta.env.VITE_ACCESS_ENABLED ?? 'true').toLowerCase() === 'true',

    authenticationProvider: import.meta.env.VITE_AUTH_PROVIDER || 'local',

    persistenceProvider: import.meta.env.VITE_PLATFORM_PERSISTENCE || 'local',
  },

  education: {
    persistenceProvider: import.meta.env.VITE_EDUCATION_PERSISTENCE || 'local',
  },

  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  },

  online: {
    enabled: String(import.meta.env.VITE_ONLINE_ENABLED).toLowerCase() === 'true',

    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || '',

    accessToken: import.meta.env.VITE_ACCESS_TOKEN || '',
  },

  completion: {
    minimumCorrect: 4,
    totalQuestions: 5,
    xpPerModule: 100,
  },
});

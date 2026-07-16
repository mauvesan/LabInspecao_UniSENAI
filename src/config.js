export const config = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME || "LabInspeção_UniSENAI",
  appVersion: import.meta.env.VITE_APP_VERSION || "4.0.0-alpha.1",
  classGroup: import.meta.env.VITE_CLASS_GROUP || "6SEM_2026",
  online: {
    enabled: String(import.meta.env.VITE_ONLINE_ENABLED).toLowerCase() === "true",
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL || "",
    accessToken: import.meta.env.VITE_ACCESS_TOKEN || ""
  },
  completion: { minimumCorrect: 4, totalQuestions: 5, xpPerModule: 100 }
});

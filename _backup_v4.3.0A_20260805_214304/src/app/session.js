import { config } from '../config.js';
const KEY = 'labinspecao_v4_progress';
export const session = {
  progress: null,
  profile: null,
  initialize() {
    try {
      this.progress = JSON.parse(localStorage.getItem(KEY)) || {
        xp: 0,
        modules: {},
        pendingAttempts: [],
      };
    } catch {
      this.progress = { xp: 0, modules: {}, pendingAttempts: [] };
    }
  },
  recordAttempt(a) {
    const m = this.progress.modules[a.moduleCode] || {
      bestScore: 0,
      completed: false,
      attempts: 0,
    };
    m.bestScore = Math.max(m.bestScore, a.percentage);
    m.attempts++;
    if (a.passed && !m.completed) {
      m.completed = true;
      m.completedAt = a.submittedAt;
      this.progress.xp += config.completion.xpPerModule;
    }
    this.progress.modules[a.moduleCode] = m;
    localStorage.setItem(KEY, JSON.stringify(this.progress));
    dispatchEvent(new CustomEvent('lab:progress-changed'));
    return m;
  },
  queueAttempt(a) {
    this.progress.pendingAttempts.push(a);
    localStorage.setItem(KEY, JSON.stringify(this.progress));
  },
};

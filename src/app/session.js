import { config } from '../config.js';
const KEY = 'labinspecao_v4_progress';
export const session = {
  progress: null,
  profile: null,
  identity: null,
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
  setIdentity(authenticationSession) {
    this.identity = authenticationSession?.user || null;

    this.profile = this.identity
      ? {
          userId: this.identity.id,
          displayName: this.identity.displayName,
          email: this.identity.email,
          role: this.identity.role,
          roleLabel: this.identity.roleLabel || this.identity.role,
        }
      : null;
    dispatchEvent(
      new CustomEvent('lab:identity-changed', {
        detail: this.identity,
      }),
    );
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

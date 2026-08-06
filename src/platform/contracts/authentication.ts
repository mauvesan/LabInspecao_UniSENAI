export type UserRole = 'guest' | 'student' | 'teacher' | 'administrator';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  displayName: string;
  role: UserRole;
}

export interface AuthenticationSession {
  status: 'anonymous' | 'authenticated';
  user: AuthenticatedUser;
  issuedAt: string;
}

export type AuthenticationListener = (session: AuthenticationSession) => void;

export interface AuthenticationService {
  initialize(): Promise<AuthenticationSession>;
  getSession(): AuthenticationSession;
  subscribe(listener: AuthenticationListener): () => void;
  signOut(): Promise<AuthenticationSession>;
}

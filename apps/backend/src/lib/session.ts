import { FastifyRequest } from 'fastify';

export interface SessionUser {
  user_id: number;
  email: string;
  name: string;
  agency_code: string;
}

export function requireAuth(request: FastifyRequest): SessionUser {
  const user = request.session.get('user') as SessionUser | undefined;
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export function setSessionUser(request: FastifyRequest, user: SessionUser): void {
  request.session.set('user', user);
}

export function clearSession(request: FastifyRequest): void {
  request.session.delete();
}

import { FastifyRequest } from 'fastify';

export interface SessionUser {
  user_id: number;
  email: string;
  name: string;
  agency_code: string;
}

export function requireAuth(request: FastifyRequest): SessionUser {
  const user = (request.session as any).user as SessionUser | undefined;
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function setSessionUser(request: FastifyRequest, user: SessionUser): Promise<void> {
  (request.session as any).user = user;
  await request.session.save();
}

export function clearSession(request: FastifyRequest): void {
  request.session.destroy();
}

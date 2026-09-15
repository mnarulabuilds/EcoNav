import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PlatformUser, UserRole } from '@econav/platform';
import { getPlatformStore } from '../store/index.js';

export async function getAuthUser(request: FastifyRequest): Promise<PlatformUser | undefined> {
  const header = request.headers.authorization;
  const token = typeof header === 'string' ? header : undefined;
  return getPlatformStore().getUserByToken(token);
}

export function requireAuth(roles?: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = await getAuthUser(request);
    if (!user) {
      reply.status(401).send({ error: 'Authentication required' });
      return;
    }
    if (roles && !roles.includes(user.role)) {
      reply.status(403).send({ error: 'Insufficient permissions' });
      return;
    }
    (request as FastifyRequest & { user: PlatformUser }).user = user;
  };
}

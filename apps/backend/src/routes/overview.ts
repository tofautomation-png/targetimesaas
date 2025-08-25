import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../lib/session';
import { calculateKPIs } from '../lib/kpis';
import { AppError, ErrorCodes, createErrorResponse } from '../lib/errors';

export async function overviewRoutes(fastify: FastifyInstance) {
  // Get KPIs endpoint
  fastify.get('/kpis', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const kpis = await calculateKPIs(user.agency_code);
      
      return reply.code(200).send(kpis);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('KPIs error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });
}

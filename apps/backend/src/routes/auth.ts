import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { baserowClient } from '../lib/baserow';
import { setSessionUser, clearSession, requireAuth } from '../lib/session';
import { AppError, ErrorCodes, createErrorResponse } from '../lib/errors';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function authRoutes(fastify: FastifyInstance) {
  // Login endpoint
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // Get users table (global table)
      const usersTableId = await baserowClient.getTableId('users');
      if (!usersTableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Users table not found', 500);
      }

      // Find user by email
      const users = await baserowClient.listRows(usersTableId);
      const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (!user || user.password !== password) {
        throw new AppError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password', 401);
      }

      // Validate required fields
      if (!user.agency_code) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, 'User missing agency code', 400);
      }

      // Set session
      const sessionUser = {
        user_id: user.id,
        email: user.email,
        name: user.name || user.email,
        agency_code: user.agency_code
      };

      setSessionUser(request, sessionUser);

      return reply.code(200).send({
        user: {
          id: sessionUser.user_id,
          email: sessionUser.email,
          name: sessionUser.name
        },
        agency_code: sessionUser.agency_code
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      console.error('Login error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  // Logout endpoint
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      clearSession(request);
      return reply.code(204).send();
    } catch (error) {
      console.error('Logout error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  // Get session endpoint
  fastify.get('/session', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      
      return reply.code(200).send({
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name
        },
        agency_code: user.agency_code
      });
    } catch (error) {
      const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
      return reply.code(401).send(createErrorResponse(appError));
    }
  });
}

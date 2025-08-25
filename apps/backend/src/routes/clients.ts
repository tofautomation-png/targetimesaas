import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { baserowClient } from '../lib/baserow';
import { requireAuth } from '../lib/session';
import { AppError, ErrorCodes, createErrorResponse } from '../lib/errors';

const createClientSchema = z.object({
  client_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.string().optional()
});

const updateClientSchema = z.object({
  client_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  last_visit_date: z.string().optional(),
  stage: z.string().optional(),
  owner: z.string().optional(),
  due_date: z.string().optional()
});

const emailLogSchema = z.object({
  subject: z.string().min(1),
  content: z.string().optional()
});

export async function clientsRoutes(fastify: FastifyInstance) {
  // Welcome clients endpoints
  fastify.get('/welcome', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const tableId = await baserowClient.getTableId('clients_welcome', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Welcome clients table not found', 404);
      }

      const clients = await baserowClient.listRows(tableId);
      return reply.code(200).send(clients);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Get welcome clients error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  fastify.post('/welcome', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const clientData = createClientSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('clients_welcome', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Welcome clients table not found', 404);
      }

      const newClient = await baserowClient.createRow(tableId, {
        ...clientData,
        created_at: new Date().toISOString()
      });
      
      return reply.code(201).send(newClient);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Create welcome client error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  fastify.patch('/welcome/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const clientId = parseInt(request.params.id);
      const updateData = updateClientSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('clients_welcome', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Welcome clients table not found', 404);
      }

      const updatedClient = await baserowClient.updateRow(tableId, clientId, updateData);
      return reply.code(200).send(updatedClient);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Update welcome client error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  // Retargeting clients endpoints
  fastify.get('/retargeting', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const tableId = await baserowClient.getTableId('clients_retargeting', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Retargeting clients table not found', 404);
      }

      const clients = await baserowClient.listRows(tableId);
      
      // Add derived 'needs_attention' field
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const enrichedClients = clients.map(client => ({
        ...client,
        needs_attention: client.last_visit_date ? 
          new Date(client.last_visit_date) < thirtyDaysAgo : true
      }));
      
      return reply.code(200).send(enrichedClients);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Get retargeting clients error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  fastify.post('/retargeting/:id/email-logs', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const clientId = parseInt(request.params.id);
      const emailData = emailLogSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('email_logs_table_retargeting', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Retargeting email logs table not found', 404);
      }

      const emailLog = await baserowClient.createRow(tableId, {
        client_id: clientId,
        subject: emailData.subject,
        content: emailData.content || '',
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
      
      return reply.code(201).send(emailLog);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Create retargeting email log error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  // Follow-up clients endpoints
  fastify.get('/followups', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const tableId = await baserowClient.getTableId('clients_followup', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Follow-up clients table not found', 404);
      }

      const clients = await baserowClient.listRows(tableId);
      
      // Sort by due date and add overdue flag
      const now = new Date();
      const enrichedClients = clients.map(client => ({
        ...client,
        is_overdue: client.due_date ? new Date(client.due_date) < now : false
      })).sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      
      return reply.code(200).send(enrichedClients);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Get followup clients error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  fastify.post('/followups/:id/email-logs', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const clientId = parseInt(request.params.id);
      const emailData = emailLogSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('email_logs_table_followup', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Follow-up email logs table not found', 404);
      }

      const emailLog = await baserowClient.createRow(tableId, {
        client_id: clientId,
        subject: emailData.subject,
        content: emailData.content || '',
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
      
      return reply.code(201).send(emailLog);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Create followup email log error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  fastify.patch('/followups/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const clientId = parseInt(request.params.id);
      const updateData = updateClientSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('clients_followup', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Follow-up clients table not found', 404);
      }

      const updatedClient = await baserowClient.updateRow(tableId, clientId, updateData);
      return reply.code(200).send(updatedClient);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Update followup client error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });
}

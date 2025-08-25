import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { baserowClient } from '../lib/baserow';
import { requireAuth } from '../lib/session';
import { AppError, ErrorCodes, createErrorResponse } from '../lib/errors';

const createAppointmentSchema = z.object({
  client_id: z.number().optional(),
  client_name: z.string().min(1),
  starts_at: z.string(),
  status: z.string().optional().default('scheduled'),
  value: z.number().optional().default(0)
});

const updateAppointmentSchema = z.object({
  client_id: z.number().optional(),
  client_name: z.string().optional(),
  starts_at: z.string().optional(),
  status: z.string().optional(),
  value: z.number().optional()
});

export async function appointmentsRoutes(fastify: FastifyInstance) {
  // Get appointments with optional date range filters
  fastify.get('/', async (request: FastifyRequest<{ 
    Querystring: { 
      start_date?: string; 
      end_date?: string; 
      status?: string; 
    } 
  }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const { start_date, end_date, status } = request.query;
      const tableId = await baserowClient.getTableId('appointments_table', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Appointments table not found', 404);
      }

      let appointments = await baserowClient.listRows(tableId);
      
      // Apply filters
      if (start_date || end_date || status) {
        appointments = appointments.filter(appointment => {
          let include = true;
          
          if (start_date && appointment.starts_at) {
            include = include && new Date(appointment.starts_at) >= new Date(start_date);
          }
          
          if (end_date && appointment.starts_at) {
            include = include && new Date(appointment.starts_at) <= new Date(end_date);
          }
          
          if (status && appointment.status) {
            include = include && appointment.status.toLowerCase() === status.toLowerCase();
          }
          
          return include;
        });
      }
      
      // Sort by start time
      appointments.sort((a, b) => {
        if (!a.starts_at) return 1;
        if (!b.starts_at) return -1;
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      });
      
      return reply.code(200).send(appointments);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Get appointments error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  // Create appointment
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const appointmentData = createAppointmentSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('appointments_table', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Appointments table not found', 404);
      }

      const newAppointment = await baserowClient.createRow(tableId, appointmentData);
      return reply.code(201).send(newAppointment);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Create appointment error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });

  // Update appointment
  fastify.patch('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const appointmentId = parseInt(request.params.id);
      const updateData = updateAppointmentSchema.parse(request.body);
      const tableId = await baserowClient.getTableId('appointments_table', user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, 'Appointments table not found', 404);
      }

      const updatedAppointment = await baserowClient.updateRow(tableId, appointmentId, updateData);
      return reply.code(200).send(updatedAppointment);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Update appointment error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });
}

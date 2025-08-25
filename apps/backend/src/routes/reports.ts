import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { baserowClient } from '../lib/baserow';
import { requireAuth } from '../lib/session';
import { AppError, ErrorCodes, createErrorResponse } from '../lib/errors';

export async function reportsRoutes(fastify: FastifyInstance) {
  // Export data endpoint
  fastify.get('/export', async (request: FastifyRequest<{ 
    Querystring: { 
      entity: 'appointments' | 'retargeting' | 'followups' | 'welcome';
      format: 'csv' | 'json';
    } 
  }>, reply: FastifyReply) => {
    try {
      const user = requireAuth(request);
      const { entity, format = 'json' } = request.query;

      if (!entity) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Entity parameter is required', 400);
      }

      let tablePrefix: string;
      switch (entity) {
        case 'appointments':
          tablePrefix = 'appointments_table';
          break;
        case 'retargeting':
          tablePrefix = 'clients_retargeting';
          break;
        case 'followups':
          tablePrefix = 'clients_followup';
          break;
        case 'welcome':
          tablePrefix = 'clients_welcome';
          break;
        default:
          throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid entity type', 400);
      }

      const tableId = await baserowClient.getTableId(tablePrefix, user.agency_code);
      
      if (!tableId) {
        throw new AppError(ErrorCodes.TABLE_NOT_FOUND, `${entity} table not found`, 404);
      }

      const data = await baserowClient.listRows(tableId);

      if (format === 'csv') {
        // Convert to CSV
        if (data.length === 0) {
          return reply
            .header('Content-Type', 'text/csv')
            .header('Content-Disposition', `attachment; filename="${entity}_export.csv"`)
            .code(200)
            .send('');
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          ).join(',')
        );
        
        const csv = [headers, ...rows].join('\n');
        
        return reply
          .header('Content-Type', 'text/csv')
          .header('Content-Disposition', `attachment; filename="${entity}_export.csv"`)
          .code(200)
          .send(csv);
      } else {
        // Return JSON
        return reply
          .header('Content-Type', 'application/json')
          .header('Content-Disposition', `attachment; filename="${entity}_export.json"`)
          .code(200)
          .send({
            entity,
            exported_at: new Date().toISOString(),
            count: data.length,
            data
          });
      }
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(createErrorResponse(error));
      }
      
      if (error instanceof Error && error.message === 'Authentication required') {
        const appError = new AppError(ErrorCodes.AUTHENTICATION_REQUIRED, 'Authentication required', 401);
        return reply.code(401).send(createErrorResponse(appError));
      }
      
      console.error('Export error:', error);
      const appError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
      return reply.code(500).send(createErrorResponse(appError));
    }
  });
}

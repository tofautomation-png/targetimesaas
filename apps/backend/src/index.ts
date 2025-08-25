import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
import { authRoutes } from './routes/auth';
import { overviewRoutes } from './routes/overview';
import { clientsRoutes } from './routes/clients';
import { appointmentsRoutes } from './routes/appointments';
import { reportsRoutes } from './routes/reports';
import { healthRoutes } from './routes/health';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    });

    await fastify.register(cookie);
    
    await fastify.register(session, {
      secret: process.env.SESSION_SECRET || 'replace_me_with_secure_random_string',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'none' // Required for cross-origin cookies
      }
    });

    // Register routes
    await fastify.register(authRoutes, { prefix: '/auth' });
    await fastify.register(overviewRoutes, { prefix: '/overview' });
    await fastify.register(clientsRoutes, { prefix: '/clients' });
    await fastify.register(appointmentsRoutes, { prefix: '/appointments' });
    await fastify.register(reportsRoutes, { prefix: '/reports' });
    await fastify.register(healthRoutes);

    const port = parseInt(process.env.PORT || '8080');
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Backend server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

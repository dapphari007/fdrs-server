import { Server } from '@hapi/hapi';
import { Boom } from '@hapi/boom';
import { authPlugin } from './auth';
import { loggingPlugin } from './logging';
import { errorHandler, notFoundHandler, validationErrorHandler } from '../middlewares/errorMiddleware';
import logger from '../utils/logger';

// Create a CORS handler plugin
const corsPlugin = {
  name: 'cors-handler',
  register: async (server: Server) => {
    // Add a special handler for OPTIONS requests
    server.route({
      method: 'OPTIONS',
      path: '/{p*}',
      handler: (request, h) => {
        logger.info(`Handling OPTIONS request for: ${request.path}`);
        return h.response().code(200);
      },
      options: {
        auth: false, // No authentication for OPTIONS requests
        description: 'Handle CORS preflight requests',
        tags: ['api', 'cors'],
      },
    });
  }
};

export const registerPlugins = async (server: Server): Promise<void> => {
  // Register plugins
  await server.register([
    authPlugin,
    loggingPlugin,
    corsPlugin,
  ]);
  
  // Register error handlers
  server.ext('onPreResponse', errorHandler);
  
  // Register not found handler
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response instanceof Boom && response.output?.statusCode === 404) {
      return notFoundHandler(request, h);
    }
    return h.continue;
  });
  
  // Register validation error handler
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response instanceof Boom && response.output?.statusCode === 400) {
      return validationErrorHandler(request, h, response as Error);
    }
    return h.continue;
  });
};
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: { title: 'FlexLiving Reviews API', version: '1.0.0' },
      components: {},
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
});

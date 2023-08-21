/* eslint-disable @typescript-eslint/no-explicit-any */
import Fastify, { type FastifyInstance } from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import { fastifyCors } from '@fastify/cors';
import { fastifyUnderPressure } from '@fastify/under-pressure';
import Routes from '../router';

const fastify = Fastify();

export default async function initializeFastifyClient(): Promise<FastifyInstance> {
  fastify.register(fastifySwagger, {
    specification: {
      path: './build/swagger.yaml',
      postProcessor: function (swaggerObject) {
        return swaggerObject;
      },
      baseDir: '../../',
    },
    prefix: '/swagger',
  });
  await fastify.register(fastifyCors, {
    origin: '*',
    methods: ['POST'],
    allowedHeaders: '*',
  });
  await fastify.register(fastifyUnderPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 100000000,
    maxRssBytes: 100000000,
    maxEventLoopUtilization: 0.98,
    message: `Under pressure used heap : ` + String(fastify.memoryUsage().heapUsed),
  });
  fastify.register(Routes);
  await fastify.ready();
  fastify.swagger();
  return await fastify;
}

export async function destroyFasityClient(): Promise<void> {
  await fastify.close();
}


import { z } from 'zod';
import { insertAttemptSchema, attempts } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  attempts: {
    create: {
      method: 'POST' as const,
      path: '/api/attempts',
      input: insertAttemptSchema,
      responses: {
        201: z.custom<typeof attempts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/attempts',
      responses: {
        200: z.array(z.custom<typeof attempts.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type AttemptInput = z.infer<typeof api.attempts.create.input>;

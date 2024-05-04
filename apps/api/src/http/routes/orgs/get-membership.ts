import { roleSchema } from '@repo/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'

export async function getUserMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:organizationSlug/membership',
      {
        schema: {
          tags: ['Organizations'],
          summary: 'Get user membership on an organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.string().uuid(),
                organizationId: z.string().uuid(),
                role: roleSchema,
              }),
            }),
          },
        },
      },
      async (request) => {
        const { organizationSlug } = request.params
        const { membership } = await request.getUserMembership(organizationSlug)

        return {
          membership: {
            role: membership.role,
            id: membership.id,
            organizationId: membership.organizationId,
          },
        }
      },
    )
}

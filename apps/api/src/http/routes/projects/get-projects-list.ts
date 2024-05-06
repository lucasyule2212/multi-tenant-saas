import { defineAbilityFor } from '@repo/auth'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProjectsList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects',
      {
        schema: {
          tags: ['Projects'],
          summary: "Get organization's projects",
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
          }),
          response: {
            200: z.object({
              projectsList: z.array(
                z.object({
                  slug: z.string(),
                  id: z.string(),
                  ownerId: z.string(),
                  name: z.string(),
                  avatarUrl: z.string().nullish(),
                  createdAt: z.date(),
                  owner: z.object({
                    id: z.string(),
                    name: z.string().nullish(),
                    avatarUrl: z.string().nullish(),
                  }),
                  organizationId: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { orgSlug } = request.params

        const { membership, organization } =
          await request.getUserMembership(orgSlug)

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            'You are not allowed to see projects in this organization',
          )
        }

        const organizationProjectsList = await prisma.project.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return reply
          .status(200)
          .send({ projectsList: organizationProjectsList })
      },
    )
}

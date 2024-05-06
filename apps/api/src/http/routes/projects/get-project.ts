import { defineAbilityFor } from '@repo/auth'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['Projects'],
          summary: 'Get project details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            200: z.object({
              project: z.object({
                slug: z.string(),
                id: z.string(),
                ownerId: z.string(),
                name: z.string(),
                avatarUrl: z.string().nullish(),
                owner: z.object({
                  id: z.string(),
                  name: z.string().nullish(),
                  avatarUrl: z.string().nullish(),
                }),
                organizationId: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { orgSlug, projectSlug } = request.params

        const { membership, organization } =
          await request.getUserMembership(orgSlug)

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError('You are not allowed to see this project')
        }

        const project = await prisma.project.findUnique({
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        return reply.status(200).send({ project })
      },
    )
}

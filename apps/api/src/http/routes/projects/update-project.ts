import { defineAbilityFor } from '@repo/auth'
import { projectSchema } from '@repo/auth/src/models/project'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['Projects'],
          summary: 'Update a project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { name, description } = request.body
        const userId = await request.getCurrentUserId()
        const { orgSlug, projectSlug } = request.params

        const { membership, organization } =
          await request.getUserMembership(orgSlug)

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const project = await prisma.project.findUnique({
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        const authProject = projectSchema.parse({
          id: project.id,
          ownerId: project.ownerId,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('update', authProject)) {
          throw new UnauthorizedError(
            'You are not allowed to update this project',
          )
        }

        await prisma.project.update({
          where: {
            id: project.id,
          },
          data: {
            name,
            description,
          },
        })

        return reply.status(204).send()
      },
    )
}

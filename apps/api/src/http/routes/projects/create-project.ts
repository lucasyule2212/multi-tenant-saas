import { defineAbilityFor } from '@repo/auth'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import slugify from 'slugify'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/projects',
      {
        schema: {
          tags: ['Projects'],
          summary: 'Create a new project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string().nullish(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              projectId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params

        const { membership, organization } =
          await request.getUserMembership(slug)

        const { name, description } = request.body

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('create', 'Project')) {
          throw new UnauthorizedError(
            'You are not allowed to create a project in this organization',
          )
        }

        const slugifiedProjectName = slugify(name)

        const project = await prisma.project.create({
          data: {
            name,
            description: description ?? '',
            slug: slugifiedProjectName,
            ownerId: userId,
            organizationId: organization.id,
          },
        })

        return reply.status(201).send({
          projectId: project.id,
        })
      },
    )
}

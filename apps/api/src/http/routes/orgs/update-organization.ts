import { defineAbilityFor } from '@repo/auth'
import { organizationSchema } from '@repo/auth/src/models/organization'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug',
      {
        schema: {
          tags: ['Organizations'],
          summary: 'Update organization details',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUserByDomain: z.boolean().optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { name, domain, shouldAttachUserByDomain } = request.body

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const authOrganization = organizationSchema.parse({
          id: organization.id,
          ownerId: organization.ownerId,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to update this organization',
          )
        }

        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: { domain, id: { not: organization.id } },
          })
          if (organizationByDomain) {
            throw new BadRequestError(
              'Organization with this domain already exists',
            )
          }
        }

        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUserByDomain,
          },
        })

        return reply.status(204).send()
      },
    )
}

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

export async function transferOrganization(app: FastifyInstance) {
  // ? Patch differs from Put in that it only updates the fields that are displayed in the request route
  // ? It is used to update a resource partially, in this case the organization owner
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organizations/:slug/owner',
      {
        schema: {
          tags: ['Organizations'],
          summary: 'Transfer organization ownership',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            transferToUserId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { transferToUserId } = request.body

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const authOrganization = organizationSchema.parse({
          id: organization.id,
          ownerId: organization.ownerId,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('transfer_ownership', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to transfer the ownership of this organization',
          )
        }

        const transferToUser = await prisma.user.findUnique({
          where: {
            id: transferToUserId,
          },
        })

        if (!transferToUser) {
          throw new BadRequestError('User not found')
        }

        const organizationOwner = await prisma.user.findUnique({
          where: {
            id: organization.ownerId,
          },
        })

        if (organizationOwner?.id === transferToUserId) {
          throw new BadRequestError(
            'User is already the owner of the organization',
          )
        }

        const userHasOrganizationMembership = await prisma.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        })

        if (!userHasOrganizationMembership) {
          throw new BadRequestError('User is not a member of the organization')
        }

        await prisma.$transaction([
          prisma.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: organization.ownerId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),
          prisma.organization.update({
            where: {
              id: organization.id,
            },
            data: {
              ownerId: transferToUserId,
            },
          }),
        ])

        return reply.status(204).send()
      },
    )
}

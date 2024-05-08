import { defineAbilityFor } from '@repo/auth'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/invites/:inviteId',
      {
        schema: {
          tags: ['Invites'],
          summary: 'Revoke an invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            inviteId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug, inviteId } = request.params

        const { membership, organization } =
          await request.getUserMembership(slug)

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('delete', 'Invite')) {
          throw new UnauthorizedError(
            'You are not allowed to revoke a invite in this organization',
          )
        }

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        })

        if (!invite) {
          throw new BadRequestError('Invite not found or expired')
        }
        await prisma.invite.delete({
          where: {
            id: inviteId,
          },
        })

        return reply.status(204).send()
      },
    )
}

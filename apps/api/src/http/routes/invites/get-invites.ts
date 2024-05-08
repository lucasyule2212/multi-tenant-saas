import { defineAbilityFor, roleSchema } from '@repo/auth'
import { userSchema } from '@repo/auth/src/models/user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/invites',
      {
        schema: {
          tags: ['Invites'],
          summary: 'Get all invites in an organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              invites: z.array(
                z.object({
                  id: z.string().uuid(),
                  email: z.string().email(),
                  role: roleSchema,
                  createdAt: z.date(),
                  author: z
                    .object({
                      id: z.string().uuid(),
                      name: z.string().nullish(),
                      avatarUrl: z.string().url().nullish(),
                    })
                    .nullish(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params

        const { membership, organization } =
          await request.getUserMembership(slug)

        const authUser = userSchema.parse({
          id: userId,
          role: membership.role,
        })

        const { cannot } = defineAbilityFor(authUser)

        if (cannot('get', 'Invite')) {
          throw new UnauthorizedError(
            'You are not allowed to get invites in this organization',
          )
        }

        const invites = await prisma.invite.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: {
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

        return reply.status(201).send({ invites })
      },
    )
}

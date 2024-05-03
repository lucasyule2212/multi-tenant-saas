import { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../routes/_errors/unauthorized-error'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch (error) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }

    request.getUserMembership = async (organizationSlug: string) => {
      const userId = await request.getCurrentUserId()
      const member = await prisma.member.findFirst({
        where: {
          userId,
          organization: {
            slug: organizationSlug,
          },
        },
        include: {
          organization: true,
        },
      })

      if (!member) {
        throw new UnauthorizedError('User is not a member of this organization')
      }

      const { organization, ...membership } = member

      return { organization, membership }
    }
  })
})

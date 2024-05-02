import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function createAccount(app: FastifyInstance) {
  // ? Zod validation integrated with Fastify, allows to validate the request body with Zod schema middleware
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(8),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userWithEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithEmail) {
        return reply.status(400).send({
          error: 'User with same e-mail already exists.',
        })
      }

      const [, domain] = email.split('@')
      const autoJoinOrganization = await prisma.organization.findFirst({
        where: { domain, shouldAttachUserByDomain: true },
      })

      const passwordHash = await hash(password, 6)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      })

      return reply.status(201).send(user)
    },
  )
}

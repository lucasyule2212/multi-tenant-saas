import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/pasword',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with email & password',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userFromEmail) {
        throw new BadRequestError('Invalid credentials')
      }

      if (userFromEmail.passwordHash === null) {
        throw new BadRequestError(
          'User does not have a password. Use social login instead.',
        )
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials')
      }

      const token = await reply.jwtSign(
        { sub: userFromEmail.id },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}

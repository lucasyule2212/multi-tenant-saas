import { env } from '@repo/env'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/github',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with Github',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const githubOAuthUrl = new URL(
        'https://github.com/login/oauth/access_token',
      )

      githubOAuthUrl.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
      githubOAuthUrl.searchParams.set(
        'client_secret',
        env.GITHUB_OAUTH_CLIENT_SECRET,
      )
      githubOAuthUrl.searchParams.set(
        'redirect_uri',
        env.GITHUB_OAUTH_CLIENT_REDIRECT_URI,
      )
      githubOAuthUrl.searchParams.set('code', code)

      const githubAccessTokenResponse = await fetch(githubOAuthUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      console.log()

      const githubAccessTokenData = await githubAccessTokenResponse.json()

      const { access_token: githubAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAccessTokenData)

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
        },
      })

      const githubUserData = await githubUserResponse.json()

      const {
        id: githubUserId,
        name,
        email,
        avatar_url: avatarUrl,
      } = z
        .object({
          id: z.number().int().transform(String),
          avatar_url: z.string().url(),
          name: z.string().nullable(),
          email: z.string().email().nullable(),
        })
        .parse(githubUserData)

      if (!email) {
        throw new BadRequestError(
          'Your Github account must have an email to authenticate',
        )
      }

      let user = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatarUrl,
          },
        })
      }

      const account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GITHUB',
            userId: user.id,
          },
        },
      })

      if (!account) {
        await prisma.account.create({
          data: {
            provider: 'GITHUB',
            providerAccountID: githubUserId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        { sub: user.id },
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

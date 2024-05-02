import '@/http/routes/routes'

import { env } from '@repo/env'

import { app } from './app'

app
  .listen({
    port: env.SERVER_PORT,
    host: '0.0.0.0',
  })
  .then((address) => {
    console.log(`🚀 Server listening on ${address}`)
  })

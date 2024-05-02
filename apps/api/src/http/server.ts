import '@/http/routes/routes'

import { app } from './app'

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then((address) => {
    console.log(`🚀 Server listening on ${address}`)
  })

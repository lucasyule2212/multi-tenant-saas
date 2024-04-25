import { app } from '../server'
// ? Import the routes
import { createAccount } from './auth/create-account'

app.register(createAccount)

import { app } from '../server'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
// ? Import the routes

app.register(createAccount)
app.register(authenticateWithPassword)

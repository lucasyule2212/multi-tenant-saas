import { app } from '../server'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getUserProfile } from './auth/get-user-profile'
// ? Import the routes

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getUserProfile)

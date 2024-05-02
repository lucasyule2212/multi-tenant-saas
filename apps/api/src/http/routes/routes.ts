import { app } from '../app'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getUserProfile } from './auth/get-user-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetUserPassword } from './auth/reset-user-password'
// ? Import the routes

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getUserProfile)
app.register(requestPasswordRecover)
app.register(resetUserPassword)

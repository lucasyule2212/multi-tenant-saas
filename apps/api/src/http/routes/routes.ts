import { app } from '../app'
import { authenticateWithGithub } from './auth/authenticate-with-github'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getUserProfile } from './auth/get-user-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetUserPassword } from './auth/reset-user-password'
import { createOrganization } from './orgs/create-organization'
import { getUserMembership } from './orgs/get-membership'
import { getOrganization } from './orgs/get-organization'
// ? Import the routes

// Create account
app.register(createAccount)

// Auth routes
app.register(authenticateWithPassword)
app.register(authenticateWithGithub)

// User profile
app.register(getUserProfile)

// User password
app.register(requestPasswordRecover)
app.register(resetUserPassword)

// Organizations
app.register(createOrganization)
app.register(getUserMembership)
app.register(getOrganization)

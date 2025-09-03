import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" }
      },
      async authorize(credentials) {
        // For development/demo, accept any email
        if (credentials?.email) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
          }
        }
        return null
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

/** Roles that are allowed to sign in through the Administrator / HR tab */
const ADMIN_ROLES: Role[] = [Role.SUPER_ADMIN, Role.DIRECTOR, Role.HR]

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Employee ID", type: "text" },
        password: { label: "Password", type: "password" },
        loginRole: { label: "Login Role", type: "text" },
      },
      async authorize(credentials) {
        if (typeof credentials?.identifier !== "string" || typeof credentials?.password !== "string") return null

        const identifier = credentials.identifier.trim()
        if (!identifier || credentials.password.length < 1) return null

        const loginRole = typeof credentials.loginRole === "string" ? credentials.loginRole : "employee"

        const user = await prisma.user.findFirst({
          where: {
            isActive: true,
            OR: [
              { email: identifier.toLowerCase() },
              { employeeId: identifier },
            ],
          },
        })

        if (!user?.password) return null

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordsMatch) return null

        // Enforce role-tab match: admin tab requires admin roles, employee tab requires non-admin roles
        if (loginRole === "admin") {
          if (!ADMIN_ROLES.includes(user.role)) return null
        } else {
          if (ADMIN_ROLES.includes(user.role)) return null
        }

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as Role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
})

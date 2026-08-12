import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        uid: { label: "UID / Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.uid || !credentials?.password) return null;

        const uid = String(credentials.uid).trim();
        const password = String(credentials.password);

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { uid: uid },
              { username: uid },
              { email: uid },
              { employeeCode: uid },
            ],
            employmentStatus: "active",
          },
          include: {
            roles: { include: { role: true } },
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const roles = user.roles.map((r) => r.role.name);

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          uid: user.uid,
          employeeCode: user.employeeCode,
          roles,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.uid = (user as any).uid;
        token.employeeCode = (user as any).employeeCode;
        token.roles = (user as any).roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).uid = token.uid;
        (session.user as any).employeeCode = token.employeeCode;
        (session.user as any).roles = token.roles ?? [];
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

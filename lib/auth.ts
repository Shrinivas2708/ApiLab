import connectDB from "@/lib/db";
import User from "@/models/User";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  pages:{
    signIn:'/auth/signin'
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials?.email }).select("+password");
        if (!user) throw new Error("Invalid credentials");
        
        // Allow login if password matches
        const isMatch = await bcrypt.compare(credentials!.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // CRITICAL STEP: This passes the ID from the token to the session
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub; 
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in .env
};
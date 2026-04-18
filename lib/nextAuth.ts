import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/Models/user.Model";
import { connectDB } from "./mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Username or Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();

                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error("Please enter all fields");
                }

                const user = await User.findOne({
                    $or: [
                        { email: credentials.identifier.toLowerCase() },
                        { username: credentials.identifier.toLowerCase() }
                    ]
                }).select("+password");

                if (!user || !user.password) {
                    throw new Error("No user found with these credentials");
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.fullName,
                    username: user.username,
                    image: user.profilePicture,
                    fullName: user.fullName,
                    profilePicture: user.profilePicture,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.fullName = (user as any).fullName;
                token.profilePicture = (user as any).profilePicture;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const sessionUser = session.user as any;
                sessionUser.id = token.id as string;
                sessionUser.username = token.username as string;        
                sessionUser.fullName = token.fullName as string;        
                sessionUser.profilePicture = token.profilePicture as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

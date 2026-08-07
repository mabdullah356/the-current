import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/Models/user.Model";
import { connectDB } from "./mongodb";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";

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

                if(user?.isVerified==false){
                    throw new Error("Email is not verified,verify-first")
                };
                
                if (!user || !user.password) {
                    throw new Error("Invalid email or password");
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordCorrect) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.fullName,
                    username: user.username,
                    bio: user.bio,
                    image: user.profilePicture,
                    fullName: user.fullName,
                    profilePicture: user.profilePicture,
                };
            },
        }),
        GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
  })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDB();
                
                let existingUser = await User.findOne({ email: user.email });
                
                if (!existingUser) {
                    const randomPassword = Math.random().toString(36).slice(-15) + Math.random().toString(36).slice(-15);
                    existingUser = await User.create({
                        email: user.email,
                        fullName: user.name,
                        profilePicture: user.image,
                        username: user.email?.split("@")[0],
                        isVerified: true,
                        password: randomPassword,
                    });
                }
                
                return true;
            }
            return true;
        },
        async jwt({ token, user, account, trigger, session }) {
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }
            if (user && account?.provider === "google") {
                await connectDB();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.username = dbUser.username;
                    token.fullName = dbUser.fullName;
                    token.profilePicture = dbUser.profilePicture;
                    token.bio = dbUser.bio;
                } else {
                    token.id = user.id;
                    token.fullName = user.name;
                    token.profilePicture = user.image;
                }
            } else if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.fullName = (user as any).fullName;
                token.profilePicture = (user as any).profilePicture;
                token.bio = (user as any).bio;
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
                sessionUser.bio = token.bio as string;
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

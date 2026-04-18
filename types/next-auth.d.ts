import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      fullName: string;
      profilePicture: string;
      image: string;
      bio: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    fullName: string;
    profilePicture: string;
    image: string;
    bio: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    fullName: string;
    profilePicture: string;
    bio: string;
  }
}
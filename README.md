<div align="center">

# Current

**A full-stack Instagram clone built with Next.js 16, React 19, MongoDB, and Cloudinary.**

Real-time messaging, stories, reels, notifications, and a polished dark-mode UI — deployed on Vercel.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://the-current-lite.vercel.app/) · [Report Bug](https://github.com/your-username/current/issues) · [Request Feature](https://github.com/your-username/current/issues)

</div>

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## About

**Current** is a production-grade social media application that replicates Instagram's core functionality with a focus on performance, responsiveness, and modern engineering practices. It supports full authentication flows, real-time polling-based messaging, media uploads via Cloudinary, and a comprehensive notification system.

Built on the **Next.js 16 App Router** with **React 19** and **TypeScript**, the application uses **MongoDB Atlas** for persistence, **NextAuth.js** for authentication (credentials + Google OAuth), and **Cloudinary** for image/video hosting. The UI is designed mobile-first with a dark-mode aesthetic, glassmorphism elements, and Instagram-style gradients.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, custom Node.js server) |
| **UI** | React 19, Tailwind CSS 4, React Icons |
| **Language** | TypeScript 5 (strict mode) |
| **Database** | MongoDB Atlas, Mongoose 9 |
| **Authentication** | NextAuth.js 4 (JWT strategy, Credentials + Google OAuth) |
| **File Storage** | Cloudinary (upload streams) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Real-time** | WebSocket infrastructure (`ws`), polling-based messaging |
| **Password Hashing** | bcryptjs |
| **Deployment** | Vercel (custom server with WebSocket support) |
| **Linting** | ESLint 9 (flat config, core-web-vitals + TypeScript) |

---

## Features

### Authentication & Account Management
- Email/password and username/password sign-in
- Google OAuth sign-in (auto-creates account on first use)
- Email verification via 6-digit OTP
- Forgot password flow with time-limited reset tokens (15-min expiry)
- Email change with verification code
- JWT-based sessions with custom token fields
- Unverified accounts are blocked from logging in

### Posts (Feed)
- Create posts with image/video upload to Cloudinary
- Captions (up to 2,200 characters), location tagging, hashtags (auto-extracted)
- Multi-media support (image + video per post)
- Like/unlike toggle with optimistic UI updates
- Save/unsave bookmark toggle
- Share posts as stories
- Edit and delete posts (owner-only)
- Allow comments / hide likes toggles per post
- Comment system with soft-delete
- Skeleton loading states
- Relative time formatting

### Stories
- Create stories with image/video upload
- Full-screen story viewer (Instagram-style)
- Delete own stories
- Shared posts appear as stories
- Viewed-by tracking
- Gradient ring indicators for unviewed stories

### Reels
- Full-screen vertical video player with auto-play and loop
- Like, comment, share, save actions
- Instagram-style reel UI layout

### Direct Messages (Chat)
- User list for starting conversations
- 1-on-1 messaging
- Polling-based real-time updates (3-second interval)
- WebSocket infrastructure (available for future upgrades)
- Message types: text, image, video, audio, document

### Notifications
- Types: follow, unfollow, like, comment, friend, viewProfile
- Automatic creation on likes, comments, follows
- Self-notification prevention
- Unread count badge on navbar
- Read/unread separation
- Mark-as-read on view
- Delete with confirmation

### User Profiles
- Own profile with posts, saved posts, liked posts (tabbed)
- Other profiles with follow/unfollow/message actions
- Profile picture upload to Cloudinary
- Edit profile (name, username, bio, email, password, picture)
- Follow/unfollow with mutual friend detection
- Friends list
- User suggestions sidebar
- Verified badge display

### UI/UX
- Dark-mode primary design
- Glassmorphism elements with backdrop blur
- Instagram gradient story rings
- Responsive — mobile-first with desktop sidebar
- Route groups for auth vs. main layouts
- Custom toast notification system (success, warning, info, error)
- Skeleton loading across all views
- Custom scrollbar hiding utility
- Slide-down animations

---

## Screenshots

> Add your screenshots here.

```
 screenshots/
 ├── feed.png
 ├── login.png
 ├── stories.png
 ├── reels.png
 ├── messages.png
 ├── profile.png
 └── notifications.png
```

---

## Architecture

### Custom Server

The app runs on a custom Node.js HTTP server (`server.ts`) instead of the default Next.js server. This enables WebSocket upgrade handling for the real-time infrastructure while maintaining full Next.js App Router functionality.

### Authentication Flow

```
User → NextAuth.js (Credentials / Google OAuth) → JWT Token
       ↓
Session stored in cookie → Available via useSession() (client)
                          → Available via getServerSession() (server)
```

### Media Upload Pipeline

```
Client (drag-and-drop / file picker)
  → API Route (streaming buffer)
    → Cloudinary upload_stream()
      → URL stored in MongoDB
```

### Real-time Messaging

```
Client polls GET /api/chat/[receiverId]/webhook?since=<timestamp>
  → Server returns messages newer than timestamp
    → Client appends to conversation
```

### Notification System

```
Event (like/comment/follow) → createNotification() helper
  → Self-notify prevention (sender ≠ receiver)
    → Stored in MongoDB → Queried by recipient
```

---

## Project Structure

```
├── app/
│   ├── (auth)/                    # Auth route group (no sidebar)
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Signup page
│   │   ├── forgot-password/       # Forgot password page
│   │   └── reset-password/[token]/# Password reset page
│   ├── (main)/                    # Main app route group (with sidebar)
│   │   ├── page.tsx               # Home feed (stories + posts)
│   │   ├── create-post/           # Create post
│   │   ├── create-story/          # Create story
│   │   ├── edit-post/[id]/        # Edit post
│   │   ├── edit-profile/          # Edit profile
│   │   ├── explore/               # Explore page
│   │   ├── messages/              # Messages inbox
│   │   │   └── chat/[id]/         # Individual chat
│   │   ├── notifications/         # Notifications list
│   │   │   └── notify/[id]/       # Single notification
│   │   ├── profile/               # Own profile
│   │   ├── reels/                 # Reels feed
│   │   ├── user/[username]/       # Other user's profile
│   │   └── verify-account/[email]/# Email verification
│   ├── api/                       # API routes (37 endpoints)
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── Components/
│   ├── AuthProvider.tsx           # NextAuth SessionProvider
│   ├── ToastProvider.tsx          # Toast notification system
│   ├── PcNavbar.tsx               # Sidebar navigation
│   ├── AsideBar.tsx               # Suggested users sidebar
│   ├── Posts.tsx                  # Posts feed
│   ├── Post.tsx                   # Individual post card
│   ├── Stories.tsx                # Stories carousel + viewer
│   ├── Comment.tsx                # Comment components
│   ├── Reel.tsx                   # Reel player
│   └── Uploads.tsx                # Drag-and-drop uploader
├── Models/                        # Mongoose schemas
│   ├── user.Model.ts
│   ├── post.Model.ts
│   ├── comment.Model.ts
│   ├── story.Model.ts
│   ├── message.Model.ts
│   └── notification.model.ts
├── lib/                           # Server-side utilities
│   ├── mongodb.ts                 # DB connection singleton
│   ├── nextAuth.ts                # NextAuth configuration
│   ├── nodemailer.ts              # Email utilities
│   ├── notification.ts            # Notification helper
│   └── wss.ts                     # WebSocket server
├── types/
│   └── next-auth.d.ts             # NextAuth type augmentation
├── public/                        # Static assets
├── server.ts                      # Custom HTTP + WebSocket server
├── next.config.ts                 # Next.js config (headers, images)
├── tsconfig.json                  # TypeScript config
├── postcss.config.mjs             # PostCSS (Tailwind v4)
└── eslint.config.mjs              # ESLint 9 flat config
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.17
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account (free tier works)
- **Google Cloud** project (for OAuth, optional)
- **Gmail** account with app password (for email verification)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/current.git
cd current

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/current?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-super-secret-random-string
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional — leave empty to disable Google sign-in)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary
cloud_name=your-cloud-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret

# Gmail (Nodemailer)
USER_EMAIL=your-email@gmail.com
USER_PASS=your-gmail-app-password

# Public Domain (for password reset links)
NEXT_PUBLIC_DOMAIN=http://localhost:3000
```

See [Environment Variables](#environment-variables) for detailed descriptions.

### Development

```bash
npm run dev
```

The app starts on a custom server at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | **Yes** | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | **Yes** | Secret for JWT signing (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | **Yes** | Base URL (`http://localhost:3000` for dev, production URL for deploy) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `cloud_name` | **Yes** | Cloudinary cloud name |
| `CLOUD_API_KEY` | **Yes** | Cloudinary API key |
| `CLOUD_API_SECRET` | **Yes** | Cloudinary API secret |
| `USER_EMAIL` | **Yes** | Gmail address for sending verification/reset emails |
| `USER_PASS` | **Yes** | Gmail app-specific password |
| `NEXT_PUBLIC_DOMAIN` | **Yes** | Public URL for password reset links |

---

## API Routes

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth.js handler (login, session, CSRF) |
| POST | `/api/signup` | Register new user |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/me` | Current user profile + posts |
| GET | `/api/users/[username]` | User profile by username |
| GET | `/api/users/friends` | Friends list |
| POST | `/api/users/follow/[userId]` | Follow/unfollow user |
| POST | `/api/users/send-otp` | Send email OTP |
| POST | `/api/users/confirm-email` | Confirm email with OTP |
| POST | `/api/users/verify-email` | Verify email change |
| PUT | `/api/users/update/username` | Update username |
| PUT | `/api/users/update/fullName` | Update full name |
| PUT | `/api/users/update/email` | Update email |
| PUT | `/api/users/update/password` | Update password |
| PUT | `/api/users/update/bio` | Update bio |
| PUT | `/api/users/update/profilePicture` | Update profile picture |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts (newest first, limit 20) |
| POST | `/api/posts` | Create post with media |
| GET | `/api/posts/[postId]` | Get single post |
| PUT | `/api/posts/[postId]` | Update post |
| DELETE | `/api/posts/[postId]` | Delete post (owner only) |
| POST | `/api/posts/[postId]/like` | Toggle like |
| POST | `/api/posts/[postId]/saved` | Toggle save/bookmark |
| POST | `/api/posts/share/[id]` | Share post as story |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | List all stories |
| POST | `/api/stories` | Create story |
| DELETE | `/api/stories/[id]` | Delete story (owner only) |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comment` | Create comment |
| GET | `/api/comment/[postId]/comments` | Get comments for post |
| DELETE | `/api/comment/[postId]/comments/[commentId]` | Delete comment (soft delete) |

### Chat / Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message |
| GET | `/api/chat/[receiverId]` | Get conversation |
| GET | `/api/chat/[receiverId]/webhook` | Poll for new messages (real-time) |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notification` | List all notifications |
| GET | `/api/notification/unread` | Unread notification count |
| GET | `/api/notification/[id]` | Mark notification as read |
| DELETE | `/api/notification/[id]` | Delete notification |

### Reels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reels` | List video posts as reels |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/db` | Test MongoDB connection |

---

## Database Models

### User

```
username        String (unique, indexed)
email           String (unique, indexed)
password        String (hashed with bcryptjs)
fullName        String
bio             String
profilePicture  { url: String }
followers        [ObjectId → User]
following        [ObjectId → User]
friends          [ObjectId → User]
posts            [ObjectId → Post]
savedPosts       [ObjectId → Post]
likedPosts       [ObjectId → Post]
isPrivate        Boolean
isVerified       Boolean
role             String (default: "user")
isEmailVerified  Boolean
emailVerificationToken   String
emailVerificationExpiry  Date
passwordResetToken       String
passwordResetExpiry      Date
```

### Post

```
user            ObjectId → User
caption         String (max 2200 chars)
media           [{ url: String, type: String }]
location        String
taggedUsers     [ObjectId → User]
likes           [ObjectId → User]
hashtags        [String]
allowComments   Boolean (default: true)
hideLikes       Boolean (default: false)
```

### Story

```
user            ObjectId → User
media           { url: String, type: String }
likes           [ObjectId → User]
viewedBy        [ObjectId → User]
```

### Comment

```
userId          ObjectId → User
postId          ObjectId → Post
content         String
isEdited        Boolean
```

### Message

```
sender          ObjectId → User
receiver        ObjectId → User
type            String (text | image | video | audio | document)
content         String
attachments     [String]
isPinned        Boolean
isStarred       Boolean
```

### Notification

```
sender          ObjectId → User
receiver        ObjectId → User
type            String (follow | unfollow | like | comment | friend | viewProfile)
postId          ObjectId → Post
commentId       ObjectId → Comment
groupKey        String
isRead          Boolean (default: false)
```

---

## Deployment

### Vercel

The application is deployed on Vercel at [https://the-current-lite.vercel.app/](https://the-current-lite.vercel.app/).

> **Note:** Vercel's serverless functions do not support WebSocket connections. The WebSocket infrastructure in `server.ts` is designed for self-hosted deployments. On Vercel, real-time messaging falls back to polling.

### Self-Hosted

For full WebSocket support:

```bash
# Build
npm run build

# Start (custom server with WebSocket upgrade)
npm run start
```

The custom `server.ts` handles both HTTP and WebSocket connections on the same port.

---

## Security

- **Security headers** applied via `next.config.ts`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self), microphone=(self), geolocation=(self)`
- Passwords hashed with **bcryptjs**
- **JWT-based** sessions with configurable secret
- Unverified email accounts are **blocked from login**
- Owner-only enforcement on post/comment deletion
- Self-notification prevention in notification system

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code passes `npm run lint`
- TypeScript compiles without errors
- New features include appropriate model changes and API routes

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with Next.js, React, and MongoDB**

</div>

# Instagram Lite

A  high-performance, responsive social media application built with the Next.js App Router, Tailwind CSS, and MongoDB. This project replicates the core features and design aesthetics of Instagram with a focus on speed, user experience, and a modern developer workflow.

---

## Technical Stack

*   Frontend: Next.js (App Router), React 19, Tailwind CSS 4
*   Backend: Next.js Server Actions, MongoDB with Mongoose
*   Authentication: Custom Auth with bcryptjs password hashing
*   Icons: React Icons
*   Deployment: Optimized for Vercel

---

## Core Features

*   **Responsive Design**: Pixel-perfect replication of Instagram's UI for mobile and desktop views.
*   **Authentication**: Secure login and signup flows with route protection and password hashing.
*   **Dynamic Layouts**: Route grouping logic to handle different navigation states (Auth vs App).
*   **Production Models**: Scalable Mongoose schemas for Users, Posts, and Interactions.
*   **Aesthetic UI**: Dark-mode primary design with glassmorphism and modern typography.

---

## Folder Structure

```text
├── app/
│   ├── (auth)/         # Login/Signup route group (No Sidebar)
│   ├── (main)/         # Main application group (With Sidebar)
│   ├── Components/      # Reusable UI components
│   └── globals.css     # Global styles and Tailwind config
├── Models/             # Mongoose schemas and database logic
├── public/             # Static assets
└── next.config.ts      # Next.js configuration
```

---

## Database Schema (User Model)

The user model is designed for high-scale social interactions including:
*   Username & Email indexing for fast lookups
*   Automatic password hashing hooks
*   Followers/Following relationship arrays
*   Post and Saved Post references
*   Virtual properties for analytics (counts)

---

## Getting Started

Follow these steps to set up the project locally:

### 1. Prerequisites
Ensure you have Node.js and a MongoDB instance (or Atlas URI) ready.

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root and add:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Production Optimization

*   **Server Actions**: Minimizes client-side JavaScript by offloading logic to the server.
*   **Route Groups**: Optimal layout rendering for different page types.
*   **Mongoose Virtuals**: Efficient data representation without redundant storage.

---

## License

This project is open-source and available under the MIT License.

# EchoMind — Web Application

Frontend application for the EchoMind AI-powered journaling platform, built with Next.js 14, GraphQL, and real-time emotional analysis systems.

The web client enables users to:
- write intelligent journal entries
- receive live AI emotional insights
- explore mood analytics
- chat with past journal memories
- generate weekly mental health reports

Designed with a modern production-oriented architecture using App Router, Apollo Client, Socket.IO, and TypeScript.

---

## Live Demo

- Web App: https://echomind-journal.vercel.app/
- Backend API: https://echomind-server.onrender.com/health

---

## Features

- AI-powered journal editor
- Real-time emotional analysis
- Interactive mood analytics dashboard
- Chat with diary using AI
- Weekly Mental Map reports
- PDF report generation
- Authentication & protected routes
- Admin dashboard
- Realtime websocket updates
- Responsive modern UI

---

## Tech Stack

### Core
- Next.js 14 (App Router)
- TypeScript
- Apollo Client
- GraphQL

### UI & Visualization
- Tailwind CSS
- Inline component styling
- Recharts

### Realtime & Auth
- Socket.IO Client
- JWT Authentication

---

## Application Routes

| Route | Description | Access |
|---|---|---|
| `/login` | User login | Public |
| `/signup` | Create account | Public |
| `/editor` | AI journal editor | Protected |
| `/entries` | Journal history | Protected |
| `/entries/[id]` | Detailed entry analysis | Protected |
| `/insights` | Mood analytics dashboard | Protected |
| `/chat` | AI diary chat | Protected |
| `/report` | Weekly reports + PDF | Protected |
| `/admin` | Platform administration | Admin |

---

## Project Structure

```text
app/
├── (auth)/
│   ├── login/
│   └── signup/
│
├── (dashboard)/
│   ├── editor/
│   ├── entries/
│   ├── insights/
│   ├── chat/
│   ├── report/
│   └── layout.tsx
│
├── admin/
├── providers.tsx
└── layout.tsx

lib/
├── apollo.ts
├── socket.ts
└── auth.ts
```

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Runs at:

```text
http://localhost:3000
```

---

## Environment Variables

Create:

```text
.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

---

## Engineering Highlights

- Apollo Client manages all server state without Redux/Zustand
- Realtime emotional updates powered by Socket.IO
- App Router architecture with clean server/client separation
- Protected dashboard routing with JWT authentication
- Reusable GraphQL query architecture
- Component-scoped inline styling for predictable UI behavior

---

## Design Decisions

### Why GraphQL?
GraphQL enables:
- flexible client-driven queries
- reduced overfetching
- scalable frontend-backend integration
- strong typing across the stack

### Why Apollo Client?
Apollo provides:
- normalized caching
- query refetching
- optimistic UI support
- scalable GraphQL state management

### Why Inline Styling?
Inline styles were intentionally used to:
- avoid CSS leakage
- simplify component portability
- maintain rapid UI iteration speed

---

## Future Improvements

- Full mobile responsiveness refinement
- Theme switching
- Optimistic realtime UI updates
- Offline caching
- Push notifications
- Docker support
- CI/CD pipelines
- Automated testing

---

## Author

### Anubhav Mishra
### Full Stack Developer

- GitHub: https://github.com/anubhav-0004
- LinkedIn: https://www.linkedin.com/in/anubhav-04-mishra/

---

Built as part of the EchoMind full-stack AI ecosystem.
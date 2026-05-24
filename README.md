# EchoMind — AI-Powered Journaling Platform

EchoMind is a full-stack AI journaling platform that analyzes emotions in real-time, generates intelligent weekly reports, and allows users to interact with their journal history using conversational AI.

Built as a production-focused engineering project, EchoMind demonstrates modern full-stack architecture using GraphQL, TypeScript, PostgreSQL, Next.js, React Native, and realtime systems.

---

## Live Demo

- Web App: https://echomind-journal.vercel.app/
- Backend Health: https://echomind-server.onrender.com/health
- Repository: https://github.com/anubhav-0004/EchoMind-Journal

---

## Features

- Real-time AI mood analysis while typing
- AI-generated emotional summaries
- Weekly mental health reports
- Interactive insights dashboard
- Chat with your diary using AI
- PDF report generation
- Realtime updates with Socket.IO
- Cross-platform mobile app with Expo
- JWT-based authentication
- Admin dashboard & role management

---

## Tech Stack

### Frontend
- Next.js
- React Native + Expo
- Apollo Client
- TypeScript

### Backend
- Node.js
- Express
- GraphQL + Apollo Server
- Socket.IO
- Prisma ORM

### Database & AI
- PostgreSQL
- Groq API (LLaMA 3.1)

### DevOps & Deployment
- Turborepo Monorepo
- Vercel
- Render

---

## Architecture Overview

```text
Next.js Web App
        │
        │ GraphQL + Socket.IO
        ▼
Node.js + Apollo Server
        │
        ├── PostgreSQL + Prisma
        ├── Groq AI API
        └── Cron Jobs

React Native App
        │
        └── Shared Backend
```

---

## Monorepo Structure

```text
echomind/
├── apps/
│   ├── server/
│   ├── web/
│   └── mobile/
│
├── packages/
│   ├── types/
│   └── utils/
│
└── turbo.json
```

---

## Local Setup

### Clone Repository

```bash
git clone https://github.com/anubhav-0004/EchoMind-Journal.git

cd EchoMind-Journal
```

### Install Dependencies

```bash
npm install
```

### Backend Environment Variables

Create:

```text
apps/server/.env
```

```env
DATABASE_URL=
JWT_SECRET=
GROQ_API_KEY=
WEB_URL=
PORT=4000
```

### Web Environment Variables

Create:

```text
apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SERVER_URL=
```

### Mobile Environment Variables

Create:

```text
apps/mobile/.env
```

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SOCKET_URL=
```

---

## Run Development Servers

### Backend

```bash
cd apps/server
npm run dev
```

### Web

```bash
cd apps/web
npm run dev
```

### Mobile

```bash
cd apps/mobile
npx expo start
```

---

## Engineering Highlights

- GraphQL architecture for flexible client-driven APIs
- Realtime websocket-based emotional insights
- Shared TypeScript types across frontend and backend
- Monorepo architecture with Turborepo
- Automated weekly report generation using cron jobs
- Cross-platform mobile support with Expo

---

## Future Improvements

- Docker support
- CI/CD pipelines
- Automated testing
- Push notifications
- Redis caching
- Offline mobile sync
- AI memory system
- Advanced observability & monitoring

---

## Author

### Anubhav Mishra

- GitHub: https://github.com/anubhav-0004
- LinkedIn: https://www.linkedin.com/in/anubhav-04-mishra/

---

If you found this project interesting, consider giving it a ⭐ on GitHub.
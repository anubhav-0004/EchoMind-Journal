# EchoMind — Backend Server

Backend infrastructure for the EchoMind AI-powered journaling ecosystem, built with Node.js, TypeScript, GraphQL, PostgreSQL, and realtime AI processing.

The server powers:
- authentication
- journal management
- realtime emotional insights
- AI-generated reflections
- weekly report automation
- websocket communication
- admin analytics

Designed using scalable backend engineering practices with a modular service-oriented architecture.

---

## Live API

- Health Endpoint: https://echomind-server.onrender.com/health
- GraphQL Endpoint: `POST /graphql`

---

## Core Features

- GraphQL API with Apollo Server
- JWT authentication & authorization
- Realtime AI insights using Socket.IO
- AI-powered emotional analysis
- Weekly report automation with cron jobs
- PostgreSQL database with Prisma ORM
- PDF report generation
- Role-based admin system
- Modular service architecture

---

## Tech Stack

### Backend Core
- Node.js
- TypeScript
- Express.js
- Apollo Server
- GraphQL

### Database & ORM
- PostgreSQL
- Prisma ORM v7

### AI & Realtime
- Groq API (LLaMA 3.1)
- Socket.IO

### Security & Auth
- JWT
- bcrypt

### Automation & Utilities
- node-cron
- Puppeteer

---

## Project Structure

```text
src/
├── graphql/
│   ├── schema/
│   ├── resolvers/
│   └── context.ts
│
├── services/
│   ├── grok.service.ts
│   ├── pdf.service.ts
│   ├── fcm.service.ts
│   └── jobs/
│
├── socket/
│   ├── socket.server.ts
│   └── insight.handler.ts
│
├── prisma/
│   └── client.ts
│
├── lib/
│   └── auth.ts
│
└── index.ts
```

---

## GraphQL API

### Key Queries

```graphql
me
entries
weeklyReports
adminStats
```

### Key Mutations

```graphql
signup
login

createEntry
publishEntry
deleteEntry

chatWithDiary

generateWeeklyReport
```

---

## Realtime Events

| Event | Direction | Purpose |
|---|---|---|
| `entry:typing` | Client → Server | Debounced journal updates |
| `entry:insight` | Server → Client | Live AI emotional analysis |

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

Runs with:
- hot reload
- tsx watch mode
- TypeScript runtime execution

---

## Prisma Commands

### Run Database Migration

```bash
npm run db:migrate
```

### Generate Prisma Client

```bash
npm run db:generate
```

### Open Prisma Studio

```bash
npm run db:studio
```

---

## Environment Variables

Create:

```text
.env
```

```env
DATABASE_URL=
JWT_SECRET=
GROQ_API_KEY=
PORT=4000
WEB_URL=
```

---

## Architecture Highlights

### GraphQL-First API Design
EchoMind uses GraphQL to provide:
- flexible client-driven data fetching
- strongly typed schemas
- scalable frontend integration
- reduced overfetching

### Realtime AI Processing
Socket.IO powers:
- live typing analysis
- emotional feedback streaming
- low-latency insight updates

### Service-Oriented Structure
Business logic is separated into:
- AI services
- PDF services
- auth utilities
- websocket handlers
- scheduled jobs

This improves:
- maintainability
- scalability
- testing capability

### Prisma ORM
Prisma provides:
- type-safe database access
- schema-driven modeling
- migration workflows
- excellent TypeScript integration

---

## Security Features

- JWT authentication
- bcrypt password hashing
- protected GraphQL resolvers
- role-based admin authorization
- secure environment configuration
- CORS protection

---

## Automation System

Weekly emotional reports are generated automatically every Sunday using `node-cron`.

The pipeline:
1. fetches user entries
2. aggregates emotional trends
3. generates AI reflections
4. stores report data
5. enables PDF export

---

## Future Improvements

- Redis caching
- Docker containerization
- CI/CD pipelines
- Queue workers
- Webhook integrations
- Push notification delivery
- OpenTelemetry monitoring
- Background AI processing
- Automated testing infrastructure

---

## Author

### Anubhav Mishra

- GitHub: https://github.com/anubhav-0004
- LinkedIn: https://www.linkedin.com/in/anubhav-04-mishra/

---

Part of the EchoMind full-stack AI ecosystem.
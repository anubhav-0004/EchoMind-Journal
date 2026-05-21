# EchoMind — Backend Server

Node.js + TypeScript backend powering the EchoMind journaling platform.

## Stack
- **Runtime:** Node.js 18+ with TypeScript
- **API:** GraphQL via Apollo Server 4
- **Database:** PostgreSQL with Prisma ORM v7
- **Real-time:** Socket.io (live AI insights)
- **AI:** Groq API (LLaMA 3.1 8B)
- **Auth:** JWT + bcrypt
- **Jobs:** node-cron (Sunday weekly reports)
- **PDF:** Puppeteer

## Structure

src/
├── graphql/
│   ├── schema/
│   │   └── typeDefs.ts        # GraphQL schema
│   ├── resolvers/
│   │   ├── auth.resolver.ts   # signup, login
│   │   └── entry.resolver.ts  # CRUD + AI mutations
│   └── context.ts             # JWT auth context
├── services/
│   ├── grok.service.ts        # All Groq AI calls
│   ├── pdf.service.ts         # PDF generation
│   ├── fcm.service.ts         # Push notifications
│   └── jobs/
│       └── weeklyReport.job.ts # Sunday cron
├── socket/
│   ├── socket.server.ts       # Socket.io setup
│   └── insight.handler.ts     # Live insight debouncer
├── prisma/
│   └── client.ts              # Prisma singleton
├── lib/
│   └── auth.ts                # JWT + bcrypt helpers
└── index.ts                   # Server entry point


## API

### GraphQL Endpoint
`POST /graphql`

### Key Queries
```graphql
me          # Current user
entries     # User's journal entries
weeklyReports # Generated weekly reports
adminStats  # Platform analytics (ADMIN only)
```

### Key Mutations
```graphql
signup / login           # Authentication
createEntry / publishEntry # Journal entry lifecycle
chatWithDiary            # LLM-powered diary chat
generateWeeklyReport     # Manual report generation
```

### Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `entry:typing` | Client → Server | Text update (debounced 2500ms) |
| `entry:insight` | Server → Client | Live AI analysis result |

## Development
```bash
npm run dev          # Start with hot reload (tsx watch)
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Regenerate Prisma client
```

## Environment Variables
```env
DATABASE_URL=       # PostgreSQL connection string
JWT_SECRET=         # Min 32 char random string
GROQ_API_KEY=       # From console.groq.com
PORT=4000
WEB_URL=            # Frontend URL for CORS
```
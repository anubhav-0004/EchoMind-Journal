# EchoMind — Web Application

Next.js 14 frontend for the EchoMind AI journaling platform.

## Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS-in-JS (inline styles)
- **Data fetching:** Apollo Client 3 (GraphQL)
- **Real-time:** Socket.io client
- **Charts:** Recharts
- **Auth:** JWT stored in localStorage

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/login` | Sign in page | Public |
| `/signup` | Create account | Public |
| `/editor` | Journal editor with live AI insights | Protected |
| `/entries` | List of all past entries | Protected |
| `/entries/[id]` | Entry detail with full AI analysis | Protected |
| `/insights` | Mood trends + charts | Protected |
| `/chat` | Chat with diary (LLM) | Protected |
| `/report` | Weekly Mental Map + PDF download | Protected |
| `/admin` | Platform analytics (ADMIN only) | Admin |

## Structure

app/
├── (auth)/
│   ├── login/         # Login page
│   └── signup/        # Signup page
├── (dashboard)/
│   ├── layout.tsx     # Sidebar + auth guard
│   ├── editor/        # Journal editor
│   ├── entries/       # Entry list + [id] detail
│   ├── insights/      # Mood charts
│   ├── chat/          # Diary chat
│   └── report/        # Weekly reports
├── admin/             # Admin dashboard
├── providers.tsx      # Apollo provider
└── layout.tsx         # Root layout + metadata
lib/
├── apollo.ts          # Apollo Client setup
├── socket.ts          # Socket.io singleton
└── auth.ts            # Token helpers


## Development
```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

## Key Design Decisions
- **No Zustand/Redux** — Apollo cache handles all server state
- **Inline styles** — Component-scoped, no CSS conflicts
- **Server/Client split** — `page.tsx` exports metadata (server), `*Client.tsx` has hooks (client)
- **Socket singleton** — One socket connection shared across the editor session
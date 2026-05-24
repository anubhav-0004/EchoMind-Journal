# EchoMind — Mobile Application

React Native mobile client for the EchoMind AI-powered journaling ecosystem.

Built using Expo, React Native, GraphQL, and realtime websocket communication, the mobile app provides an immersive emotional journaling experience with AI-driven insights and cross-platform accessibility.

The application enables users to:
- write journal entries
- receive realtime emotional analysis
- explore mood insights
- manage personal reflections
- interact with AI-generated summaries
- access journaling features on mobile devices

---

## Features

- AI-powered journaling
- Realtime emotional insights
- Beautiful calming mobile UI
- Secure JWT authentication
- GraphQL-powered data fetching
- Socket.IO realtime communication
- Mood tracking and analysis
- Entry management system
- Mobile-first responsive experience
- Android APK support via Expo/EAS

---

## Tech Stack

### Mobile Framework
- React Native
- Expo SDK 54
- TypeScript

### State & API
- Apollo Client
- GraphQL

### Realtime
- Socket.IO Client

### Navigation
- React Navigation

### Security & Storage
- Expo Secure Store
- JWT Authentication

---

## Application Screens

| Screen | Purpose |
|---|---|
| Login | User authentication |
| Signup | Account creation |
| Home | Dashboard overview |
| Editor | Journal writing |
| Entries | Past journal list |
| Entry Details | Detailed AI analysis |
| Insights | Mood analytics |
| Profile | User account management |

---

## Project Structure

```text
src/
├── components/
├── screens/
├── navigation/
├── lib/
│   ├── apollo.ts
│   ├── socket.ts
│   └── storage.ts
│
├── graphql/
├── theme/
└── utils/

assets/
├── icon.png
├── adaptive-icon.png
├── splash.png
└── favicon.png
```

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Start Expo Development Server

```bash
npx expo start
```

### Clear Cache

```bash
npx expo start -c
```

---

## Android APK Build

### Development Build

```bash
eas build -p android --profile preview
```

### Fresh Clean Build

```bash
eas build -p android --profile preview --clear-cache
```

---

## Environment Variables

Create:

```text
.env
```

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SOCKET_URL=
```

Example:

```env
EXPO_PUBLIC_API_URL=https://echomind-server.onrender.com/graphql
EXPO_PUBLIC_SOCKET_URL=https://echomind-server.onrender.com
```

---

## Realtime System

The mobile app uses Socket.IO for:
- live emotional insight streaming
- realtime typing analysis
- instant AI feedback updates

This creates a more interactive journaling experience compared to traditional static diary applications.

---

## Design Philosophy

EchoMind Mobile focuses on:
- calming UI aesthetics
- emotional wellness experience
- minimal visual clutter
- premium startup-style design
- smooth mobile interactions

The interface uses:
- dark calming backgrounds
- sage-green accents
- soft emotional color palettes
- clean typography

---

## Authentication Flow

Authentication is handled using:
- JWT tokens
- Apollo Client
- Expo Secure Store

Protected screens are only accessible after successful login.

---

## Key Engineering Decisions

### Why Expo?
Expo accelerates:
- mobile development
- APK generation
- asset management
- cross-platform support

### Why Apollo Client?
Apollo provides:
- GraphQL caching
- efficient state management
- query refetching
- realtime integration support

### Why Secure Store?
Sensitive tokens are stored securely using Expo Secure Store instead of AsyncStorage.

---

## Future Improvements

- Push notifications
- Offline journaling support
- Biometric authentication
- Mood heatmaps
- Voice journaling
- AI mood recommendations
- Dockerized backend integration
- CI/CD deployment pipeline
- App Store & Play Store publishing

---

## Author

### Anubhav Mishra

- GitHub: https://github.com/anubhav-0004
- LinkedIn: https://www.linkedin.com/in/anubhav-04-mishra/

---

Part of the EchoMind full-stack AI ecosystem.
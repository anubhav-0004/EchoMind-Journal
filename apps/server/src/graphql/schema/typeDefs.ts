import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  enum EntryStatus { DRAFT PUBLISHED }
  enum Role { USER ADMIN }

  type User {
    id: ID!
    email: String!
    displayName: String!
    avatarUrl: String
    role: Role!
    notifyDaily: Boolean!
    notifyWeekly: Boolean!
    timezone: String!
    createdAt: DateTime!
    currentStreak: Int!
    entries(limit: Int, offset: Int): [Entry!]!
    weeklyReports(limit: Int): [WeeklyReport!]!
  }

  type Entry {
    id: ID!
    title: String!
    body: String!
    wordCount: Int!
    status: EntryStatus!
    tags: [String!]!
    writtenAt: DateTime!
    publishedAt: DateTime
    moodAnalysis: MoodAnalysis
  }

  type MoodAnalysis {
    id: ID!
    moodScore: Float!
    sentimentPolarity: String!
    sentimentScore: Float!
    primaryMood: String!
    emotionBreakdown: JSON!
    stressLevel: Float!
    keywords: [String!]!
    aiSummary: String!
    processedAt: DateTime!
  }

  type WeeklyReport {
    id: ID!
    weekStartDate: DateTime!
    weekEndDate: DateTime!
    avgMoodScore: Float!
    avgStressLevel: Float!
    dominantMoods: [String!]!
    topThemes: [String!]!
    emotionArc: JSON!
    aiSummary: String!
    pdfUrl: String
    generatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ChatMessage {
    role: String!
    content: String!
  }

  type AdminStats {
    totalUsers: Int!
    activeThisWeek: Int!
    avgMoodPlatform: Float!
    totalEntries: Int!
  }

  type Query {
    me: User!
    entry(id: ID!): Entry
    entries(limit: Int, offset: Int, from: DateTime, to: DateTime): [Entry!]!
    weeklyReport(weekStartDate: DateTime!): WeeklyReport
    weeklyReports(limit: Int): [WeeklyReport!]!
    adminStats: AdminStats!
    adminUsers(limit: Int, offset: Int): [User!]!
  }

  type Mutation {
    signup(email: String!, password: String!, displayName: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createEntry(title: String!, body: String!, tags: [String!]): Entry!
    updateEntry(id: ID!, title: String, body: String, tags: [String!]): Entry!
    publishEntry(id: ID!): Entry!
    deleteEntry(id: ID!): Boolean!
    updateProfile(
      displayName: String
      notifyDaily: Boolean
      notifyWeekly: Boolean
      fcmToken: String
      timezone: String
    ): User!
    chatWithDiary(message: String!, history: [ChatHistoryInput!]!): ChatMessage!
    generateWeeklyReport(weekStartDate: String!): WeeklyReport!
  }

  input ChatHistoryInput {
    role: String!
    content: String!
  }
`
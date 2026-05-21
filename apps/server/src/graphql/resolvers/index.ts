import { GraphQLScalarType, Kind } from 'graphql'
import { authResolvers } from './auth.resolver'
import { entryResolvers } from './entry.resolver'

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (value: any) => new Date(value).toISOString(),
  parseValue: (value: any) => new Date(value as string),
  parseLiteral: (ast: any) => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
})

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  serialize: (value: any) => value,
  parseValue: (value: any) => value,
  parseLiteral: (ast: any) => ast,
})

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,
  Query: {
    ...entryResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...entryResolvers.Mutation,
  },
  User: authResolvers.User,
}
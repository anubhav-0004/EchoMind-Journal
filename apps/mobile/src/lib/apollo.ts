import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getToken } from './storage'

const httpLink = createHttpLink({
  // Replace with your deployed server URL when deploying
  // For local dev use your machine's IP, not localhost
  // (mobile device/emulator can't reach localhost)
  uri: 'https://echomind-server.onrender.com/graphql',
  // ↑ Run `ipconfig` in terminal, use your IPv4 address
})

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
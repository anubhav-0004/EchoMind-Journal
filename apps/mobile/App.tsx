import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './src/lib/apollo'
import { AppNavigator } from './src/navigation/AppNavigator'
import { StatusBar } from 'expo-status-bar'

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <StatusBar style="light" />
      <AppNavigator />
    </ApolloProvider>
  )
}

registerRootComponent(App)
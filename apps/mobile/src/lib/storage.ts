import * as SecureStore from 'expo-secure-store'

// SecureStore is the mobile equivalent of localStorage
// but encrypted — proper for storing JWT tokens on mobile

const TOKEN_KEY = 'echomind_token'

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken()
  return !!token
}
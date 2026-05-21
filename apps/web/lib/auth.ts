export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('echomind_token')
}

export function setToken(token: string) {
  localStorage.setItem('echomind_token', token)
}

export function removeToken() {
  localStorage.removeItem('echomind_token')
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('echomind_token')
}
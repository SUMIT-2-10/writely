const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const request = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, { credentials: 'include', ...options })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

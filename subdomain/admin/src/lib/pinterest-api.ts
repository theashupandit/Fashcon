import { pinterestConfig } from './pinterest'

export async function pinterestRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(
    `https://api.pinterest.com/v5${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pinterestConfig.accessToken}`,
        ...(options.headers || {}),
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()

    throw new Error(
      `Pinterest API Error: ${response.status} - ${error}`
    )
  }

  return response.json()
}

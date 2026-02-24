/**
 * Represents a GitHub user.
 * Used both in API responses and local state.
 */
export interface User {
  /** Unique numeric ID assigned by GitHub */
  id: number

  /** GitHub username (login handle) */
  login: string

  /** URL of the user's avatar image */
  avatar_url: string

  /** URL to the user's GitHub profile page */
  html_url: string
}
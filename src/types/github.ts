import type { User } from './user'

/**
 * GitHub API search response for users.
 * Matches the structure returned by GitHub's /search/users endpoint.
 */
export interface GitHubSearchResponse {
  /** Total number of users matching the query */
  total_count: number

  /** Whether the results are incomplete (GitHub API may truncate large results) */
  incomplete_results: boolean

  /** Array of user objects returned in this response */
  items: User[]
}

/**
 * Local hook state for GitHub user search.
 * Used by `useGitHubSearch` to track query, results, and loading/error status.
 */
export interface SearchState {
  /** Current search query string */
  query: string

  /** Array of users returned from GitHub API */
  results: User[]

  /** Whether the search request is in progress */
  isLoading: boolean

  /** Error message if a search fails; null otherwise */
  error: string | null

  /** Total number of users matching the query (from GitHub API) */
  totalCount: number
}
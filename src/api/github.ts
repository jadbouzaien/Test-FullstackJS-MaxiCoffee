import type { GitHubSearchResponse } from '../types/github'

/**
 * Base URL for all GitHub API requests.
 * Extracted to constant to avoid duplication and
 * make future API versioning easier.
 */
const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Custom error thrown when GitHub rate limit is exceeded.
 * Includes the reset date so UI can display countdown or retry time.
 */
export class RateLimitError extends Error {
    resetAt: Date

    constructor(resetAt: Date) {
        super('GitHub API rate limit exceeded')
        this.name = 'RateLimitError'
        this.resetAt = resetAt
    }
}

/**
 * Generic search error wrapper.
 * Used to standardize API error handling across the app.
 */
export class SearchError extends Error {
    statusCode?: number

    constructor(message: string, statusCode?: number) {
        super(message)
        this.name = 'SearchError'
        this.statusCode = statusCode
    }
}

/**
 * Normalized search result returned to the UI layer.
 * `nextUrl` is extracted from the Link header for pagination.
 */
export interface GitHubSearchResult {
  data: GitHubSearchResponse;
  nextUrl: string | null;
}

/**
 * Parses GitHub pagination `Link` header.
 *
 * Example header:
 * <https://api.github.com/search/users?q=john&page=2>; rel="next"
 *
 * We only extract the `next` relation to support infinite scrolling.
 */
function parseNextUrl(linkHeader: string | null): string | null {
    if (!linkHeader) return null

    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/)

    return match ? match[1] : null
}

/**
 * Performs initial GitHub user search.
 *
 * Delegates actual fetching logic to `fetchGitHubSearchUrl`
 * to avoid duplicating request + error handling logic.
 */
export async function searchGitHubUsers(
    query: string,
    signal: AbortSignal,
    perPage = 30
): Promise<GitHubSearchResult> {

    // Build URL using URL API to ensure proper query encoding
    const url = new URL(`${GITHUB_API_BASE}/search/users`)
    url.searchParams.set('q', query)
    url.searchParams.set('per_page', String(perPage))

    return fetchGitHubSearchUrl(url.toString(), signal)
}

/**
 * Fetches a GitHub search URL and handles:
 * - Abort support
 * - Rate limiting
 * - Standard API errors
 * - Pagination extraction
 *
 * This function centralizes error normalization so
 * UI layer does not deal with raw `fetch` responses.
 */
export async function fetchGitHubSearchUrl(
    url: string,
    signal: AbortSignal
): Promise<GitHubSearchResult> {

    const response = await fetch(url, {
        signal,
        headers: {
            // Explicitly request v3 JSON format to avoid API format shifts
            Accept: 'application/vnd.github.v3+json',
        },
    })

    if (!response.ok) {

        // GitHub returns 403 or 429 when rate limit is exceeded
        if (response.status === 403 || response.status === 429) {

            // GitHub provides UNIX timestamp in seconds
            const resetHeader = response.headers.get('x-ratelimit-reset')

            const resetAt = resetHeader
                ? new Date(parseInt(resetHeader, 10) * 1000)
                : new Date(Date.now() + 60_000) // fallback if header missing

            throw new RateLimitError(resetAt)
        }

        // Normalize all other API errors
        throw new SearchError(
            `GitHub API error: ${response.statusText}`,
            response.status
        )
    }

    // We assert type here because GitHub guarantees response shape for this endpoint
    const data = (await response.json()) as GitHubSearchResponse

    // Extract pagination info from Link header
    const nextUrl = parseNextUrl(response.headers.get('link'))

    return { data, nextUrl }
}

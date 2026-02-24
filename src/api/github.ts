import type { GitHubSearchResponse } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export class RateLimitError extends Error {
  resetAt: Date;
  constructor(resetAt: Date) {
    super('GitHub API rate limit exceeded');
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
  }
}

export class SearchError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'SearchError';
    this.statusCode = statusCode;
  }
}

export interface GitHubSearchResult {
  data: GitHubSearchResponse;
  nextUrl: string | null;
}

function parseNextUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

export async function searchGitHubUsers(
  query: string,
  signal: AbortSignal,
  perPage = 30
): Promise<GitHubSearchResult> {
  const url = new URL(`${GITHUB_API_BASE}/search/users`);
  url.searchParams.set('q', query);
  url.searchParams.set('per_page', String(perPage));

  return fetchGitHubSearchUrl(url.toString(), signal);
}

export async function fetchGitHubSearchUrl(
  url: string,
  signal: AbortSignal
): Promise<GitHubSearchResult> {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      const resetHeader = response.headers.get('x-ratelimit-reset');
      const resetAt = resetHeader
        ? new Date(parseInt(resetHeader, 10) * 1000)
        : new Date(Date.now() + 60_000);
      throw new RateLimitError(resetAt);
    }
    throw new SearchError(`GitHub API error: ${response.statusText}`, response.status);
  }

  const data = (await response.json()) as GitHubSearchResponse;
  const nextUrl = parseNextUrl(response.headers.get('link'));

  return { data, nextUrl };
}
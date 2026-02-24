import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchGitHubUsers, RateLimitError, SearchError } from '../api/github'

const mockResponse = {
    total_count: 2,
    incomplete_results: false,
    items: [
        { id: 1, login: 'alice', avatar_url: 'https://example.com/alice.png', html_url: 'https://github.com/alice' },
        { id: 2, login: 'bob', avatar_url: 'https://example.com/bob.png', html_url: 'https://github.com/bob' },
    ],
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('searchGitHubUsers', () => {
    it('returns parsed data on success', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
            headers: new Headers(),
        } as Response)

        const controller = new AbortController()
        const result = await searchGitHubUsers('alice', controller.signal)

        expect(result.data.total_count).toBe(2)
        expect(result.data.items[0].login).toBe('alice')
    })

    it('throws RateLimitError on 403', async () => {
        const resetTime = Math.floor(Date.now() / 1000) + 3600
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            headers: new Headers({ 'X-RateLimit-Reset': String(resetTime) }),
        } as Response)

        const controller = new AbortController()
        await expect(searchGitHubUsers('test', controller.signal)).rejects.toBeInstanceOf(RateLimitError)
    })

    it('throws RateLimitError on 429', async () => {
        const resetTime = Math.floor(Date.now() / 1000) + 60
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: new Headers({ 'X-RateLimit-Reset': String(resetTime) }),
        } as Response)

        const controller = new AbortController()
        await expect(searchGitHubUsers('test', controller.signal)).rejects.toBeInstanceOf(RateLimitError)
    })

    it('throws SearchError on other HTTP errors', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            headers: new Headers(),
        } as Response)

        const controller = new AbortController()
        await expect(searchGitHubUsers('test', controller.signal)).rejects.toBeInstanceOf(SearchError)
    })

    it('includes correct URL params', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
            headers: new Headers(),
        } as Response)

        const controller = new AbortController()
        await searchGitHubUsers('myquery', controller.signal, 10)

        const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
        expect(calledUrl).toContain('q=myquery')
        expect(calledUrl).toContain('per_page=10')
    })

    it('passes abort signal to fetch', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
            headers: new Headers(),
        } as Response)

        const controller = new AbortController()
        await searchGitHubUsers('test', controller.signal)

        const callOptions = vi.mocked(fetch).mock.calls[0][1] as RequestInit
        expect(callOptions.signal).toBe(controller.signal)
    })
})

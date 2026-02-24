import { useState, useCallback, useRef } from 'react'
import { searchGitHubUsers, fetchGitHubSearchUrl, RateLimitError } from '../api/github'
import { useDebounce } from './useDebounce'
import type { SearchState } from '../types/github'

const DEBOUNCE_MS = 400
const PER_PAGE = 30

interface UseGitHubSearchReturn {
  state: SearchState;
  onQueryChange: (query: string) => void;
  loadNextPage: () => void;
}

export function useGitHubSearch(): UseGitHubSearchReturn {
    const [state, setState] = useState<SearchState>({
        query: '',
        results: [],
        isLoading: false,
        error: null,
        totalCount: 0,
    })

    const abortControllerRef = useRef<AbortController | null>(null)
    const nextUrlRef = useRef<string | null>(null)
    const isFetchingPageRef = useRef(false)

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setState(prev => ({
                ...prev,
                results: [],
                isLoading: false,
                error: null,
                totalCount: 0,
            }))
            return
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        const controller = new AbortController()
        abortControllerRef.current = controller

        nextUrlRef.current = null

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const { data, nextUrl } = await searchGitHubUsers(query, controller.signal, PER_PAGE)

            nextUrlRef.current = nextUrl

            setState(prev => ({
                ...prev,
                results: data.items,
                isLoading: false,
                totalCount: data.total_count,
            }))
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return

            const errorMessage =
        err instanceof RateLimitError
            ? `Rate limit exceeded. Resets at ${err.resetAt.toLocaleTimeString()}.`
            : err instanceof Error
                ? err.message
                : 'An unexpected error occurred'

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
                results: [],
                totalCount: 0,
            }))
        }
    }, [])

    const debouncedSearch = useDebounce(performSearch, DEBOUNCE_MS)

    const onQueryChange = useCallback(
        (query: string) => {
            const hasQuery = query.trim().length > 0
            setState(prev => ({
                ...prev,
                query,
                isLoading: hasQuery,
                results: hasQuery ? prev.results : [],
                totalCount: hasQuery ? prev.totalCount : 0,
                error: null,
            }))
            debouncedSearch(query)
        },
        [debouncedSearch]
    )

    const loadNextPage = useCallback(async () => {
        if (isFetchingPageRef.current || !nextUrlRef.current) return

        isFetchingPageRef.current = true

        const controller = new AbortController()
        abortControllerRef.current = controller

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const { data, nextUrl } = await fetchGitHubSearchUrl(nextUrlRef.current, controller.signal)
            nextUrlRef.current = nextUrl

            setState(prev => ({
                ...prev,
                results: [...prev.results, ...data.items],
                isLoading: false,
                totalCount: data.total_count,
            }))
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return

            const errorMessage =
        err instanceof RateLimitError
            ? `Rate limit exceeded. Resets at ${err.resetAt.toLocaleTimeString()}.`
            : err instanceof Error
                ? err.message
                : 'An unexpected error occurred'

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
                results: [],
                totalCount: 0,
            }))
        } finally {
            isFetchingPageRef.current = false
        }
    }, [])

    return { state, onQueryChange, loadNextPage }
}
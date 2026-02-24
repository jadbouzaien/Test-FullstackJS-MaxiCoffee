import { useState, useCallback, useRef } from 'react'
import { searchGitHubUsers, fetchGitHubSearchUrl, RateLimitError } from '../api/github'
import { useDebounce } from './useDebounce'
import type { SearchState } from '../types/github'

/**
 * Configuration constants.
 * Centralized for easier tuning or extraction to config layer.
 */
const DEBOUNCE_MS = 400
const PER_PAGE = 30

/**
 * Public contract of the hook.
 * Encapsulates all search logic behind a simple interface.
 */
interface UseGitHubSearchReturn {
  state: SearchState
  onQueryChange: (query: string) => void
  loadNextPage: () => void
}

/**
 * useGitHubSearch
 *
 * Handles:
 * - Debounced search input
 * - Request cancellation via AbortController
 * - Pagination
 * - Rate limit error formatting
 * - Race-condition prevention
 *
 * This hook centralizes all GitHub search behavior,
 * keeping UI components purely declarative.
 */
export function useGitHubSearch(): UseGitHubSearchReturn {

    /**
     * Main state container.
     * Keeps search state cohesive and predictable.
     */
    const [state, setState] = useState<SearchState>({
        query: '',
        results: [],
        isLoading: false,
        error: null,
        totalCount: 0,
    })

    /**
     * Ref: active request controller.
     * Used to cancel in-flight requests when:
     * - Query changes
     * - New page loads
     */
    const abortControllerRef = useRef<AbortController | null>(null)

    /**
     * Ref: stores next pagination URL.
     * Avoids recomputing and avoids putting it in state
     * since it doesn't affect rendering directly.
     */
    const nextUrlRef = useRef<string | null>(null)

    /**
     * Ref: prevents concurrent page fetches.
     * Guards against double-scroll or rapid user actions.
     */
    const isFetchingPageRef = useRef(false)

    /**
     * Core search execution logic.
     * This is intentionally separated from onQueryChange
     * so it can be debounced independently.
     */
    const performSearch = useCallback(async (query: string) => {

        // If query is empty, reset state
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

        /**
         * Cancel any in-flight request to avoid:
         * - Race conditions
         * - Out-of-order responses
         */
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const controller = new AbortController()
        abortControllerRef.current = controller

        // Reset pagination pointer for new query
        nextUrlRef.current = null

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const { data, nextUrl } = await searchGitHubUsers(
                query,
                controller.signal,
                PER_PAGE
            )

            nextUrlRef.current = nextUrl

            setState(prev => ({
                ...prev,
                results: data.items,
                isLoading: false,
                totalCount: data.total_count,
            }))

        } catch (err) {

            // Ignore abort errors (expected behavior)
            if (err instanceof Error && err.name === 'AbortError') return

            /**
             * Normalize error messaging.
             * Converts domain-specific error into user-readable string.
             */
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

    /**
     * Debounced version of search executor.
     * Prevents excessive API calls during typing.
     */
    const debouncedSearch = useDebounce(performSearch, DEBOUNCE_MS)

    /**
     * Handles input query changes.
     *
     * Immediately updates UI state,
     * but defers actual API call via debounce.
     */
    const onQueryChange = useCallback(
        (query: string) => {

            const hasQuery = query.trim().length > 0

            setState(prev => ({
                ...prev,
                query,
                isLoading: hasQuery,
                results: [],
                totalCount: 0,
                error: null,
            }))

            debouncedSearch(query)
        },
        [debouncedSearch]
    )

    /**
     * Loads next page of results.
     * Uses stored nextUrl pointer.
     *
     * Guard conditions prevent:
     * - Duplicate calls
     * - Calls when no next page exists
     */
    const loadNextPage = useCallback(async () => {

        if (isFetchingPageRef.current || !nextUrlRef.current) return

        isFetchingPageRef.current = true

        const controller = new AbortController()
        abortControllerRef.current = controller

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const { data, nextUrl } =
                await fetchGitHubSearchUrl(nextUrlRef.current, controller.signal)

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
import { useEffect, useRef, useCallback } from 'react'

/**
 * useDebounce
 *
 * Returns a debounced version of a callback.
 * The callback execution is postponed until after
 * `delay` milliseconds have elapsed since the last invocation.
 *
 * Useful for:
 * - Search inputs
 * - Resize/scroll handlers
 * - API request throttling
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 *
 * @returns Debounced function with identical parameter types
 *
 * Implementation notes:
 * - Uses a ref to persist timer between renders
 * - Uses useCallback to maintain stable function identity
 * - Cleans up pending timeout on unmount
 */
export function useDebounce<T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number
): (...args: T) => void {

    /**
     * Stores the active timeout ID.
     *
     * useRef is used instead of state because:
     * - We don't want re-renders when timer changes
     * - The timer is an implementation detail
     */
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    /**
     * Memoized debounced function.
     *
     * When invoked:
     * 1. Clears existing timeout (if any)
     * 2. Starts a new timeout
     * 3. Executes callback after delay
     *
     * Dependencies:
     * - callback: ensures latest callback logic is used
     * - delay: ensures timing updates are respected
     */
    const debouncedFn = useCallback(
        (...args: T) => {

            // Cancel previous scheduled execution
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }

            // Schedule new execution
            timerRef.current = setTimeout(() => {
                callback(...args)
            }, delay)

        },
        [callback, delay]
    )

    /**
     * Cleanup effect.
     *
     * Ensures no pending timeout runs after component unmount.
     * Prevents memory leaks and potential state updates
     * on unmounted components.
     */
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    return debouncedFn
}
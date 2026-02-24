import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('delays callback execution', () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useDebounce(callback, 300))

        act(() => {
            result.current('arg1')
        })

        expect(callback).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(300)
        })

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith('arg1')
    })

    it('cancels previous call when called again quickly', () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useDebounce(callback, 300))

        act(() => {
            result.current('first')
            vi.advanceTimersByTime(100)
            result.current('second')
            vi.advanceTimersByTime(100)
            result.current('third')
        })

        act(() => {
            vi.advanceTimersByTime(300)
        })

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith('third')
    })

    it('calls callback multiple times when spaced out', () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useDebounce(callback, 300))

        act(() => {
            result.current('first')
            vi.advanceTimersByTime(400)
            result.current('second')
            vi.advanceTimersByTime(400)
        })

        expect(callback).toHaveBeenCalledTimes(2)
    })

    it('clears timer on unmount', () => {
        const callback = vi.fn()
        const { result, unmount } = renderHook(() => useDebounce(callback, 300))

        act(() => {
            result.current('arg')
        })

        unmount()

        act(() => {
            vi.advanceTimersByTime(300)
        })

        expect(callback).not.toHaveBeenCalled()
    })
})

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from '../hooks/useSelection'

describe('useSelection', () => {
    it('starts with empty selection', () => {
        const { result } = renderHook(() => useSelection())
        expect(result.current.selectedCount).toBe(0)
        expect(result.current.isSelected(1)).toBe(false)
    })

    it('toggles selection on/off', () => {
        const { result } = renderHook(() => useSelection())

        act(() => result.current.toggleSelection(1))
        expect(result.current.isSelected(1)).toBe(true)
        expect(result.current.selectedCount).toBe(1)

        act(() => result.current.toggleSelection(1))
        expect(result.current.isSelected(1)).toBe(false)
        expect(result.current.selectedCount).toBe(0)
    })

    it('selectAll selects all when not all selected', () => {
        const { result } = renderHook(() => useSelection())

        act(() => result.current.selectAll([1, 2, 3]))
        expect(result.current.isAllSelected([1, 2, 3])).toBe(true)
        expect(result.current.selectedCount).toBe(3)
    })

    it('selectAll deselects all when all are already selected', () => {
        const { result } = renderHook(() => useSelection())

        act(() => result.current.selectAll([1, 2, 3]))
        act(() => result.current.selectAll([1, 2, 3]))

        expect(result.current.isAllSelected([1, 2, 3])).toBe(false)
        expect(result.current.selectedCount).toBe(0)
    })

    it('clearSelection resets everything', () => {
        const { result } = renderHook(() => useSelection())

        act(() => {
            result.current.toggleSelection(1)
            result.current.toggleSelection(2)
        })
        expect(result.current.selectedCount).toBe(2)

        act(() => result.current.clearSelection())
        expect(result.current.selectedCount).toBe(0)
    })

    it('isAllSelected returns false for empty list', () => {
        const { result } = renderHook(() => useSelection())
        expect(result.current.isAllSelected([])).toBe(false)
    })

    it('tracks multiple items independently', () => {
        const { result } = renderHook(() => useSelection())

        act(() => {
            result.current.toggleSelection(10)
            result.current.toggleSelection(20)
        })

        expect(result.current.isSelected(10)).toBe(true)
        expect(result.current.isSelected(20)).toBe(true)
        expect(result.current.isSelected(30)).toBe(false)
        expect(result.current.selectedCount).toBe(2)
    })
})

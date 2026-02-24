import { useState, useCallback, useMemo } from 'react'

/**
 * Public interface returned by `useSelection`.
 * Encapsulates all selection logic in one place.
 */
interface UseSelectionReturn {
  /** Set of currently selected IDs */
  selectedIds: Set<number>

  /** Check if a given ID is selected */
  isSelected: (id: number) => boolean

  /** Toggle selection state of a given ID */
  toggleSelection: (id: number) => void

  /** Select all IDs, or deselect all if all are already selected */
  selectAll: (ids: number[]) => void

  /** Clear all selections */
  clearSelection: () => void

  /** Check if all given IDs are selected */
  isAllSelected: (ids: number[]) => boolean

  /** Total count of currently selected IDs */
  selectedCount: number
}

/**
 * useSelection
 *
 * Custom hook to manage selection of multiple items.
 * 
 * Features:
 * - Works with numeric IDs
 * - Efficient immutable updates using Set
 * - Can handle toggling, select all/deselect all, clearing
 * - Memoized callbacks for stable references in React components
 */
export function useSelection(): UseSelectionReturn {

    /** Main state: stores selected IDs as a Set for O(1) lookups */
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

    /**
     * Checks if an ID is currently selected.
     * Memoized to prevent unnecessary re-renders in child components.
     */
    const isSelected = useCallback(
        (id: number) => selectedIds.has(id),
        [selectedIds]
    )

    /**
     * Toggle selection state of a single ID.
     * - Adds the ID if not present
     * - Removes it if already selected
     * Uses a new Set to maintain immutability for React state.
     */
    const toggleSelection = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    /**
     * Selects all given IDs, or deselects all if all are already selected.
     * Useful for "Select All" checkboxes.
     */
    const selectAll = useCallback((ids: number[]) => {
        setSelectedIds(prev => {
            const allSelected = ids.every(id => prev.has(id))
            const next = new Set(prev)
            if (allSelected) {
                // Deselect all
                ids.forEach(id => next.delete(id))
            } else {
                // Add all
                ids.forEach(id => next.add(id))
            }
            return next
        })
    }, [])

    /**
     * Clears all selections.
     */
    const clearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    /**
     * Checks if all given IDs are selected.
     * Returns false if the list is empty.
     */
    const isAllSelected = useCallback(
        (ids: number[]) => ids.length > 0 && ids.every(id => selectedIds.has(id)),
        [selectedIds]
    )

    /**
     * Memoized count of selected IDs.
     * Prevents unnecessary recalculation during renders.
     */
    const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

    return {
        selectedIds,
        isSelected,
        toggleSelection,
        selectAll,
        clearSelection,
        isAllSelected,
        selectedCount,
    }
}
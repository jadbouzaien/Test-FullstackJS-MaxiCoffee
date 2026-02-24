import { useState, useCallback, useMemo } from 'react'

interface UseSelectionReturn {
  selectedIds: Set<number>;
  isSelected: (id: number) => boolean;
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  isAllSelected: (ids: number[]) => boolean;
  selectedCount: number;
}

export function useSelection(): UseSelectionReturn {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

    const isSelected = useCallback(
        (id: number) => selectedIds.has(id),
        [selectedIds]
    )

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

    const selectAll = useCallback((ids: number[]) => {
        setSelectedIds(prev => {
            const allSelected = ids.every(id => prev.has(id))
            if (allSelected) {
                const next = new Set(prev)
                ids.forEach(id => next.delete(id))
                return next
            } else {
                const next = new Set(prev)
                ids.forEach(id => next.add(id))
                return next
            }
        })
    }, [])

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const isAllSelected = useCallback(
        (ids: number[]) => ids.length > 0 && ids.every(id => selectedIds.has(id)),
        [selectedIds]
    )

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

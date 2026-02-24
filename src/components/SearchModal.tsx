import './SearchModal.css'
import { UserCard } from './UserCard'
import { useGitHubSearch } from '../hooks/useGithubSearch'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useSelection } from '../hooks/useSelection'
import type { User } from '../types/user'

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SearchModal
 *
 * Responsibilities:
 * - Orchestrates GitHub search
 * - Manages edit mode & local card mutations (duplicate/delete)
 * - Handles infinite scroll
 * - Controls selection state via useSelection hook
 *
 * Note:
 * Search results come from the API,
 * but duplicated/deleted cards are handled locally.
 */
export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {

    // Encapsulates API fetching, pagination & loading state
    const { state, onQueryChange, loadNextPage } = useGitHubSearch()

    // Encapsulates multi-select logic (keeps component cleaner)
    const {
        selectedIds,
        isSelected,
        toggleSelection,
        selectAll,
        clearSelection,
        isAllSelected,
        selectedCount,
    } = useSelection()

    // Used to auto-focus input when modal opens
    const inputRef = useRef<HTMLInputElement>(null)

    // Used for infinite scroll detection
    const bodyRef = useRef<HTMLDivElement>(null)

    // Edit mode enables selection UI & bulk actions
    const [isEditMode, setIsEditMode] = useState<boolean>(false)

    /**
     * Local card state.
     * We copy API results into local state to allow:
     * - Deleting cards locally
     * - Duplicating cards
     *
     * This intentionally diverges from server truth.
     */
    const [cards, setCards] = useState<User[]>([])

    /**
     * When modal opens:
     * - Focus search input
     *
     * When modal closes:
     * - Reset query
     * - Exit edit mode
     * - Clear selection
     *
     * We intentionally reset everything to ensure modal
     * always opens in a clean state.
     */
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            onQueryChange('')
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsEditMode(false)
            clearSelection()
        }
    }, [clearSelection, isOpen, onQueryChange])

    /**
     * Whenever query changes:
     * - Clear selection
     *
     * Prevents selection leaking between searches.
     */
    useEffect(() => {
        clearSelection()
    }, [clearSelection, state.query])

    /**
     * Infinite scroll handler.
     *
     * Triggers next page load when user scrolls near bottom.
     * Uses 100px threshold for smoother UX.
     */
    const handleScroll = useCallback(() => {
        const el = bodyRef.current
        if (!el || state.isLoading) return

        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 100

        if (nearBottom) {
            loadNextPage()
        }
    }, [loadNextPage, state.isLoading])

    /**
     * Attach scroll listener to modal body.
     * Cleaned up on unmount or handler change.
     */
    useEffect(() => {
        const el = bodyRef.current
        if (!el) return

        el.addEventListener('scroll', handleScroll)
        return () => el.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    /**
     * Sync API results into local editable state.
     *
     * We intentionally mirror results instead of using
     * state.results directly to support local mutations.
     */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCards(state.results)
    }, [state.results])

    const cardIds = cards.map(c => c.id)

    /**
     * Duplicate selected cards.
     *
     * Strategy:
     * - Copy selected cards
     * - Generate synthetic ID (to avoid collision)
     * - Insert duplicates after the last selected card
     *
     * This preserves visual ordering and improves UX clarity.
     */
    const handleDuplicate = () => {
        if (selectedIds.size === 0) return

        const toDuplicate = cards.filter(c => selectedIds.has(c.id))

        const now = new Date()
        const suffix = now.getMinutes() * 100 + now.getSeconds()

        const duplicated: User[] = toDuplicate.map(c => ({
            ...c,
            // Create pseudo-unique id to prevent React key collision
            id: c.id * 10000 + suffix,
        }))

        const lastSelectedIndex = cards.reduce((lastIdx, c, idx) => {
            return selectedIds.has(c.id) ? idx : lastIdx
        }, -1)

        setCards(prev => [
            ...prev.slice(0, lastSelectedIndex + 1),
            ...duplicated,
            ...prev.slice(lastSelectedIndex + 1),
        ])

        clearSelection()
    }

    /**
     * Delete selected cards from local state.
     * Does not affect server data.
     */
    const handleDelete = () => {
        if (selectedIds.size === 0) return

        setCards(prev => prev.filter(c => !selectedIds.has(c.id)))
        clearSelection()
    }

    // Do not render anything when modal is closed
    if (!isOpen) return null

    return (
        <>
            {/* Overlay closes modal when clicked */}
            <div
                className="modal-overlay"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label="GitHub User Search"
            >
                {/* Search Input Row */}
                <div className="modal__search-row">
                    <div className="modal__search-icon">
                        {/* Purely decorative icon */}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Controlled input bound to search state */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="modal__search-input"
                        placeholder="Search GitHub users…"
                        value={state.query}
                        onChange={(e) => onQueryChange(e.target.value)}
                    />

                    {/* Edit mode only makes sense when cards exist */}
                    {cards.length > 0 && (
                        <button
                            className={`modal__edit-btn ${
                                isEditMode ? 'modal__edit-btn--active' : ''
                            }`}
                            onClick={() => setIsEditMode(m => !m)}
                            aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
                            title={isEditMode ? 'Exit edit mode' : 'Edit'}
                        >
                            {/* Icon switches depending on mode */}
                            {isEditMode ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M2 2L12 12M12 2L2 12"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M2 10.5V12H3.5L10.5 5L9 3.5L2 10.5Z"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M9 3.5L10.5 5L11.5 4L10 2.5L9 3.5Z"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                {/* Bulk action toolbar (visible only in edit mode) */}
                {isEditMode && cards.length > 0 && (
                    <div className="modal__toolbar">
                        <div className="modal__toolbar-left">
                            {/* Select all checkbox delegates logic to selection hook */}
                            <label
                                className="modal__select-all"
                                aria-label="Select all"
                            >
                                <input
                                    type="checkbox"
                                    checked={isAllSelected(cardIds)}
                                    onChange={() => selectAll(cardIds)}
                                />
                                <span className="modal__select-all-box" />
                                <span className="modal__select-all-label">
                                    {selectedCount > 0
                                        ? `${selectedCount} selected`
                                        : 'Select all'}
                                </span>
                            </label>
                        </div>

                        <div className="modal__toolbar-right">
                            {/* Duplicate action */}
                            <button
                                className="modal__action-btn modal__action-btn--duplicate"
                                onClick={handleDuplicate}
                                disabled={selectedCount === 0}
                                title="Duplicate selected"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <rect
                                        x="1"
                                        y="4"
                                        width="8"
                                        height="9"
                                        rx="1.5"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                    />
                                    <path
                                        d="M4.5 4V2.5a1 1 0 011-1H12a1 1 0 011 1v7a1 1 0 01-1 1H9.5"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>

                            {/* Delete action */}
                            <button
                                className="modal__action-btn modal__action-btn--delete"
                                onClick={handleDelete}
                                disabled={selectedCount === 0}
                                title="Delete selected"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M11 3.5l-.7 8a1 1 0 01-1 .9H4.7a1 1 0 01-1-.9L3 3.5"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Result count shown only when query exists */}
                {state.totalCount > 0 && state.query && (
                    <div className="modal__count">
                        {cards.length.toLocaleString()} /{' '}
                        {state.totalCount.toLocaleString()} users
                    </div>
                )}

                {/* Scroll container (used for infinite scroll detection) */}
                <div className="modal__body" ref={bodyRef}>

                    {/* Initial empty state */}
                    {!state.query && (
                        <div className="modal__placeholder">
                            <p>Start typing to search GitHub users</p>
                        </div>
                    )}

                    {/* Error state */}
                    {state.error && (
                        <div className="modal__error">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="9" stroke="#f87171" strokeWidth="1.5" />
                                <path
                                    d="M10 6v5M10 14h.01"
                                    stroke="#f87171"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span>{state.error}</span>
                        </div>
                    )}

                    {/* No results state */}
                    {!state.isLoading &&
                        !state.error &&
                        state.query &&
                        cards.length === 0 && (
                        <div className="modal__empty">
                            <p>
                                    No users found for{' '}
                                <strong>"{state.query}"</strong>
                            </p>
                        </div>
                    )}

                    {/* Results grid */}
                    {cards.length > 0 && (
                        <div className="modal__cards">
                            {cards.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    isSelected={isSelected(user.id)}
                                    isEditMode={isEditMode}
                                    onToggleSelect={toggleSelection}
                                />
                            ))}
                        </div>
                    )}

                    {/* Loading spinner (used for both initial load & pagination) */}
                    {state.isLoading && (
                        <div
                            className="modal__spinner"
                            aria-label="Loading"
                        />
                    )}
                </div>
            </div>
        </>
    )
}
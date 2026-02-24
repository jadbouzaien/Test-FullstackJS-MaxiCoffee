import { memo } from 'react'
import './UserCard.css'
import type { User } from '../types/user'

/**
 * Props contract for UserCard component.
 *
 * - user: data model representing a GitHub user
 * - isSelected: controlled selection state (derived from parent)
 * - isEditMode: determines whether selection UI is visible
 * - onToggleSelect: callback delegated to parent for state management
 *
 * Note: This component is intentionally "dumb" (presentational).
 * It does not own selection state — it delegates state control upward.
 */
interface UserCardProps {
  user: User
  isSelected: boolean
  isEditMode: boolean
  onToggleSelect: (id: number) => void
}

/**
 * UserCard
 *
 * A memoized presentational component that renders:
 * - Optional selection checkbox (edit mode only)
 * - User avatar
 * - ID + login
 * - External profile link
 *
 * Wrapped in React.memo to prevent unnecessary re-renders
 * when props are referentially stable.
 */
export const UserCard = memo(
    ({ user, isSelected, isEditMode, onToggleSelect }: UserCardProps) => {

        /**
         * Handles checkbox state change.
         * Delegates selection logic to parent component.
         *
         * We avoid inline arrow functions in JSX
         * to keep render output cleaner and potentially
         * reduce unnecessary re-creations.
        */
        const handleToggle = () => {
            onToggleSelect(user.id)
        }

        return (
            <div className="user-card">
                {/* 
                    Selection UI.
                    Rendered only when edit mode is enabled.
                    Controlled checkbox ensures single source of truth.
                */}
                {isEditMode && (
                    <label className="user-card__checkbox-wrapper">
                        <input
                            type="checkbox"
                            className="user-card__checkbox"
                            checked={isSelected}   // controlled input
                            onChange={handleToggle}
                            aria-label={`Select ${user.login}`} // accessibility label
                        />
                        {/* Custom visual checkbox replacement */}
                        <span className="user-card__checkbox-custom" />
                    </label>
                )}

                {/* 
                    User avatar.
                    - loading="lazy" improves performance in large lists
                    - alt text ensures accessibility compliance
                */}
                <img
                    src={user.avatar_url}
                    alt={`${user.login}'s avatar`}
                    loading="lazy"
                    className="user-card__avatar"
                />

                {/* User meta information */}
                <div className="user-card__info">
                    {/* Displayed as mono-styled identifier */}
                    <span className="user-card__id">#{user.id}</span>

                    {/* Truncated username (CSS handles overflow) */}
                    <span className="user-card__login">{user.login}</span>
                </div>

                {/* 
                    External profile link.
                    - Opens in new tab
                    - rel="noopener noreferrer" prevents reverse tabnabbing
                */}
                <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-card__btn"
                >
          VIEW PROFILE
                </a>
            </div>
        )
    }
)
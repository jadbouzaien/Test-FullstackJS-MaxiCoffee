import './UserCard.css'
import type { User } from '../types/user'

interface UserCardProps {
    user: User;
    isSelected: boolean;
    isEditMode: boolean;
    onToggleSelect: (id: number) => void;
}

export const UserCard = ({user, isSelected, isEditMode, onToggleSelect} : UserCardProps) => {
    console.log('Rendering UserCard for', user.login)
    console.log('isSelected:', isSelected, 'isEditMode:', isEditMode)
    return (
        <div className="user-card">
            {isEditMode && (
                <label className="user-card__checkbox-wrapper" aria-label={`Select ${user.login}`}>
                    <input
                        type="checkbox"
                        className="user-card__checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(user.id)}
                    />
                    <span className="user-card__checkbox-custom" />
                </label>
            )}
            <div>
                <img src={user.avatar_url} alt={`${user.login}'s avatar`} loading="lazy" className="user-card__avatar"/>
            </div>
            <div className="user-card__info">
                <span className="user-card__id">#{user.id}</span>
                <span className="user-card__login">{user.login}</span>
            </div>
            <a
                href={user.html_url}
                target="_blank"
                className="user-card__btn"
            >
                VIEW PROFILE
            </a>
        </div>
    )
}
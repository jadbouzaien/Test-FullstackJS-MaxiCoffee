import "./UserCard.css";
import type { User } from "../types/user";

interface UserCardProps {
    user: User;
    //isSelected: boolean;
    //isEditMode: boolean;
    //onToggleSelect: () => void;
}

export const UserCard = ({user} : UserCardProps) => {
    return (
        <div className="user-card">
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
    );
};
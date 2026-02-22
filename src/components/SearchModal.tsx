import "./SearchModal.css";
import { users } from "../data/users";
import { UserCard } from "./UserCard";
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const SearchModal = (props: SearchModalProps) => {
  if (!props.isOpen) return null;
  return (
    <>
      <div
        className="modal-overlay"
        onClick={props.onClose}
        aria-hidden="true"
      />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="GitHub User Search"
      >
        <div className="modal__search-row">
          <div className="modal__search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10 10L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <input
            //ref={inputRef}
            type="text"
            className="modal__search-input"
            placeholder="Search GitHub users…"
            //value={state.query}
            //onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <div className="modal__cards">
            { users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
      </div>
    </>
  );
};

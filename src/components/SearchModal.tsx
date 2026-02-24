import "./SearchModal.css";
import { UserCard } from "./UserCard";
import { useGitHubSearch } from "../hooks/useGithubSearch";
import { useEffect, useRef, useCallback } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const { state, onQueryChange, loadNextPage } = useGitHubSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      onQueryChange('');
    }
  }, [isOpen, onQueryChange]);

  const handleScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el || state.isLoading) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
    if (nearBottom) {
      loadNextPage();
    }
  }, [loadNextPage, state.isLoading]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (!isOpen) return null;

  const allLoaded = state.results.length >= state.totalCount && state.totalCount > 0;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="GitHub User Search"
      >
        <div className="modal__search-row">
          <div className="modal__search-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="modal__search-input"
            placeholder="Search GitHub users…"
            value={state.query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        {state.totalCount > 0 && state.query && (
          <div className="modal__count">
            {state.results.length.toLocaleString()} / {state.totalCount.toLocaleString()} users
          </div>
        )}

        <div className="modal__body" ref={bodyRef}>
          {!state.query && (
            <div className="modal__placeholder">
              <p>Start typing to search GitHub users</p>
            </div>
          )}

          {state.error && (
            <div className="modal__error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#f87171" strokeWidth="1.5" />
                <path d="M10 6v5M10 14h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          {!state.isLoading && !state.error && state.query && state.results.length === 0 && (
            <div className="modal__empty">
              <p>No users found for <strong>"{state.query}"</strong></p>
            </div>
          )}

          {state.results.length > 0 && (
            <div className="modal__cards">
              {state.results.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}

          {state.isLoading && (
            <div className="modal__spinner" aria-label="Loading" />
          )}

          {allLoaded && (
            <div className="modal__end">
              All {state.totalCount.toLocaleString()} users loaded
            </div>
          )}
        </div>
      </div>
    </>
  );
};
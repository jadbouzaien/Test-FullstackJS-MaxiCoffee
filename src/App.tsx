import { useState } from 'react'
import './App.css'
import { SearchModal } from './components/SearchModal'

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        <div className={`app ${isModalOpen ? 'is-searching' : ''}`}>
            <div className="app__logo">
                <div className="app__logo-image">
                    <svg width="80" height="80" viewBox="0 0 20 20" fill="none">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844a9.554 9.554 0 012.504.338c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10C20 4.477 15.523 0 10 0z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <span className="app__logo-text">GitSearch</span>
            </div>
            <button
                className="app__search-btn"
                onClick={() => setIsModalOpen(true)}
            >
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
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
        Github search
            </button>
            <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export default App

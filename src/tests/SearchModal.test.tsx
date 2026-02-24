import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchModal } from '../components/SearchModal'

const mockUsers = [
    { id: 1, login: 'alice', avatar_url: 'https://avatars.githubusercontent.com/u/1', html_url: 'https://github.com/alice', type: 'User', score: 1 },
    { id: 2, login: 'bob', avatar_url: 'https://avatars.githubusercontent.com/u/2', html_url: 'https://github.com/bob', type: 'User', score: 0.9 },
]

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
})

function mockFetchSuccess(items = mockUsers) {
    vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ total_count: items.length, incomplete_results: false, items }),
        headers: new Headers(),
    } as Response)
}

describe('SearchModal', () => {
    it('renders when isOpen is true', () => {
        render(<SearchModal isOpen={true} onClose={() => {}} />)
        expect(screen.getByPlaceholderText(/search github users/i)).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
        render(<SearchModal isOpen={false} onClose={() => {}} />)
        expect(screen.queryByPlaceholderText(/search github users/i)).not.toBeInTheDocument()
    })

    it('calls onClose when overlay is clicked', () => {
        const onClose = vi.fn()
        render(<SearchModal isOpen={true} onClose={onClose} />)
        const overlay = document.querySelector('.modal-overlay')
        fireEvent.click(overlay!)
        expect(onClose).toHaveBeenCalled()
    })

    it('shows loading spinner while fetching', async () => {
        vi.mocked(fetch).mockReturnValue(new Promise(() => {}))

        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
        render(<SearchModal isOpen={true} onClose={() => {}} />)

        const input = screen.getByPlaceholderText(/search github users/i)
        await user.type(input, 'test')

        await vi.advanceTimersByTimeAsync(500)

        expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
    })

    it('shows user cards after successful search', async () => {
        mockFetchSuccess()
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
        render(<SearchModal isOpen={true} onClose={() => {}} />)

        const input = screen.getByPlaceholderText(/search github users/i)
        await user.type(input, 'alice')

        await vi.advanceTimersByTimeAsync(500)
        await waitFor(() => expect(screen.getByText('alice')).toBeInTheDocument())
        expect(screen.getByText('bob')).toBeInTheDocument()
    })

    it('shows "No users found" when results are empty', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ total_count: 0, incomplete_results: false, items: [] }),
            headers: new Headers(),
        } as Response)

        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
        render(<SearchModal isOpen={true} onClose={() => {}} />)

        const input = screen.getByPlaceholderText(/search github users/i)
        await user.type(input, 'xyznonexistent')

        await vi.advanceTimersByTimeAsync(500)
        await waitFor(() => expect(screen.getByText(/no users found/i)).toBeInTheDocument())
    })

    it('shows rate limit error message', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            headers: new Headers({ 'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600) }),
        } as Response)

        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
        render(<SearchModal isOpen={true} onClose={() => {}} />)

        const input = screen.getByPlaceholderText(/search github users/i)
        await user.type(input, 'test')

        await vi.advanceTimersByTimeAsync(500)
        await waitFor(() => expect(screen.getByText(/rate limit/i)).toBeInTheDocument())
    })

    it('edit mode toggles checkboxes visibility', async () => {
        mockFetchSuccess()
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
        render(<SearchModal isOpen={true} onClose={() => {}} />)

        const input = screen.getByPlaceholderText(/search github users/i)
        await user.type(input, 'alice')
        await vi.advanceTimersByTimeAsync(500)
        await waitFor(() => screen.getByText('alice'))

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

        const editBtn = screen.getByLabelText(/enter edit mode/i)
        await user.click(editBtn)

        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
    })
})

import type { User } from './user'

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: User[];
}

export interface SearchState {
  query: string;
  results: User[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}
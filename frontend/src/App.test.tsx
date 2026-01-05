import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./services/apiService', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('./services/authService', () => ({
  __esModule: true,
  default: {
    isAuthenticated: () => false,
    isTokenExpiringSoon: () => false,
    getTokenExpiry: () => null,
    getToken: () => null,
    getTimeUntilExpiry: () => 0,
    setToken: vi.fn(),
    clearAuth: vi.fn(),
    getAuthHeader: () => ({}),
  },
}));

describe('App', () => {
  it('renders the login screen when not authenticated', () => {
    render(<App />);

    expect(screen.getByText(/please sign in to continue/i)).toBeInTheDocument();
  });
});

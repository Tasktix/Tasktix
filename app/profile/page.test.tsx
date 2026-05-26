/**
 * Tasktix: A powerful and flexible task-tracking tool for all.
 * Copyright (C) 2025 Nate Baird & other Tasktix contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import { redirect } from 'next/navigation';

import { getUser } from '@/lib/session';
import User from '@/lib/model/user';
import { useAuth } from '@/components/AuthProvider';

import Page from './page';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn()
  }))
}));

vi.mock('@/lib/session', () => ({
  getUser: vi.fn()
}));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: vi.fn()
}));

const MOCK_USER = new User(
  'userid',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(useAuth).mockReturnValue({
    authConfig: {
      localEnabled: true,
      githubEnabled: false,
      customEnabled: false
    },
    loggedInUser: MOCK_USER,
    setLoggedInUser: vi.fn()
  });
});

describe('Redirects for [un]authenticated users', () => {
  it('renders profile page for authenticated users', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    const resolvedPage = await Page();
    const { getByRole } = render(
      <HeroUIProvider disableRipple>{resolvedPage}</HeroUIProvider>
    );

    expect(getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to /signIn', async () => {
    vi.mocked(getUser).mockResolvedValue(false);

    await Page();

    expect(redirect).toHaveBeenCalledWith('/signIn');
  });
});

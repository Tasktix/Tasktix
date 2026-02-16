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

import { fireEvent, screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroUIProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { SuccessContext } from 'better-auth/react';

import User from '@/lib/model/user';
import Body from '@/app/body';
import { authClient } from '@/lib/auth-client';
import AuthProvider, { useAuth } from '@/components/AuthProvider';

vi.mock(import('framer-motion'), async importOriginal => ({
  ...(await importOriginal()),
  LazyMotion: ({ children }) => <div>{children}</div>
}));

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));

vi.mock('@/components/AuthProvider', async importOriginal => ({
  ...(await importOriginal()),
  useAuth: vi.fn()
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn()
  }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Body', () => {
  it('links logo to /list when logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: new User(
        'userid',
        'username',
        'email@example.com',
        false,
        new Date(),
        new Date(),
        'Amber'
      ),
      setLoggedInUser: vi.fn()
    });

    const { getByRole } = render(
      <HeroUIProvider disableRipple>
        <Body>
          <div>child</div>
        </Body>
      </HeroUIProvider>
    );

    const logoImg = getByRole('img', { name: 'Tasktix' });
    const link = logoImg.closest('a');

    expect(link).not.toBeNull();
    expect(link as HTMLElement).toBeVisible();
    expect(link).toHaveAttribute('href', '/list');
  });

  it('links logo to /about when logged out', () => {
    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: false,
      setLoggedInUser: vi.fn()
    });

    const { getByRole } = render(
      <HeroUIProvider disableRipple>
        <Body>
          <div>child</div>
        </Body>
      </HeroUIProvider>
    );

    const logoImg = getByRole('img', { name: 'Tasktix' });
    const link = logoImg.closest('a');

    expect(link).not.toBeNull();
    expect(link as HTMLElement).toBeVisible();
    expect(link).toHaveAttribute('href', '/about');
  });

  test('Profile Icon Populates Correctly', () => {
    const oldUser = new User(
      '1234',
      'oldUsername',
      'test@gmail.com',
      false,
      '1/1/2000' as unknown as Date,
      '1/1/2000' as unknown as Date,
      'Pink'
    );

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: oldUser,
      setLoggedInUser: vi.fn()
    });

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider loggedInUserAtStart={oldUser}>
          <Body>contents...</Body>
        </AuthProvider>
      </HeroUIProvider>
    );

    const avatar = getByLabelText('Profile Actions Dropdown');

    expect(avatar).toHaveClass('bg-pink-500');
  });
});

describe('Sign Out Process', () => {
  test('Removes User Session on Logout', async () => {
    const mock_user = new User(
      'userid',
      'username',
      'email@example.com',
      false,
      new Date(),
      new Date(),
      'Amber'
    );
    const setLoggedInUserMock = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: mock_user,
      setLoggedInUser: setLoggedInUserMock
    });

    const routerMock = {
      push: vi.fn()
    } as unknown as AppRouterInstance;

    vi.mocked(useRouter).mockReturnValue(routerMock);

    /* eslint-disable */
    vi.mocked(authClient.signOut).mockImplementation(async options => {
      options!.fetchOptions!.onSuccess!({} as SuccessContext);

      return { user: null, session: null };
    });

    /* eslint-enable */
    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider loggedInUserAtStart={mock_user}>
          <Body>contents...</Body>
        </AuthProvider>
      </HeroUIProvider>
    );

    const avatar = getByLabelText('Profile Actions Dropdown');

    fireEvent.click(avatar);

    const signOut = screen.getByText('Log Out');

    fireEvent.click(signOut);

    await vi.waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalled();
    });

    expect(setLoggedInUserMock).toHaveBeenCalledWith(false);
    // eslint-disable-next-line
    expect(routerMock.push).toHaveBeenCalledWith('/');
  });
});

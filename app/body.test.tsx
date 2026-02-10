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
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import User from '@/lib/model/user';
import { HeroUIProvider } from '@heroui/react';

import Body from '@/app/body';
import { useAuth } from '@/components/AuthProvider/authHook';
import { NamedColor } from '@/lib/model/color';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

vi.mock('@/components/AuthProvider/authHook', () => ({
  useAuth: vi.fn()
}));

const router = {
  replace: vi.fn(),
  push: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
};

vi.mock('next/navigation', () => ({
  useRouter: () => router
}));

vi.mock('@heroui/react', async () => {
  const actual =
    await vi.importActual<typeof import('@heroui/react')>('@heroui/react');

  return {
    ...actual,
    ToastProvider: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid='toast-provider'>{children}</div>
    )
  };
});

vi.mock('@/components/ThemeSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid='theme-switcher' />
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<HeroUIProvider disableRipple>{ui}</HeroUIProvider>);
}

describe('Body', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links logo to /list when logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: new User(
       'username',
       'email@example.com',
       'password',
       new Date(),
       new Date(),
      {}
      ),
      setLoggedInUser: vi.fn()
    });

    renderWithProvider(
      <Body>
        <div>child</div>
      </Body>
    );

    const logoImg = screen.getByRole('img', { name: 'Tasktix' });
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

    renderWithProvider(
      <Body>
        <div>child</div>
      </Body>
    );

    const logoImg = screen.getByRole('img', { name: 'Tasktix' });
    const link = logoImg.closest('a');

    expect(link).not.toBeNull();
    expect(link as HTMLElement).toBeVisible();
    expect(link).toHaveAttribute('href', '/about');
  });
 


vi.mock(import('framer-motion'), async importOriginal => {
  const originalFramerMotion = await importOriginal();

  return {
    ...originalFramerMotion,
    LazyMotion: ({ children }) => <div>{children}</div>
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Profile Icon Populates Correctly', () => {
  const oldUser = {
    id: '1234',
    username: 'oldUsername',
    email: 'test@gmail.com',
    password: 'password',
    color: 'Pink' as NamedColor,
    dateCreated: '1/1/2000' as unknown as Date,
    dateSignedIn: '1/1/2000' as unknown as Date
  };

  vi.mocked(useAuth).mockReturnValue({
    loggedInUser: oldUser,
    setLoggedInUser: vi.fn()
  });

  const { getByLabelText } = render(
    <HeroUIProvider disableRipple>
      <AuthProvider loggedInUserAtStart={oldUser}>
        <Body children={undefined} />
      </AuthProvider>
    </HeroUIProvider>
  );

  const avatar = getByLabelText('Profile Actions Dropdown');

  expect(avatar).toHaveClass('bg-pink-500');
});
});

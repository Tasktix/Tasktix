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
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';

import Body from '@/app/body';
import { useAuth } from '@/components/AuthProvider';

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');

  return {
    ...actual,
    ToastProvider: () => <div data-testid='toast-provider' />
  };
});

jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt?: string; src?: string }) => (
    <span aria-label={alt} data-src={String(src ?? '')} role='img' />
  )
}));

jest.mock('@/components/ThemeSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid='theme-switcher' />
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<HeroUIProvider disableRipple>{ui}</HeroUIProvider>);
}

describe('Body', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('links logo to /list when logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      setIsLoggedIn: jest.fn()
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
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
      setIsLoggedIn: jest.fn()
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
});

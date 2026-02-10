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

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroUIProvider } from '@heroui/react';

import User from '@/lib/model/user';
import Body from '@/app/body';
import AuthProvider, { useAuth } from '@/components/AuthProvider';
import { NamedColor } from '@/lib/model/color';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

vi.mock(import('framer-motion'), async importOriginal => ({
  ...(await importOriginal()),
  LazyMotion: ({ children }) => <div>{children}</div>
}));

vi.mock('@/components/AuthProvider', async importOriginal => ({
  ...(await importOriginal()),
  useAuth: vi.fn()
}));

beforeEach(() => {
  vi.resetAllMocks();
});

function renderWithProvider(ui: React.ReactElement) {
  return render(<HeroUIProvider disableRipple>{ui}</HeroUIProvider>);
}

describe('Body', () => {
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
          <Body>contents...</Body>
        </AuthProvider>
      </HeroUIProvider>
    );

    const avatar = getByLabelText('Profile Actions Dropdown');

    expect(avatar).toHaveClass('bg-pink-500');
  });
});

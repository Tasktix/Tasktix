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

import { HeroUIProvider } from '@heroui/react';
import { fireEvent, render } from '@testing-library/react';

import '@testing-library/jest-dom';
import SignIn from '@/app/signIn/components/SignIn';
import { useAuth } from '@/components/AuthProvider';

import { handleOauth } from '../oauth';

vi.mock('@/components/AuthProvider', async importOriginal => ({
  ...(await importOriginal()),
  useAuth: vi.fn()
}));

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));

vi.mock('../oauth');

test('Pressing Github Button attempts Oauth Login', () => {
  vi.mocked(useAuth).mockReturnValue({
    loggedInUser: false,
    setLoggedInUser: vi.fn()
  });
  const { getByLabelText } = render(
    <HeroUIProvider disableRipple>
      <SignIn />
    </HeroUIProvider>
  );

  const githubButton = getByLabelText('sign in with github');

  expect(githubButton).toHaveTextContent('Continue with Github');

  fireEvent.click(githubButton);

  expect(handleOauth).toHaveBeenCalled();
});

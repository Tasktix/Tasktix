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
import AuthProvider from '@/components/AuthProvider';

import { handleOAuth } from '../oauth';

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));

vi.mock('../oauth');

test('Pressing Github Button attempts OAuth Login', () => {
  const { getByLabelText } = render(
    <HeroUIProvider disableRipple>
      <AuthProvider
        loggedInUserAtStart={false}
        oauthConfig={{
          githubEnabled: true,
          customEnabled: false
        }}
      >
        <SignIn />
      </AuthProvider>
    </HeroUIProvider>
  );

  const githubButton = getByLabelText('sign in with github');

  expect(githubButton).toBeVisible();

  fireEvent.click(githubButton);

  expect(handleOAuth).toHaveBeenCalled();
});

test('Pressing custom SSO Button attempts OAuth Login', () => {
  const { getByLabelText } = render(
    <HeroUIProvider disableRipple>
      <AuthProvider
        loggedInUserAtStart={false}
        oauthConfig={{
          githubEnabled: false,
          customEnabled: true,
          customProviderId: 'SSO'
        }}
      >
        <SignIn />
      </AuthProvider>
    </HeroUIProvider>
  );

  const ssoButton = getByLabelText('sign in with SSO');

  expect(ssoButton).toBeVisible();

  fireEvent.click(ssoButton);

  expect(handleOAuth).toHaveBeenCalled();
});

test('GitHub login not rendered if not configured on server ', () => {
  const { getByText, queryByLabelText } = render(
    <HeroUIProvider disableRipple>
      <AuthProvider
        loggedInUserAtStart={false}
        oauthConfig={{
          githubEnabled: false,
          customEnabled: true,
          customProviderId: 'SSO'
        }}
      >
        <SignIn />
      </AuthProvider>
    </HeroUIProvider>
  );

  const divider = getByText('OR');
  const githubButton = queryByLabelText('sign in with github');

  expect(divider).toBeInTheDocument();
  expect(githubButton).not.toBeInTheDocument();
});

test('Custom SSO login not rendered if not configured on server ', () => {
  const { getByText, queryByLabelText } = render(
    <HeroUIProvider disableRipple>
      <AuthProvider
        loggedInUserAtStart={false}
        oauthConfig={{
          githubEnabled: true,
          customEnabled: false
        }}
      >
        <SignIn />
      </AuthProvider>
    </HeroUIProvider>
  );

  const divider = getByText('OR');
  const ssoButton = queryByLabelText('sign in with SSO');

  expect(divider).toBeInTheDocument();
  expect(ssoButton).not.toBeInTheDocument();
});

test('Nothing rendered if all not configured on server ', () => {
  const { queryByText, queryByLabelText } = render(
    <HeroUIProvider disableRipple>
      <AuthProvider
        loggedInUserAtStart={false}
        oauthConfig={{
          githubEnabled: false,
          customEnabled: false
        }}
      >
        <SignIn />
      </AuthProvider>
    </HeroUIProvider>
  );

  const divider = queryByText('OR');
  const githubButton = queryByLabelText('sign in with github');
  const ssoButton = queryByLabelText('sign in with SSO');

  expect(divider).not.toBeInTheDocument();
  expect(githubButton).not.toBeInTheDocument();
  expect(ssoButton).not.toBeInTheDocument();
});

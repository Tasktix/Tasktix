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
import AuthProvider from '@/components/AuthProvider';

import { handleOAuth } from './oauth';
import Page from './page';

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));

vi.mock('./oauth');

beforeAll(() => {
  // Needed for <Tabs> component
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe;
      unobserve;
      disconnect;

      constructor() {
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = vi.fn();
      }
    }
  );
});
beforeEach(vi.resetAllMocks);
afterAll(vi.unstubAllGlobals);

describe('0 providers', () => {
  test('Only error rendered if all not configured on server ', () => {
    const { getByText, queryByText, queryByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider
          authConfig={{
            localEnabled: false,
            githubEnabled: false,
            customEnabled: false
          }}
          loggedInUserAtStart={false}
        >
          <Page />
        </AuthProvider>
      </HeroUIProvider>
    );

    const error = getByText('No authentication providers configured');

    const signInButton = queryByText('sign in');
    const divider = queryByText('OR');
    const githubButton = queryByLabelText('sign in with github');
    const ssoButton = queryByLabelText('sign in with SSO');

    expect(error).toBeVisible();
    expect(signInButton).not.toBeInTheDocument();
    expect(divider).not.toBeInTheDocument();
    expect(githubButton).not.toBeInTheDocument();
    expect(ssoButton).not.toBeInTheDocument();
  });
});

describe('1 provider', () => {
  test('Automatically redirects to GitHub if only configured provider', () => {
    const { getByText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider
          authConfig={{
            localEnabled: false,
            githubEnabled: true,
            customEnabled: false
          }}
          loggedInUserAtStart={false}
        >
          <Page />
        </AuthProvider>
      </HeroUIProvider>
    );

    expect(getByText('Redirecting for SSO sign in...')).toBeVisible();

    expect(handleOAuth).toHaveBeenCalled();
  });

  test('Automatically redirects to custom SSO if only configured provider', () => {
    const { getByText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider
          authConfig={{
            localEnabled: false,
            githubEnabled: false,
            customEnabled: true,
            customProviderId: 'SSO'
          }}
          loggedInUserAtStart={false}
        >
          <Page />
        </AuthProvider>
      </HeroUIProvider>
    );

    expect(getByText('Redirecting for SSO sign in...')).toBeVisible();

    expect(handleOAuth).toHaveBeenCalled();
  });

  test('SSO buttons not rendered if not configured on server ', () => {
    const { queryByText, queryByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider
          authConfig={{
            localEnabled: true,
            githubEnabled: false,
            customEnabled: false
          }}
          loggedInUserAtStart={false}
        >
          <Page />
        </AuthProvider>
      </HeroUIProvider>
    );

    const username = queryByLabelText('Username');
    const divider = queryByText('OR');
    const githubButton = queryByLabelText('sign in with github');
    const ssoButton = queryByLabelText('sign in with SSO');

    expect(username).toBeVisible();
    expect(divider).not.toBeInTheDocument();
    expect(githubButton).not.toBeInTheDocument();
    expect(ssoButton).not.toBeInTheDocument();
  });
});

describe('2 providers', () => {
  test('Pressing Github Button attempts OAuth Login', () => {
    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider
          authConfig={{
            localEnabled: true,
            githubEnabled: true,
            customEnabled: false
          }}
          loggedInUserAtStart={false}
        >
          <Page />
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
          authConfig={{
            localEnabled: true,
            githubEnabled: false,
            customEnabled: true,
            customProviderId: 'SSO'
          }}
          loggedInUserAtStart={false}
        >
          <Page />
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
          authConfig={{
            localEnabled: true,
            githubEnabled: false,
            customEnabled: true,
            customProviderId: 'SSO'
          }}
          loggedInUserAtStart={false}
        >
          <Page />
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
          authConfig={{
            localEnabled: true,
            githubEnabled: true,
            customEnabled: false
          }}
          loggedInUserAtStart={false}
        >
          <Page />
        </AuthProvider>
      </HeroUIProvider>
    );

    const divider = getByText('OR');
    const ssoButton = queryByLabelText('sign in with SSO');

    expect(divider).toBeInTheDocument();
    expect(ssoButton).not.toBeInTheDocument();
  });

  test('Local login not rendered if not configured on server ', () => {
    const { queryByText, queryByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthProvider
          authConfig={{
            localEnabled: false,
            githubEnabled: true,
            customEnabled: true,
            customProviderId: 'SSO'
          }}
          loggedInUserAtStart={false}
        >
          <Page />
        </AuthProvider>
      </HeroUIProvider>
    );

    const signInButton = queryByText('sign in');
    const divider = queryByText('OR');
    const githubButton = queryByLabelText('sign in with github');
    const ssoButton = queryByLabelText('sign in with SSO');

    expect(signInButton).not.toBeInTheDocument();
    expect(divider).not.toBeInTheDocument();
    expect(githubButton).toBeVisible();
    expect(ssoButton).toBeVisible();
  });
});

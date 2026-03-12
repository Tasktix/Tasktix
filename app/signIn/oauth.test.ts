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
 */

import { addToast } from '@heroui/react';
import { ErrorContext, SuccessContext } from 'better-auth/react';

import User from '@/lib/model/user';
import { authClient } from '@/lib/auth-client';

import { handleOAuth } from './oauth';

vi.mock('@heroui/react');

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
      oauth2: vi.fn()
    }
  }
}));

beforeEach(vi.resetAllMocks);

const MOCK_USER = new User(
  'userid',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_OAUTH_CONFIG = {
  githubEnabled: true,
  customEnabled: true,
  customProviderId: 'SSO'
};

test('Properly handles failed GitHub authentication', async () => {
  const setLoggedInUserMock = vi.fn();
  const exampleError = {
    error: {
      code: 'PROVIDER_NOT_FOUND',
      message: 'Provider not found',
      status: 404,
      statusText: 'NOT_FOUND'
    }
  };

  vi.mocked(authClient.signIn.social).mockImplementation(
    async (_, fetchOptions) => {
      if (fetchOptions?.onError) {
        await fetchOptions.onError(exampleError as unknown as ErrorContext);
      }
    }
  );

  await handleOAuth('github', setLoggedInUserMock, MOCK_OAUTH_CONFIG);

  expect(authClient.signIn.social).toHaveBeenCalled();
  expect(setLoggedInUserMock).not.toHaveBeenCalled();
  expect(addToast).toHaveBeenCalledWith({
    title: 'Provider not found',
    color: 'danger'
  });
});

test('Properly handles failed custom SSO authentication', async () => {
  const setLoggedInUserMock = vi.fn();
  const exampleError = {
    error: {
      code: 'PROVIDER_NOT_FOUND',
      message: 'Provider not found',
      status: 404,
      statusText: 'NOT_FOUND'
    }
  };

  vi.mocked(authClient.signIn.oauth2).mockImplementation(
    async (_, fetchOptions) => {
      if (fetchOptions?.onError) {
        await fetchOptions.onError(exampleError as unknown as ErrorContext);
      }
    }
  );

  await handleOAuth('custom', setLoggedInUserMock, MOCK_OAUTH_CONFIG);

  expect(authClient.signIn.oauth2).toHaveBeenCalled();
  expect(setLoggedInUserMock).not.toHaveBeenCalled();
  expect(addToast).toHaveBeenCalledWith({
    title: 'Provider not found',
    color: 'danger'
  });
});

test('Properly redirects and sets logged in user on successful github authentication', async () => {
  const setLoggedInUserMock = vi.fn();
  const exampleSuccess = { data: { User: MOCK_USER } };

  vi.mocked(authClient.signIn.social).mockImplementation(
    async (_, fetchOptions) => {
      if (fetchOptions?.onSuccess) {
        await fetchOptions.onSuccess(
          exampleSuccess as unknown as SuccessContext
        );
      }
    }
  );

  await handleOAuth('github', setLoggedInUserMock, MOCK_OAUTH_CONFIG);

  expect(authClient.signIn.social).toHaveBeenCalled();
  expect(setLoggedInUserMock).toHaveBeenCalledWith(MOCK_USER);
  expect(addToast).not.toHaveBeenCalled();
});

test('Properly redirects and sets logged in user on successful custom SSO authentication', async () => {
  const setLoggedInUserMock = vi.fn();
  const exampleSuccess = { data: { User: MOCK_USER } };

  vi.mocked(authClient.signIn.oauth2).mockImplementation(
    async (_, fetchOptions) => {
      if (fetchOptions?.onSuccess) {
        await fetchOptions.onSuccess(
          exampleSuccess as unknown as SuccessContext
        );
      }
    }
  );

  await handleOAuth('custom', setLoggedInUserMock, MOCK_OAUTH_CONFIG);

  expect(authClient.signIn.oauth2).toHaveBeenCalled();
  expect(setLoggedInUserMock).toHaveBeenCalledWith(MOCK_USER);
  expect(addToast).not.toHaveBeenCalled();
});

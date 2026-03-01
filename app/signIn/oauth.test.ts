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

import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { addToast } from '@heroui/react';
import { ErrorContext, SuccessContext } from 'better-auth/react';

import User from '@/lib/model/user';
import { authClient } from '@/lib/auth-client';

import { handleOauth } from './oauth';

vi.mock('@heroui/react');

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn()
    }
  }
}));

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));

beforeEach(() => {
  vi.resetAllMocks();
});

const MOCK_USER = new User(
  'userid',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);

test('Does not attempt to sign in for unsupported Provider', async () => {
  const routerMock = {
    push: vi.fn()
  } as unknown as AppRouterInstance;
  const setLoggedInUserMock = vi.fn();

  await handleOauth('unsupported', {
    setLoggedInUser: setLoggedInUserMock,
    router: routerMock
  });

  expect(authClient.signIn.social).not.toHaveBeenCalled();
  expect(setLoggedInUserMock).not.toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(routerMock.push).not.toHaveBeenCalled();
});

test('Properly handles failed github authentication', async () => {
  const routerMock = {
    push: vi.fn()
  } as unknown as AppRouterInstance;
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
    (options, fetchOptions) => {
      if (fetchOptions?.onError) {
        // void required to suppres eslint complaint - skipcq: JS-0098
        void fetchOptions.onError(exampleError as unknown as ErrorContext);
      }
    }
  );

  await handleOauth('github', {
    setLoggedInUser: setLoggedInUserMock,
    router: routerMock
  });

  expect(authClient.signIn.social).toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(routerMock.push).not.toHaveBeenCalled();
  expect(setLoggedInUserMock).not.toHaveBeenCalled();
  expect(addToast).toHaveBeenCalledWith({
    title: 'Provider not found',
    color: 'danger'
  });
});

test('Properly redirects and sets logged in user on succesful github authentication', async () => {
  const routerMock = {
    push: vi.fn()
  } as unknown as AppRouterInstance;
  const setLoggedInUserMock = vi.fn();
  const exampleSuccess = { data: { User: MOCK_USER } };

  vi.mocked(useRouter).mockReturnValue(routerMock);
  vi.mocked(authClient.signIn.social).mockImplementation(
    (options, fetchOptions) => {
      if (fetchOptions?.onSuccess) {
        // void required to suppres eslint complaint - skipcq: JS-0098
        void fetchOptions.onSuccess(
          exampleSuccess as unknown as SuccessContext
        );
      }
    }
  );

  await handleOauth('github', {
    setLoggedInUser: setLoggedInUserMock,
    router: routerMock
  });

  expect(authClient.signIn.social).toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(routerMock.push).toHaveBeenCalledWith('/list');
  expect(setLoggedInUserMock).toHaveBeenCalledWith(MOCK_USER);
  expect(addToast).not.toHaveBeenCalled();
});

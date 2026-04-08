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
 * @vitest-environment jsdom
 */

import { HeroUIProvider } from '@heroui/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ErrorContext, SuccessContext } from 'better-auth/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams
} from 'next/navigation';

import { authClient } from '@/lib/auth-client';
import User from '@/lib/model/user';
import { useAuth } from '@/components/AuthProvider';
import { addToastForError } from '@/lib/error';

import AuthSettings from './AuthSettings';

vi.mock('@/components/AuthProvider', async importOriginal => ({
  ...(await importOriginal()),
  useAuth: vi.fn()
}));

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn(),
  useSearchParams: vi.fn()
}));

vi.mock('@/lib/error');

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    deleteUser: vi.fn(),
    listAccounts: vi.fn(),
    linkSocial: vi.fn(),
    unlinkAccount: vi.fn()
  }
}));

beforeEach(() => {
  vi.resetAllMocks();
  const searchParamsMock = {
    get: vi.fn()
  } as unknown as ReadonlyURLSearchParams;

  vi.mocked(useSearchParams).mockReturnValue(searchParamsMock);
});

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);

describe('Linking/Unlinking Github', () => {
  test('Github row not rendered if Github OAuth not configured', () => {
    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: false, customEnabled: false }
    });
    vi.mocked(authClient.listAccounts).mockReturnValue({});
    const { queryByTestId } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );
    const githubRow = queryByTestId('link-to-github');

    expect(githubRow).not.toBeInTheDocument();
  });

  test('Github row rendered if Github OAuth is configured', () => {
    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });
    vi.mocked(authClient.listAccounts).mockReturnValue({});
    const { getByTestId } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    const githubRow = getByTestId('link-to-github');

    expect(githubRow).toBeInTheDocument();
  });
  test('Allows linking an account to Github if not currently linked', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });

    vi.mocked(authClient.listAccounts).mockResolvedValue({
      data: [{ accountId: 456, providerId: 'credential' }],
      error: null
    });

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    vi.mocked(authClient.linkSocial).mockResolvedValue({});

    const githubRowButton = getByLabelText('Connect');

    expect(githubRowButton).toHaveTextContent('Connect');

    await user.click(githubRowButton);

    expect(authClient.linkSocial).toHaveBeenCalledWith({
      provider: 'github',
      callbackURL: '/profile',
      errorCallbackURL: '/profile'
    });
    expect(authClient.unlinkAccount).not.toHaveBeenCalled();
  });

  test('Allows unlinking an account to Github if already linked', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });

    vi.mocked(authClient.listAccounts).mockResolvedValue({
      data: [
        { accountId: 456, providerId: 'credential' },
        { accountId: 123, providerId: 'github' }
      ],
      error: null
    });

    const { findByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );
    const exampleSuccess = {};

    vi.mocked(authClient.unlinkAccount).mockImplementation(
      async (_, fetchOptions) => {
        if (fetchOptions?.onSuccess) {
          await fetchOptions.onSuccess(
            exampleSuccess as unknown as SuccessContext
          );
        }
      }
    );

    const githubRowButton = await findByLabelText('Disconnect');

    expect(githubRowButton).toHaveTextContent('Disconnect');

    await user.click(githubRowButton);

    expect(authClient.linkSocial).not.toHaveBeenCalled();
    expect(authClient.unlinkAccount).toHaveBeenCalledWith(
      { providerId: 'github' },
      expect.anything()
    );
  });
  test('Failed Github uninking creates error toast', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });

    const exampleError = {
      data: {},
      error: {
        code: 'LAST_ACCOUNT',
        message: 'Cannot Unlink Last Account',
        status: 400,
        statusText: 'BAD_REQUEST'
      }
    };

    vi.mocked(authClient.listAccounts).mockResolvedValue({
      data: [{ accountId: 456, providerId: 'github' }],
      error: null
    });
    vi.mocked(authClient.unlinkAccount).mockImplementation(
      async (_, fetchOptions) => {
        if (fetchOptions?.onError) {
          await fetchOptions.onError(exampleError as unknown as ErrorContext);
        }
      }
    );

    const { findByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    vi.mocked(authClient.linkSocial).mockResolvedValue({});

    const githubRowButton = await findByLabelText('Disconnect');

    expect(githubRowButton).toHaveTextContent('Disconnect');

    await user.click(githubRowButton);

    expect(authClient.unlinkAccount).toHaveBeenCalledWith(
      { providerId: 'github' },
      expect.anything()
    );

    expect(addToastForError).toHaveBeenCalledWith(exampleError.error);
  });

  test('Failed Github Linking creates Toast via Query Params', () => {
    const mockErrorQueryParam = () => 'this is an error';
    const searchParamsMock = {
      get: mockErrorQueryParam
    } as unknown as ReadonlyURLSearchParams;

    vi.mocked(useSearchParams).mockReturnValue(searchParamsMock);
    vi.mocked(authClient.listAccounts).mockResolvedValue({});
    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });

    render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    expect(addToastForError).toHaveBeenCalledWith(null);
  });
});

describe('Account Deletion', () => {
  test('Attempts to delete account via password provided in modal', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: vi.fn(),
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });
    vi.mocked(authClient.listAccounts).mockReturnValue({});
    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    const deleteAccountButton = getByLabelText('Delete Account');

    expect(deleteAccountButton).toHaveClass('border-danger');

    await user.click(deleteAccountButton);

    const passwordInput = getByLabelText('Password Input');

    await user.type(passwordInput, 'asdf');

    const confirmButton = getByLabelText('Confirm Delete Account');

    await user.click(confirmButton);

    expect(authClient.deleteUser).toHaveBeenCalledWith(
      { password: 'asdf' },
      expect.anything()
    );
  });
  test('Redirects to home after deleting account', async () => {
    const user = userEvent.setup();
    const setLoggedInUserMock = vi.fn();
    const exampleSuccess = { data: { success: true, message: 'User deleted' } };

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: setLoggedInUserMock,
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });

    const routerMock = {
      push: vi.fn()
    } as unknown as AppRouterInstance;

    vi.mocked(useRouter).mockReturnValue(routerMock);

    vi.mocked(authClient.listAccounts).mockResolvedValue({});

    vi.mocked(authClient.deleteUser).mockImplementation(
      async (_, fetchOptions) => {
        if (fetchOptions?.onSuccess) {
          await fetchOptions.onSuccess(
            exampleSuccess as unknown as SuccessContext
          );
        }
      }
    );
    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    const deleteAccountButton = getByLabelText('Delete Account');

    expect(deleteAccountButton).toHaveClass('border-danger');

    await user.click(deleteAccountButton);

    const passwordInput = getByLabelText('Password Input');

    await user.type(passwordInput, 'asdf');

    const confirmButton = getByLabelText('Confirm Delete Account');

    await user.click(confirmButton);

    expect(authClient.deleteUser).toHaveBeenCalledWith(
      { password: 'asdf' },
      expect.anything()
    );
    expect(setLoggedInUserMock).toHaveBeenCalledWith(false);
    // eslint-disable-next-line
    expect(routerMock.push).toHaveBeenCalledWith('/');
  });

  test('Redirects to Home after deleting account', async () => {
    const user = userEvent.setup();
    const setLoggedInUserMock = vi.fn();
    const exampleError = {
      data: {},
      error: {
        code: 'INVALID_PASSWORD',
        message: 'Invalid password',
        status: 400,
        statusText: 'BAD_REQUEST'
      }
    };

    vi.mocked(useAuth).mockReturnValue({
      loggedInUser: MOCK_USER,
      setLoggedInUser: setLoggedInUserMock,
      oauthConfig: { githubEnabled: true, customEnabled: false }
    });

    vi.mocked(addToastForError);
    const routerMock = {
      push: vi.fn()
    } as unknown as AppRouterInstance;

    vi.mocked(useRouter).mockReturnValue(routerMock);

    vi.mocked(authClient.listAccounts).mockResolvedValue({});

    vi.mocked(authClient.deleteUser).mockImplementation(
      async (_, fetchOptions) => {
        if (fetchOptions?.onError) {
          await fetchOptions.onError(exampleError as unknown as ErrorContext);
        }
      }
    );
    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <AuthSettings user={MOCK_USER} />
      </HeroUIProvider>
    );

    const deleteAccountButton = getByLabelText('Delete Account');

    expect(deleteAccountButton).toHaveClass('border-danger');

    await user.click(deleteAccountButton);

    const passwordInput = getByLabelText('Password Input');

    await user.type(passwordInput, 'asdf');

    const confirmButton = getByLabelText('Confirm Delete Account');

    await user.click(confirmButton);

    expect(authClient.deleteUser).toHaveBeenCalledWith(
      { password: 'asdf' },
      expect.anything()
    );
    expect(addToastForError).toHaveBeenCalledWith(exampleError.error);
    expect(setLoggedInUserMock).not.toHaveBeenCalled();
    // eslint-disable-next-line
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});

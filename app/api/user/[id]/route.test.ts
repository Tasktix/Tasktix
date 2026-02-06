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

import User from '@/lib/model/user';
import { getUserByEmail, updateUserColor } from '@/lib/database/user';
import { getUser } from '@/lib/session';
import { auth } from '@/lib/auth';

import { PATCH } from './route';

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  'Amber'
);
const USER_PATH = `http://localhost/api/user/${MOCK_USER.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/user');

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      isUsernameAvailable: vi.fn(),
      updateUser: vi.fn(),
      changeEmail: vi.fn(),
      verifyPassword: vi.fn(),
      changePassword: vi.fn()
    }
  }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Allows username updates without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });
    vi.mocked(auth.api.isUsernameAvailable).mockResolvedValue({
      available: true
    });
    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(auth.api.updateUser).toHaveBeenCalledTimes(1);
    expect(auth.api.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { username: 'new_name' } })
    );
  });

  test('Allows email updates without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.changeEmail).mockResolvedValue({ status: true });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'new_email@example.com' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(auth.api.changeEmail).toHaveBeenCalledTimes(1);
    expect(auth.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ body: { newEmail: 'new_email@example.com' } })
    );
  });

  test('Allows color updates without altering other fields', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(updateUserColor).mockResolvedValue(true);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ color: 'Red' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(updateUserColor).toHaveBeenCalledTimes(1);
    expect(updateUserColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'Red' })
    );
  });

  test('Allows multiple field updates at the same time', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(updateUserColor).mockResolvedValue(true);
    vi.mocked(auth.api.changeEmail).mockResolvedValue({ status: true });
    vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });
    vi.mocked(auth.api.isUsernameAvailable).mockResolvedValue({
      available: true
    });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({
          username: 'new_name',
          email: 'new_email@example.com',
          color: 'Red'
        })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(auth.api.updateUser).toHaveBeenCalledTimes(1);
    expect(auth.api.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { username: 'new_name' } })
    );
    expect(auth.api.changeEmail).toHaveBeenCalledTimes(1);
    expect(auth.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ body: { newEmail: 'new_email@example.com' } })
    );
    expect(updateUserColor).toHaveBeenCalledTimes(1);
    expect(updateUserColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'Red' })
    );
  });

  test('Rejects unauthenticated users', async () => {
    vi.mocked(getUser).mockResolvedValue(false);
    vi.mocked(updateUserColor).mockResolvedValue(true);
    vi.mocked(auth.api.changeEmail).mockResolvedValue({ status: true });
    vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });

    const response = await PATCH(new Request(USER_PATH, { method: 'patch' }), {
      params: Promise.resolve({ id: MOCK_USER.id })
    });

    expect(response.status).toBe(401);
    expect(auth.api.updateUser).not.toHaveBeenCalled();
    expect(auth.api.changeEmail).not.toHaveBeenCalled();
    expect(updateUserColor).not.toHaveBeenCalled();
  });

  test('Rejects requests to modify other users', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(updateUserColor).mockResolvedValue(true);
    vi.mocked(auth.api.changeEmail).mockResolvedValue({ status: true });
    vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });

    const response = await PATCH(
      new Request(USER_PATH.slice(0, -2), { method: 'patch' }),
      { params: Promise.resolve({ id: MOCK_USER.id.slice(0, -2) }) }
    );

    expect(response.status).toBe(403);
    expect(auth.api.changeEmail).not.toHaveBeenCalled();
    expect(auth.api.updateUser).not.toHaveBeenCalled();
    expect(updateUserColor).not.toHaveBeenCalled();
  });

  test("Rejects Password Updates that don't provide current password", async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ newPassword: 'new_password' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
  });

  test('Accepts valid password updates', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.verifyPassword).mockResolvedValue({ status: true });
    vi.mocked(auth.api.changePassword).mockResolvedValue({
      user: MOCK_USER,
      token: 'tokenString'
    });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({
          newPassword: 'new_password',
          oldPassword: 'old_password'
        })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'User updated' });
  });

  test('Rejects password updates that provide a weak new password', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.verifyPassword).mockResolvedValue({ status: true });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({
          newPassword: 'short',
          oldPassword: 'old_password'
        })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Invalid request body' });
  });
  test('Rejects invalid username updates', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    expect(auth.api.updateUser).not.toHaveBeenCalled();

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'invalid username' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(auth.api.updateUser).not.toHaveBeenCalled();
  });

  test('Rejects invalid email updates', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    expect(auth.api.changeEmail).not.toHaveBeenCalled();

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'badEmail' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(auth.api.changeEmail).not.toHaveBeenCalled();
  });

  test('Rejects invalid color updates', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ color: 'badColor' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(updateUserColor).not.toHaveBeenCalled();
  });

  test('Rejects the request if the username is unavailable', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.isUsernameAvailable).mockResolvedValue({
      available: false
    });
    vi.mocked(auth.api.updateUser).mockResolvedValue({ status: true });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'taken_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(auth.api.updateUser).not.toHaveBeenCalled();
  });

  test('Rejects the request if the email is unavailable', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getUserByEmail).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.changeEmail).mockResolvedValue({ status: true });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'taken_email@example.com' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(auth.api.changeEmail).not.toHaveBeenCalled();
  });

  test('Warns the user if updating the member failed', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.updateUser).mockResolvedValue({ status: false });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(500);
  });

  test('Warns the user if an unexpected error occurs', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(updateUserColor).mockImplementation(() => {
      throw new Error();
    });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: 'Internal Server Error' });
  });

  test('Warns the user if an unexpected error occurs, correctly handling non-stringable errors', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.api.updateUser).mockImplementation(() => {
      // Intentionally throwing something that doesn't have a `toString` method
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw null;
    });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: 'Internal Server Error' });
  });
});

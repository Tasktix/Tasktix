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
import {
  getUserByEmail,
  getUserByUsername,
  updateUser
} from '@/lib/database/user';
import { getUser } from '@/lib/session';

import { PATCH } from './route';

const MOCK_USER = new User(
  'username',
  'email@example.com',
  'password',
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const USER_PATH = `http://localhost/api/user/${MOCK_USER.id}` as const;

jest.mock('@/lib/session');
jest.mock('@/lib/database/user');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('PATCH', () => {
  test('Allows username updates without altering other fields', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUser as jest.Mock).mockReturnValue(true);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'new_name' })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ email: null })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: null })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ color: null })
    );
  });

  test('Allows email updates without altering other fields', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUser as jest.Mock).mockReturnValue(true);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'new_email@example.com' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new_email@example.com' })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ username: null })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: null })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ color: null })
    );
  });

  test('Allows color updates without altering other fields', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUser as jest.Mock).mockReturnValue(true);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ color: 'Red' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'Red' })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ username: null })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ email: null })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: null })
    );
  });

  test('Allows multiple field updates at the same time', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUser as jest.Mock).mockReturnValue(true);

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
    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'new_name',
        email: 'new_email@example.com',
        color: 'Red'
      })
    );
    expect(updateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: null })
    );
  });

  test('Rejects unauthenticated users', async () => {
    (getUser as jest.Mock).mockReturnValue(false);

    const response = await PATCH(new Request(USER_PATH, { method: 'patch' }), {
      params: Promise.resolve({ id: MOCK_USER.id })
    });

    expect(updateUser).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  test('Rejects requests to modify other users', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH.slice(0, -2), { method: 'patch' }),
      { params: Promise.resolve({ id: MOCK_USER.id.slice(0, -2) }) }
    );

    expect(response.status).toBe(403);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Rejects password updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ password: 'new_password' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Rejects invalid username updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'invalid username' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Rejects invalid email updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'badEmail' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Rejects invalid color updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ color: 'badColor' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Rejects the request if the username is unavailable', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (getUserByUsername as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'taken_name' })
      }),
      { params: { id: MOCK_USER.id } }
    );

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Rejects the request if the email is unavailable', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (getUserByEmail as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'taken_email@example.com' })
      }),
      { params: { id: MOCK_USER.id } }
    );

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  test('Warns the user if updating the member failed', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUser as jest.Mock).mockReturnValue(false);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: { id: MOCK_USER.id } }
    );

    expect(response.status).toBe(500);
  });

  test('Warns the user if an unexpected error occurs', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUser as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: { id: MOCK_USER.id } }
    );

    expect(response.status).toBe(500);
  });
});

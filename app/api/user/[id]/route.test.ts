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
import { updateUserColor } from '@/lib/database/user';
import { getUser } from '@/lib/session';
import { auth } from '@/lib/auth';
import { PATCH } from './route';

const MOCK_USER = new User(
  "abcdefg",
  "username",
  "email@example.com",
  false,
  new Date(),
  new Date(),
  "Amber",
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
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'new_name' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(changeEmailSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(updateUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({ body: {username: 'new_name'} })
    );
  });

  test('Allows email updates without altering other fields', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'new_email@example.com' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(changeEmailSpy).toHaveBeenCalledTimes(1);
    expect(changeEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({ body: { email: 'new_email@example.com' } })
    );
  });

  test('Allows color updates without altering other fields', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUserColor as jest.Mock).mockReturnValue(true);
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ color: 'Red' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(200);
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(changeEmailSpy).not.toHaveBeenCalled();
    expect(updateUserColor).toHaveBeenCalledTimes(1);
    expect(updateUserColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'Red' })
    );
  });

  test('Allows multiple field updates at the same time', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUserColor as jest.Mock).mockReturnValue(MOCK_USER);
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);

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
    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(updateUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({ body: {username: 'new_name'} })
    );
    expect(changeEmailSpy).toHaveBeenCalledTimes(1);
    expect(changeEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({ body: { email: 'new_email@example.com' } })
    );
    expect(updateUserColor).toHaveBeenCalledTimes(1);
    expect(updateUserColor).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'Red' })
    );
  });

  test('Rejects unauthenticated users', async () => {
    (getUser as jest.Mock).mockReturnValue(false);
    (updateUserColor as jest.Mock).mockReturnValue(MOCK_USER);
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);

    const response = await PATCH(new Request(USER_PATH, { method: 'patch' }), {
      params: Promise.resolve({ id: MOCK_USER.id })
    });

    expect(response.status).toBe(401);
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(changeEmailSpy).not.toHaveBeenCalled();
    expect(updateUserColor).not.toHaveBeenCalled();
  });

  test('Rejects requests to modify other users', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    (updateUserColor as jest.Mock).mockReturnValue(MOCK_USER);
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);

    const response = await PATCH(
      new Request(USER_PATH.slice(0, -2), { method: 'patch' }),
      { params: Promise.resolve({ id: MOCK_USER.id.slice(0, -2) }) }
    );

    expect(response.status).toBe(403);
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(changeEmailSpy).not.toHaveBeenCalled();
    expect(updateUserColor).not.toHaveBeenCalled();
  });

  test.skip('Rejects password updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ password: 'new_password' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
  });

  test('Rejects invalid username updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    const updateUserSpy = jest.spyOn(auth.api, 'updateUser').mockResolvedValue(true as any);

    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ username: 'invalid username' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );

    expect(response.status).toBe(400);
    expect(updateUserSpy).not.toHaveBeenCalled();
  });

  test('Rejects invalid email updates', async () => {
    (getUser as jest.Mock).mockReturnValue(MOCK_USER);
    const changeEmailSpy = jest.spyOn(auth.api, 'changeEmail').mockResolvedValue(true as any);
    
    const response = await PATCH(
      new Request(USER_PATH, {
        method: 'patch',
        body: JSON.stringify({ email: 'badEmail' })
      }),
      { params: Promise.resolve({ id: MOCK_USER.id }) }
    );
    
    expect(response.status).toBe(400);
    expect(changeEmailSpy).not.toHaveBeenCalled();
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
    expect(updateUserColor).not.toHaveBeenCalled();
  });
});

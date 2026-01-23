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

import { cookies } from 'next/headers';

import { createSession, deleteSession } from '@/lib/database/session';
import { getUserBySessionId } from '@/lib/database/user';
import User from '@/lib/model/user';
import Session from '@/lib/model/session';

import { setUser, getUser, clearUser } from '../session';

jest.mock('@/lib/database/session');
jest.mock('@/lib/database/user');
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

beforeEach(() => {
  jest.resetAllMocks();
  (cookies as jest.Mock).mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  });
});

describe('setUser', () => {
  test('Creates a session, sets a cookie with the session ID, and returns the session ID', async () => {
    const userId = 'user123';
    const mockedCookies = (cookies as jest.Mock)() as {
      get: jest.Mock;
      set: jest.Mock;
      delete: jest.Mock;
    };

    (createSession as jest.Mock).mockResolvedValue(true);

    const result = await setUser(userId);

    expect(createSession).toHaveBeenCalledTimes(1);
    const createSessionCall: Session = (createSession as jest.Mock).mock
      .calls[0][0];

    expect(createSessionCall.userId).toBe(userId);
    expect(createSessionCall.id).toEqual(expect.any(String));
    expect(createSessionCall.dateExpire).toEqual(expect.any(Date));

    const sessionId = createSessionCall.id;

    expect(mockedCookies.set).toHaveBeenCalledTimes(1);
    const mockedCookiesCall: [string, string, unknown] =
      mockedCookies.set.mock.calls[0];

    expect(mockedCookiesCall[0]).toBe('user');
    expect(mockedCookiesCall[1]).toBe(sessionId);

    expect(result).toBe(sessionId);

    jest.resetModules();
  });

  test('Returns false and does not set a cookie if the session cannot be stored in the database', async () => {
    (createSession as jest.Mock).mockResolvedValue(false);
    const mockedCookies = (cookies as jest.Mock)();

    const result = await setUser('user123');

    expect(result).toBe(false);
    expect(createSession).toHaveBeenCalled();
    expect(mockedCookies.set).not.toHaveBeenCalled();
  });
});

describe('getUser', () => {
  test('Returns the user tied to the current session if there is a valid session cookie', async () => {
    const mockSessionId = 'session123';
    const mockUser = new User(
      'user',
      'user@example.com',
      'password!',
      new Date(),
      new Date(),
      {}
    );
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue({ value: mockSessionId });
    (getUserBySessionId as jest.Mock).mockReturnValue(mockUser);

    const result = await getUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(getUserBySessionId).toHaveBeenCalledTimes(1);
    expect(getUserBySessionId).toHaveBeenCalledWith(mockSessionId);

    expect(result).toBe(mockUser);
  });

  test('Returns false if no session cookie is found', async () => {
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue(undefined);

    const result = await getUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(result).toBe(false);
  });

  test('Does not check the database if no session cookie is found', async () => {
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue(undefined);

    await getUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(getUserBySessionId).not.toHaveBeenCalled();
  });

  test('Returns false if no user is found for the ID in the session cookie', async () => {
    const mockSessionId = 'session123';
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue({ value: mockSessionId });
    (getUserBySessionId as jest.Mock).mockResolvedValue(false);

    const result = await getUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(getUserBySessionId).toHaveBeenCalledTimes(1);
    expect(getUserBySessionId).toHaveBeenCalledWith(mockSessionId);

    expect(result).toBe(false);
  });
});

describe('clearUser', () => {
  test('Deletes the current user session and clears its cookie', async () => {
    const mockSessionId = 'session123';
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue({ value: mockSessionId });
    (deleteSession as jest.Mock).mockResolvedValue(true);

    const result = await clearUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(deleteSession).toHaveBeenCalledWith(mockSessionId);

    expect(mockedCookies.delete).toHaveBeenCalledWith('user');

    expect(result).toBe(true);
  });

  test('Returns false and does not modify the database if no session cookie is found', async () => {
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue(undefined);

    const result = await clearUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(deleteSession).not.toHaveBeenCalled();

    expect(result).toBe(false);
  });

  test('Return false and does not remove the cookie if session deletion fails', async () => {
    const mockSessionId = 'session123';
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue({ value: mockSessionId });
    (deleteSession as jest.Mock).mockResolvedValue(false);

    const result = await clearUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(deleteSession).toHaveBeenCalledTimes(1);
    expect(deleteSession).toHaveBeenCalledWith(mockSessionId);

    expect(mockedCookies.delete).not.toHaveBeenCalled();

    expect(result).toBe(false);
  });
});

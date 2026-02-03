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

import { getUser } from './session';

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
});


describe('getUser', () => {
  test.skip('Returns the user tied to the current session if there is a valid session cookie', async () => {
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

  test.skip('Returns false if no session cookie is found', async () => {
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue(undefined);

    const result = await getUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(result).toBe(false);
  });

  test.skip('Does not check the database if no session cookie is found', async () => {
    const mockedCookies = (cookies as jest.Mock)();

    mockedCookies.get.mockReturnValue(undefined);

    await getUser();

    expect(mockedCookies.get).toHaveBeenCalledTimes(1);
    expect(mockedCookies.get).toHaveBeenCalledWith('user');

    expect(getUserBySessionId).not.toHaveBeenCalled();
  });

  test.skip('Returns false if no user is found for the ID in the session cookie', async () => {
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

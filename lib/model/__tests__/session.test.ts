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

import { getUser } from '@/lib/session';
import { auth } from '@/lib/auth';
import { getUserById } from '@/lib/database/user';

import User from '../user';

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  'Amber'
);

const today = new Date();
const MOCK_SESSION = {
  id: 'sessionid',
  createdAt: today,
  updatedAt: today,
  userId: MOCK_USER.id,
  expiresAt: today,
  token: 'token'
};

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers()))
}));

vi.mock('@/lib/database/user');

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test('Returns a valid user Object under happy path', async () => {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    session: MOCK_SESSION,
    user: MOCK_USER
  });
  vi.mocked(getUserById).mockResolvedValue(MOCK_USER);
  const user = await getUser();

  expect(getUserById).toHaveBeenCalledExactlyOnceWith(MOCK_SESSION.userId);
  expect(user).toEqual(MOCK_USER);
});

test('Returns false if no valid user session', async () => {
  vi.mocked(auth.api.getSession).mockResolvedValue(null);

  const user = await getUser();

  expect(user).toBeFalsy();
});

test('Returns false if no valid database fetch fails', async () => {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    session: MOCK_SESSION,
    user: MOCK_USER
  });
  vi.mocked(getUserById).mockResolvedValue(false);

  const user = await getUser();

  expect(getUserById).toHaveBeenCalledExactlyOnceWith(MOCK_SESSION.userId);
  expect(user).toBeFalsy();
});

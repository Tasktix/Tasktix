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

import { redirect } from 'next/navigation';

import { getUser } from '@/lib/session';
import User from '@/lib/model/user';

import { authorize } from '../authorize';

vi.mock('@/lib/session', () => ({
  getUser: vi.fn()
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authorize', () => {
  test('Does nothing if user is authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(
      new User('username', 'email', 'password', new Date(), new Date(), {})
    );
    await authorize();

    expect(redirect).not.toHaveBeenCalled();
  });

  test('Redirects to /signIn if user is not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(false);
    await authorize();

    expect(redirect).toHaveBeenCalledWith('/signIn');
  });
});

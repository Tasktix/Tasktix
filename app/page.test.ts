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

import Home from '@/app/page';
import { getUser } from '@/lib/session';
import User from '@/lib/model/user';

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

vi.mock('@/lib/session', () => ({
  getUser: vi.fn()
}));

describe('root route redirect logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('redirects authenticated users to /list', async () => {
    vi.mocked(getUser).mockResolvedValue(
      new User(
        'testUser',
        'test@example.com',
        'password123',
        new Date(),
        new Date(),
        {}
      )
    );

    await Home();

    expect(redirect).toHaveBeenCalledWith('/list');
  });

  it('redirects unauthenticated users to /about', async () => {
    vi.mocked(getUser).mockResolvedValue(false);

    await Home();

    expect(redirect).toHaveBeenCalledWith('/about');
  });
});

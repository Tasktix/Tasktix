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

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

jest.mock('@/lib/session', () => ({
  getUser: jest.fn()
}));

describe('root route redirect logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects authenticated users to /list', async () => {
    (getUser as jest.Mock).mockResolvedValue({ id: 'user123' });

    await Home();

    expect(redirect).toHaveBeenCalledWith('/list');
  });

  it('redirects unauthenticated users to /about', async () => {
    (getUser as jest.Mock).mockResolvedValue(null);

    await Home();

    expect(redirect).toHaveBeenCalledWith('/about');
  });
});

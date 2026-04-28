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

import { createList } from '@/lib/database/list';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';

import { POST } from './route';

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/database/user');

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);

const requestURL = 'http://localhost/api/list/';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST', () => {
  test('Creates list when requestor has valid session', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(createList).mockResolvedValue(true);

    const response = await POST(
      new Request(requestURL, {
        method: 'POST',
        body: JSON.stringify({ color: 'Amber', name: 'list name' })
      })
    );

    expect(response.status).toBe(201);
    expect(createList).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ color: 'Amber', name: 'list name' })
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await POST(
        new Request(requestURL, {
          method: 'POST'
        })
      );

      expect(response.status).toBe(401);
      expect(createList).not.toHaveBeenCalled();
    });

    test('Rejects requests with insufficent parameters', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);

      const response = await POST(
        new Request(requestURL, {
          method: 'POST',
          body: JSON.stringify({ badField: 'badValue' })
        })
      );

      expect(response.status).toBe(400);
      expect(createList).not.toHaveBeenCalled();
    });

    test('Rejects requests with insufficent parameters', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(createList).mockResolvedValue(false);
      const response = await POST(
        new Request(requestURL, {
          method: 'POST',
          body: JSON.stringify({ color: 'Amber', name: 'list name' })
        })
      );

      expect(response.status).toBe(500);
      expect(createList).toHaveBeenCalled();
    });
  });
});

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

import { createListSection } from '@/lib/database/listSection';
import { getRoleByList } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';

import { POST } from './route';

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const SECTION_PATH = 'http://localhost/api/list/list-id/section' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/listSection');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST', () => {
  test('Creates a list section when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(
      new MemberRole(
        'ListUpdater',
        'Updates the list and nothing else',
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false
      )
    );
    vi.mocked(createListSection).mockResolvedValue(true);

    const response = await POST(
      new Request(SECTION_PATH, {
        method: 'POST',
        body: JSON.stringify({ name: 'List section name' })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(201);
    expect(createListSection).toHaveBeenCalledExactlyOnceWith(
      'list-id',
      expect.objectContaining({ name: 'List section name' })
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await POST(
        new Request(SECTION_PATH, {
          method: 'POST',
          body: JSON.stringify({ name: 'List section name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(401);
      expect(createListSection).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(false);

      const response = await POST(
        new Request(SECTION_PATH, {
          method: 'POST',
          body: JSON.stringify({ name: 'List section name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(404);
      expect(createListSection).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to create a list section', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(
        new MemberRole(
          'NotListUpdater',
          'Does everything but update the list',
          true,
          true,
          true,
          true,
          true,
          true,
          false,
          true
        )
      );

      const response = await POST(
        new Request(SECTION_PATH, {
          method: 'POST',
          body: JSON.stringify({ name: 'List section name' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(403);
      expect(createListSection).not.toHaveBeenCalled();
    });
  });
});

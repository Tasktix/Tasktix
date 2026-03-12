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

import { createTag } from '@/lib/database/list';
import { getRoleByList } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';
import { getUser } from '@/lib/session';
import User from '@/lib/model/user';

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
const TAG_PATH = 'http://localhost/api/item/item-id/tag' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST', () => {
  test('Creates a new tag when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(
      new MemberRole('TagManager', 'Manages tags and nothing else', {
        canManageTags: true
      })
    );
    vi.mocked(createTag).mockResolvedValue(true);

    const response = await POST(
      new Request(TAG_PATH, {
        method: 'POST',
        body: JSON.stringify({ name: 'Tag name', color: 'Amber' })
      }),
      { params: Promise.resolve({ id: 'list-id' }) }
    );

    expect(response.status).toBe(201);
    expect(createTag).toHaveBeenCalledExactlyOnceWith(
      'list-id',
      expect.objectContaining({ name: 'Tag name', color: 'Amber' })
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'POST',
          body: JSON.stringify({ name: 'Tag name', color: 'Amber' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(401);
      expect(createTag).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list to create a tag on', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(false);

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'POST',
          body: JSON.stringify({ name: 'Tag name', color: 'Amber' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(404);
      expect(createTag).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to create a tag', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(
        new MemberRole('NotTagManager', 'Does everything but manage tags', {
          canAddItems: true,
          canUpdateItems: true,
          canDeleteItems: true,
          canManageAssignees: true,
          canManageMembers: true,
          canUpdateList: true,
          canDeleteList: true
        })
      );

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'POST',
          body: JSON.stringify({ name: 'Tag name', color: 'Amber' })
        }),
        { params: Promise.resolve({ id: 'list-id' }) }
      );

      expect(response.status).toBe(403);
      expect(createTag).not.toHaveBeenCalled();
    });
  });
});

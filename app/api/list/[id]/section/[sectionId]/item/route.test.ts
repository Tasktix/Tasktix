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

import { updateSectionIndices } from '@/lib/database/listItem';
import { getRoleByList } from '@/lib/database/user';
import { getUser } from '@/lib/session';
import User from '@/lib/model/user';
import MemberRole from '@/lib/model/memberRole';

import { PATCH } from './route';

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const ITEM_PATH =
  'http://localhost/api/list/list-id/section/section-id/item' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/listItem');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Reorders when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(
      new MemberRole('ListUpdater', 'Updates lists and nothing else', {
        canUpdateList: true
      })
    );
    vi.mocked(updateSectionIndices).mockResolvedValue(true);

    const response = await PATCH(
      new Request(ITEM_PATH, {
        method: 'PATCH',
        body: JSON.stringify({
          itemId: 'a-16-chr-item-id',
          index: 2,
          oldIndex: 0
        })
      }),
      { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateSectionIndices).toHaveBeenCalledExactlyOnceWith(
      'section-id',
      'a-16-chr-item-id',
      2,
      0
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await PATCH(
        new Request(ITEM_PATH, {
          method: 'PATCH',
          body: JSON.stringify({
            itemId: 'a-16-chr-item-id',
            index: 2,
            oldIndex: 0
          })
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(401);
      expect(updateSectionIndices).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list whose items should be reordered', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(false);

      const response = await PATCH(
        new Request(ITEM_PATH, {
          method: 'PATCH',
          body: JSON.stringify({
            itemId: 'a-16-chr-item-id',
            index: 2,
            oldIndex: 0
          })
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(404);
      expect(updateSectionIndices).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to reorder', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(
        new MemberRole('NotListUpdater', 'Does everything but update lists', {
          canAddItems: true,
          canUpdateItems: true,
          canDeleteItems: true,
          canManageTags: true,
          canManageAssignees: true,
          canManageMembers: true,
          canDeleteList: true
        })
      );

      const response = await PATCH(
        new Request(ITEM_PATH, {
          method: 'PATCH',
          body: JSON.stringify({
            itemId: 'a-16-chr-item-id',
            index: 2,
            oldIndex: 0
          })
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(403);
      expect(updateSectionIndices).not.toHaveBeenCalled();
    });
  });
});

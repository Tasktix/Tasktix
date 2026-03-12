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

import {
  deleteListItem,
  getListItemById,
  updateListItem
} from '@/lib/database/listItem';
import { getRoleByItem } from '@/lib/database/user';
import ListItem from '@/lib/model/listItem';
import MemberRole from '@/lib/model/memberRole';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';

import { DELETE, PATCH } from './route';

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_ITEM = new ListItem('test tag', {});
const ITEM_PATH = `http://localhost/api/item/${MOCK_ITEM.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/listItem');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Updates item name when provided & requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getListItemById).mockResolvedValue(MOCK_ITEM);
    vi.mocked(getRoleByItem).mockResolvedValue(
      new MemberRole('ItemUpdater', 'Updates items and does nothing else', {
        canUpdateItems: true
      })
    );
    vi.mocked(updateListItem).mockResolvedValue(true);

    const response = await PATCH(
      new Request(ITEM_PATH, {
        method: 'patch',
        body: JSON.stringify({ name: 'New item name' })
      }),
      {
        params: Promise.resolve({ id: MOCK_ITEM.id })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListItem).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ name: 'New item name' })
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await PATCH(
        new Request(ITEM_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New item name' })
        }),
        {
          params: Promise.resolve({ id: MOCK_ITEM.id })
        }
      );

      expect(response.status).toBe(401);
      expect(updateListItem).not.toHaveBeenCalled();
    });

    test("Indicates no resource exists if requestor is not a member of the list they're updating an item of", async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListItemById).mockResolvedValue(MOCK_ITEM);
      vi.mocked(getRoleByItem).mockResolvedValue(false);

      const response = await PATCH(
        new Request(ITEM_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New item name' })
        }),
        {
          params: Promise.resolve({ id: MOCK_ITEM.id })
        }
      );

      expect(response.status).toBe(404);
      expect(updateListItem).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to update item', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getListItemById).mockResolvedValue(MOCK_ITEM);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole('NotItemUpdater', 'Does everything but update items', {
          canAddItems: true,
          canDeleteItems: true,
          canManageTags: true,
          canManageAssignees: true,
          canManageMembers: true,
          canUpdateList: true,
          canDeleteList: true
        })
      );

      const response = await PATCH(
        new Request(ITEM_PATH, {
          method: 'patch',
          body: JSON.stringify({ name: 'New item name' })
        }),
        {
          params: Promise.resolve({ id: MOCK_ITEM.id })
        }
      );

      expect(response.status).toBe(403);
      expect(updateListItem).not.toHaveBeenCalled();
    });
  });
});

describe('DELETE', () => {
  test('Deletes item when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByItem).mockResolvedValue(
      new MemberRole('ItemRemover', 'Deletes items and does nothing else', {
        canDeleteItems: true
      })
    );
    vi.mocked(deleteListItem).mockResolvedValue(true);

    const response = await DELETE(
      new Request(ITEM_PATH, {
        method: 'delete'
      }),
      {
        params: Promise.resolve({ id: MOCK_ITEM.id })
      }
    );

    expect(response.status).toBe(200);
    expect(deleteListItem).toHaveBeenCalledExactlyOnceWith(MOCK_ITEM.id);
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await DELETE(
        new Request(ITEM_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({ id: MOCK_ITEM.id })
        }
      );

      expect(response.status).toBe(401);
      expect(deleteListItem).not.toHaveBeenCalled();
    });

    test("Indicates no resource exists if requestor is not a member of the list they're deleting an item of", async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(false);

      const response = await DELETE(
        new Request(ITEM_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({ id: MOCK_ITEM.id })
        }
      );

      expect(response.status).toBe(404);
      expect(deleteListItem).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to delete item', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole('NotItemRemover', 'Does everything but delete items', {
          canAddItems: true,
          canUpdateItems: true,
          canManageTags: true,
          canManageAssignees: true,
          canManageMembers: true,
          canUpdateList: true,
          canDeleteList: true
        })
      );

      const response = await DELETE(
        new Request(ITEM_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({ id: MOCK_ITEM.id })
        }
      );

      expect(response.status).toBe(403);
      expect(deleteListItem).not.toHaveBeenCalled();
    });
  });
});

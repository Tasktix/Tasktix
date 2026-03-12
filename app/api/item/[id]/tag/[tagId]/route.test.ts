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

import { linkTag, unlinkTag } from '@/lib/database/listItem';
import { getRoleByItem } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';
import Tag from '@/lib/model/tag';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';

import { DELETE, POST } from './route';

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_TAG = new Tag('test tag', 'Blue');
const TAG_PATH =
  `http://localhost/api/item/some-id/tag/${MOCK_TAG.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/listItem');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST', () => {
  test('Assigns a tag to an item when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByItem).mockResolvedValue(
      new MemberRole('ItemUpdater', 'Updates items and does nothing else', {
        canUpdateItems: true
      })
    );
    vi.mocked(linkTag).mockResolvedValue(true);

    const response = await POST(
      new Request(TAG_PATH, {
        method: 'post'
      }),
      {
        params: Promise.resolve({
          id: 'some-id',
          tagId: MOCK_TAG.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(linkTag).toHaveBeenCalledExactlyOnceWith('some-id', MOCK_TAG.id);
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(401);
      expect(linkTag).not.toHaveBeenCalled();
    });

    test("Indicates no resource exists if requestor is not a member of the list they're assigning an item on", async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(false);

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(404);
      expect(linkTag).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to update item', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
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

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(403);
      expect(linkTag).not.toHaveBeenCalled();
    });

    test('Informs the requestor if database update fails', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole('ItemUpdater', 'Updates items and does nothing else', {
          canUpdateItems: true
        })
      );
      vi.mocked(linkTag).mockResolvedValue(false);

      const response = await POST(
        new Request(TAG_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(500);
    });
  });
});

describe('DELETE', () => {
  test('Assigns a tag to an item when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByItem).mockResolvedValue(
      new MemberRole('ItemUpdater', 'Updates items and does nothing else', {
        canUpdateItems: true
      })
    );
    vi.mocked(unlinkTag).mockResolvedValue(true);

    const response = await DELETE(
      new Request(TAG_PATH, {
        method: 'delete'
      }),
      {
        params: Promise.resolve({
          id: 'some-id',
          tagId: MOCK_TAG.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(unlinkTag).toHaveBeenCalledExactlyOnceWith('some-id', MOCK_TAG.id);
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(401);
      expect(unlinkTag).not.toHaveBeenCalled();
    });

    test("Indicates no resource exists if requestor is not a member of the list they're assigning an item on", async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(false);

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(404);
      expect(unlinkTag).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to update item', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole('ItemUpdater', 'Does everything but update items', {
          canAddItems: true,
          canDeleteItems: true,
          canManageTags: true,
          canManageAssignees: true,
          canManageMembers: true,
          canUpdateList: true,
          canDeleteList: true
        })
      );

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(403);
      expect(unlinkTag).not.toHaveBeenCalled();
    });

    test('Informs the requestor if database update fails', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole('ItemUpdater', 'Updates items and does nothing else', {
          canUpdateItems: true
        })
      );
      vi.mocked(linkTag).mockResolvedValue(false);

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'delete'
        }),
        {
          params: Promise.resolve({
            id: 'some-id',
            tagId: MOCK_TAG.id
          })
        }
      );

      expect(response.status).toBe(500);
    });
  });
});

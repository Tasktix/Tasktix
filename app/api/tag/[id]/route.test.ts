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

import { deleteTag, getTagById, updateTag } from '@/lib/database/list';
import { getRoleByTag } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import Tag from '@/lib/model/tag';

import { DELETE, PATCH } from './route';

const MOCK_USER = new User(
  'user-id',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_TAG = new Tag('Tag name', 'Cyan', 'tag-id');
const TAG_PATH = 'http://localhost/api/tag/tag-id' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Updates the tag name and nothing else when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByTag).mockResolvedValue(
      new MemberRole('TagManager', 'Manages tags and nothing else', {
        canManageTags: true
      })
    );
    vi.mocked(getTagById).mockResolvedValue(MOCK_TAG);
    vi.mocked(updateTag).mockResolvedValue(true);

    const response = await PATCH(
      new Request(TAG_PATH, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New tag name' })
      }),
      { params: Promise.resolve({ id: 'tag-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateTag).toHaveBeenCalledExactlyOnceWith({
      id: 'tag-id',
      name: 'New tag name',
      color: MOCK_TAG.color
    });
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await PATCH(
        new Request(TAG_PATH, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'New tag name' })
        }),
        { params: Promise.resolve({ id: 'tag-id' }) }
      );

      expect(response.status).toBe(401);
      expect(updateTag).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list specified in the path', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByTag).mockResolvedValue(false);

      const response = await PATCH(
        new Request(TAG_PATH, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'New tag name' })
        }),
        { params: Promise.resolve({ id: 'tag-id' }) }
      );

      expect(response.status).toBe(404);
      expect(updateTag).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to update tags', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByTag).mockResolvedValue(
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

      const response = await PATCH(
        new Request(TAG_PATH, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'New tag name' })
        }),
        { params: Promise.resolve({ id: 'tag-id' }) }
      );

      expect(response.status).toBe(403);
      expect(updateTag).not.toHaveBeenCalled();
    });
  });
});

describe('DELETE', () => {
  test('Deletes the tag when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByTag).mockResolvedValue(
      new MemberRole('TagManager', 'Manages tags and nothing else', {
        canManageTags: true
      })
    );
    vi.mocked(deleteTag).mockResolvedValue(true);

    const response = await DELETE(
      new Request(TAG_PATH, {
        method: 'DELETE'
      }),
      { params: Promise.resolve({ id: 'tag-id' }) }
    );

    expect(response.status).toBe(200);
    expect(deleteTag).toHaveBeenCalledExactlyOnceWith('tag-id');
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'tag-id' }) }
      );

      expect(response.status).toBe(401);
      expect(deleteTag).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list the deleted tag belongs to', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByTag).mockResolvedValue(false);

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'tag-id' }) }
      );

      expect(response.status).toBe(404);
      expect(deleteTag).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to delete tags', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByTag).mockResolvedValue(
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

      const response = await DELETE(
        new Request(TAG_PATH, {
          method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'tag-id' }) }
      );

      expect(response.status).toBe(403);
      expect(deleteTag).not.toHaveBeenCalled();
    });
  });
});

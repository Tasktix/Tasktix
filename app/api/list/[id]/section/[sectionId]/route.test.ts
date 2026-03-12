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
  deleteListSection,
  updateListSection
} from '@/lib/database/listSection';
import { getRoleByList } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';

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
const SECTION_PATH =
  'http://localhost/api/list/list-id/section/section-id' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/listSection');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Updates section name when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(
      new MemberRole('ListUpdater', 'Updates the list and nothing else', {
        canUpdateList: true
      })
    );
    vi.mocked(updateListSection).mockResolvedValue(true);

    const response = await PATCH(
      new Request(SECTION_PATH, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New section name' })
      }),
      { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
    );

    expect(response.status).toBe(200);
    expect(updateListSection).toHaveBeenCalledExactlyOnceWith(
      'section-id',
      'New section name'
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await PATCH(
        new Request(SECTION_PATH, {
          method: 'PATCH'
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(401);
      expect(updateListSection).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list whose section is being updated', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(false);

      const response = await PATCH(
        new Request(SECTION_PATH, {
          method: 'PATCH'
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(404);
      expect(updateListSection).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to update the section', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(
        new MemberRole(
          'NotListUpdater',
          'Does everything but update the list',
          {
            canAddItems: true,
            canUpdateItems: true,
            canDeleteItems: true,
            canManageTags: true,
            canManageAssignees: true,
            canManageMembers: true,
            canDeleteList: true
          }
        )
      );

      const response = await PATCH(
        new Request(SECTION_PATH, {
          method: 'PATCH'
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(403);
      expect(updateListSection).not.toHaveBeenCalled();
    });
  });
});

describe('DELETE', () => {
  test('Deletes the section when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(
      new MemberRole('ListUpdater', 'Updates the list and nothing else', {
        canUpdateList: true
      })
    );
    vi.mocked(deleteListSection).mockResolvedValue(true);

    const response = await DELETE(
      new Request(SECTION_PATH, {
        method: 'DELETE'
      }),
      { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
    );

    expect(response.status).toBe(200);
    expect(deleteListSection).toHaveBeenCalledExactlyOnceWith('section-id');
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await DELETE(
        new Request(SECTION_PATH, {
          method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(401);
      expect(deleteListSection).not.toHaveBeenCalled();
    });

    test('Indicates no resource exists if requestor is not a member of the list the deleted section is part of', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(false);

      const response = await DELETE(
        new Request(SECTION_PATH, {
          method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(404);
      expect(deleteListSection).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to delete the section', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByList).mockResolvedValue(
        new MemberRole(
          'NotListUpdater',
          'Does everything but update the list',
          {
            canAddItems: true,
            canUpdateItems: true,
            canDeleteItems: true,
            canManageTags: true,
            canManageAssignees: true,
            canManageMembers: true,
            canDeleteList: true
          }
        )
      );

      const response = await DELETE(
        new Request(SECTION_PATH, {
          method: 'DELETE'
        }),
        { params: Promise.resolve({ id: 'list-id', sectionId: 'section-id' }) }
      );

      expect(response.status).toBe(403);
      expect(deleteListSection).not.toHaveBeenCalled();
    });
  });
});

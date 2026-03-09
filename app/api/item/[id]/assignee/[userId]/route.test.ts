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

import { linkAssignee } from '@/lib/database/listItem';
import { getRoleByItem } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';

import { POST } from './route';

const MOCK_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MEMBER_PATH =
  `http://localhost/api/item/some-id/assignee/${MOCK_USER.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/listItem');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST', () => {
  test('Assigns a list member to an item when requestor has permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByItem).mockResolvedValue(
      new MemberRole(
        'AssigneeManager',
        'Manages assignees and does nothing else',
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false
      )
    );
    vi.mocked(linkAssignee).mockResolvedValue(true);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post'
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(linkAssignee).toHaveBeenCalledExactlyOnceWith(
      'some-list-id',
      MOCK_USER.id,
      expect.anything()
    );
  });

  describe('Errors', () => {
    test('Rejects unauthenticated users', async () => {
      vi.mocked(getUser).mockResolvedValue(false);

      const response = await POST(
        new Request(MEMBER_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-list-id',
            userId: MOCK_USER.id
          })
        }
      );

      expect(response.status).toBe(401);
      expect(linkAssignee).not.toHaveBeenCalled();
    });

    test("Indicates no resource exists if requestor is not a member of the list they're assigning an item on", async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(false);

      const response = await POST(
        new Request(MEMBER_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-list-id',
            userId: MOCK_USER.id
          })
        }
      );

      expect(response.status).toBe(404);
      expect(linkAssignee).not.toHaveBeenCalled();
    });

    test('Rejects request if requestor has insufficient permissions to assign', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole(
          'AssigneeManager',
          'Does everything but manage assignees',
          true,
          true,
          true,
          true,
          false,
          true,
          true,
          true
        )
      );

      const response = await POST(
        new Request(MEMBER_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-list-id',
            userId: MOCK_USER.id
          })
        }
      );

      expect(response.status).toBe(403);
      expect(linkAssignee).not.toHaveBeenCalled();
    });

    test('Informs the requestor if database update fails', async () => {
      vi.mocked(getUser).mockResolvedValue(MOCK_USER);
      vi.mocked(getRoleByItem).mockResolvedValue(
        new MemberRole(
          'AssigneeManager',
          'Manages assignees and does nothing else',
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false
        )
      );
      vi.mocked(linkAssignee).mockResolvedValue(false);

      const response = await POST(
        new Request(MEMBER_PATH, {
          method: 'post'
        }),
        {
          params: Promise.resolve({
            id: 'some-list-id',
            userId: MOCK_USER.id
          })
        }
      );

      expect(response.status).toBe(500);
    });
  });
});

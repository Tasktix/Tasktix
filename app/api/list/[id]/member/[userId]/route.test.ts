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
  deleteListMember,
  getIsListMember,
  updateListMember
} from '@/lib/database/list';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { getRoleByList } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';

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
const MOCK_ROLE_CAN_MANAGE_MEMBERS = new MemberRole(
  'MemberManager',
  ' Manages members and nothing else',
  { canManageMembers: true }
);
const MOCK_ROLE_CANNOT_MANAGE_MEMBERS = new MemberRole(
  'NotMemberManager',
  'Does everything but manage members',
  {
    canAddItems: true,
    canUpdateItems: true,
    canDeleteItems: true,
    canManageTags: true,
    canManageAssignees: true,
    canUpdateList: true,
    canDeleteList: true
  }
);
const MEMBER_PATH =
  `http://localhost/api/list/some-list-id/member/${MOCK_USER.id}` as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/database/user');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PATCH', () => {
  test('Allows updating the role a member has', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(true);
    vi.mocked(updateListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ roleId: 'a-16-chr-test-id' })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(updateListMember).toHaveBeenCalledExactlyOnceWith(
      'some-list-id',
      MOCK_USER.id,
      'a-16-chr-test-id'
    );
  });

  test('Rejects unauthenticated users', async () => {
    vi.mocked(getUser).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ canAdd: false })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(updateListMember).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  test('Rejects requests to modify lists not a member of', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ roleId: 'a-16-chr-test-id' })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(404);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests to update member with insufficient permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CANNOT_MANAGE_MEMBERS);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ roleId: 'a-16-chr-test-id' })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(403);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests to modify members not part of the list', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ roleId: 'a-16-chr-test-id' })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(404);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests with malformed bodies', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(true);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ invalidField: true })
      }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(400);
    expect(updateListMember).not.toHaveBeenCalled();
  });

  test('Warns the user if updating the member failed', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(true);
    vi.mocked(updateListMember).mockResolvedValue(false);

    const response = await PATCH(
      new Request(MEMBER_PATH, {
        method: 'patch',
        body: JSON.stringify({ roleId: 'a-16-chr-test-id' })
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

describe('DELETE', () => {
  test('Allows removing a member from the list', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(true);
    vi.mocked(deleteListMember).mockResolvedValue(true);

    const response = await DELETE(
      new Request(MEMBER_PATH, { method: 'delete' }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(200);
    expect(deleteListMember).toHaveBeenCalledExactlyOnceWith(
      'some-list-id',
      MOCK_USER.id
    );
  });

  test('Rejects unauthenticated users', async () => {
    vi.mocked(getUser).mockResolvedValue(false);

    const response = await DELETE(
      new Request(MEMBER_PATH, { method: 'delete' }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(deleteListMember).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  test('Rejects requests to modify lists not a member of', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(false);

    const response = await DELETE(
      new Request(MEMBER_PATH, { method: 'delete' }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(404);
    expect(deleteListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests to delete member with insufficient permissions', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CANNOT_MANAGE_MEMBERS);

    const response = await DELETE(
      new Request(MEMBER_PATH, { method: 'delete' }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(403);
    expect(deleteListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests to remove members not part of the list', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(false);

    const response = await DELETE(
      new Request(MEMBER_PATH, { method: 'delete' }),
      {
        params: Promise.resolve({
          id: 'some-list-id',
          userId: MOCK_USER.id
        })
      }
    );

    expect(response.status).toBe(404);
    expect(deleteListMember).not.toHaveBeenCalled();
  });

  test('Warns the user if deleting the member failed', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getIsListMember).mockResolvedValue(true);
    vi.mocked(deleteListMember).mockResolvedValue(false);

    const response = await DELETE(
      new Request(MEMBER_PATH, { method: 'delete' }),
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

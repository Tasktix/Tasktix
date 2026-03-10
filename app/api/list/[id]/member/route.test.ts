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

import { getIsListMember, createListMember } from '@/lib/database/list';
import User from '@/lib/model/user';
import { getUser } from '@/lib/session';
import { getRole, getRoleByList, getUserByUsername } from '@/lib/database/user';
import MemberRole from '@/lib/model/memberRole';

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
const MOCK_NEW_USER = new User(
  'abcdefg',
  'username',
  'email@example.com',
  false,
  new Date(),
  new Date(),
  { color: 'Amber' }
);
const MOCK_ROLE_CAN_VIEW = new MemberRole(
  'Viewer',
  'No explicit permissions',
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
);
const MOCK_ROLE_CAN_MANAGE_MEMBERS = new MemberRole(
  'ItemAdder',
  'Adds items and nothing else',
  false,
  false,
  false,
  false,
  false,
  true,
  false,
  false
);

const MEMBER_PATH = 'http://localhost/api/list/some-list-id/member' as const;

vi.mock('@/lib/session');
vi.mock('@/lib/database/list');
vi.mock('@/lib/database/user');
vi.mock('server-only', () => ({
  // Server Only Breaks test environemnt
}));
beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST', () => {
  test('Allows adding new members by username with some role', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getUserByUsername).mockResolvedValue(MOCK_NEW_USER);
    vi.mocked(getIsListMember).mockResolvedValue(false);
    vi.mocked(getRole).mockResolvedValue(MOCK_ROLE_CAN_VIEW);
    vi.mocked(createListMember).mockResolvedValue(true);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({
          username: MOCK_NEW_USER.username,
          roleId: MOCK_ROLE_CAN_VIEW.id
        })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(response.status).toBe(200);
    expect(createListMember).toHaveBeenCalledExactlyOnceWith('some-list-id', {
      user: MOCK_NEW_USER,
      role: MOCK_ROLE_CAN_VIEW
    });
  });

  test('Rejects unauthenticated users', async () => {
    vi.mocked(getUser).mockResolvedValue(false);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({ username: MOCK_NEW_USER.username })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(createListMember).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  test('Rejects requests to modify lists not a member of', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(false);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({ username: MOCK_NEW_USER.username })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(response.status).toBe(404);
    expect(createListMember).not.toHaveBeenCalled();
  });

  test("Rejects requests to add members that don't exist", async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getUserByUsername).mockResolvedValue(false);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({
          username: MOCK_NEW_USER.username,
          roleId: MOCK_ROLE_CAN_VIEW.id
        })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(response.status).toBe(404);
    expect(createListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests to add members already part of the list', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getUserByUsername).mockResolvedValue(MOCK_NEW_USER);
    vi.mocked(getIsListMember).mockResolvedValue(true);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({
          username: MOCK_NEW_USER.username,
          roleId: MOCK_ROLE_CAN_VIEW.id
        })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(response.status).toBe(409);
    expect(createListMember).not.toHaveBeenCalled();
  });

  test('Rejects requests with malformed bodies', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getUserByUsername).mockResolvedValue(MOCK_NEW_USER);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({ invalidField: true })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(response.status).toBe(400);
    expect(createListMember).not.toHaveBeenCalled();
  });

  test('Warns the user if updating the member failed', async () => {
    vi.mocked(getUser).mockResolvedValue(MOCK_USER);
    vi.mocked(getRoleByList).mockResolvedValue(MOCK_ROLE_CAN_MANAGE_MEMBERS);
    vi.mocked(getUserByUsername).mockResolvedValue(MOCK_NEW_USER);
    vi.mocked(getIsListMember).mockResolvedValue(false);
    vi.mocked(getRole).mockResolvedValue(MOCK_ROLE_CAN_VIEW);
    vi.mocked(createListMember).mockResolvedValue(false);

    const response = await POST(
      new Request(MEMBER_PATH, {
        method: 'post',
        body: JSON.stringify({
          username: MOCK_NEW_USER.username,
          roleId: MOCK_ROLE_CAN_VIEW.id
        })
      }),
      { params: Promise.resolve({ id: 'some-list-id' }) }
    );

    expect(response.status).toBe(500);
  });
});

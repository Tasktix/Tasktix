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
 *
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addToast, HeroUIProvider } from '@heroui/react';

import User from '@/lib/model/user';
import api from '@/lib/api';
import MemberRole from '@/lib/model/memberRole';
import ListMember from '@/lib/model/listMember';

import MemberSettings from '../MemberSettings';

vi.mock(import('@heroui/react'), async importOriginal => ({
  ...(await importOriginal()),
  addToast: vi.fn()
}));
vi.mock('@/lib/api');

beforeEach(() => {
  vi.resetAllMocks();
});

const users = [
  new User(
    'user1-id',
    'user1',
    'user1@example.com',
    false,
    new Date(),
    new Date(),
    { color: 'Violet' }
  ),
  new User(
    'user2-id',
    'user2',
    'user2@example.com',
    false,
    new Date(),
    new Date(),
    { color: 'Violet' }
  )
];
const MOCK_ROLE_CAN_VIEW = new MemberRole(
  'Viewer',
  'No explicit permissions',
  {}
);
const MOCK_ROLE_CAN_ADMIN = new MemberRole('Admin', 'All permissions', {
  canAddItems: true,
  canUpdateItems: true,
  canDeleteItems: true,
  canManageTags: true,
  canManageAssignees: true,
  canManageMembers: true,
  canUpdateList: true,
  canDeleteList: true
});

describe('Adding members', () => {
  it('Allows adding new members by entering their Email', async () => {
    const oldMember = { user: users[0], role: MOCK_ROLE_CAN_VIEW.id };
    const newMember = new ListMember(users[1], MOCK_ROLE_CAN_VIEW);

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: JSON.stringify(newMember)
    });
    const onMemberEvent = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByText } = render(
      // NOTE: must disable ripple to avoid dynamic import via ESM `import()`
      <HeroUIProvider disableRipple>
        <MemberSettings
          listId='list-id'
          members={new Map([[oldMember.user.id, oldMember]])}
          roles={new Map()}
          onMemberEvent={onMemberEvent}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('New member email')).toBeVisible();
    expect(getByText('Send Invite')).toBeVisible();

    await user.type(getByLabelText('New member email'), 'user2');
    await user.click(getByText('Send Invite'));

    expect(getByLabelText('New member email')).toHaveValue('');
    expect(onMemberEvent).toHaveBeenCalledTimes(1);
    expect(onMemberEvent).toHaveBeenCalledWith({
      type: 'AddMember',
      member: { ...newMember, role: MOCK_ROLE_CAN_VIEW.id }
    });
  });

  it('Displays an error message after adding a member if saving the new member fails', async () => {
    const oldMember = { user: users[0], role: MOCK_ROLE_CAN_VIEW.id };

    vi.mocked(api.post).mockRejectedValue(
      new Error('Server message about failure')
    );
    const onMemberEvent = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByText } = render(
      // NOTE: must disable ripple to avoid dynamic import via ESM `import()`
      <HeroUIProvider disableRipple>
        <MemberSettings
          listId='list-id'
          members={new Map([[oldMember.user.id, oldMember]])}
          roles={new Map()}
          onMemberEvent={onMemberEvent}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('New member email')).toBeVisible();
    expect(getByText('Send Invite')).toBeVisible();

    await user.type(getByLabelText('New member email'), 'user2');
    await user.click(getByText('Send Invite'));

    expect(getByLabelText('New member email')).toHaveValue('');
    expect(addToast).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({
      color: 'danger',
      title: 'Server message about failure'
    });
    expect(onMemberEvent).not.toHaveBeenCalled();
  });

  it("Displays an error message after adding a member if the server doesn't return the new member", async () => {
    const oldMember = { user: users[0], role: MOCK_ROLE_CAN_VIEW.id };

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const onMemberEvent = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByText } = render(
      // NOTE: must disable ripple to avoid dynamic import via ESM `import()`
      <HeroUIProvider disableRipple>
        <MemberSettings
          listId='list-id'
          members={new Map([[oldMember.user.id, oldMember]])}
          roles={new Map()}
          onMemberEvent={onMemberEvent}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('New member email')).toBeVisible();
    expect(getByText('Send Invite')).toBeVisible();

    await user.type(getByLabelText('New member email'), 'user2');
    await user.click(getByText('Send Invite'));

    expect(getByLabelText('New member email')).toHaveValue('');
    expect(addToast).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({
      color: 'danger',
      title: 'User added, but unable to display'
    });
    expect(onMemberEvent).not.toHaveBeenCalled();
  });
});

describe('Updating permissions', () => {
  it('Displays current list members', () => {
    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={
          new Map([
            [users[0].id, { user: users[0], role: MOCK_ROLE_CAN_VIEW.id }],
            [users[1].id, { user: users[1], role: MOCK_ROLE_CAN_VIEW.id }]
          ])
        }
        roles={new Map()}
        onMemberEvent={vi.fn()}
      />
    );

    expect(getByText('user1')).toBeVisible();
    expect(getByText('user2')).toBeVisible();
  });

  it("Correctly shows current members' permissions", () => {
    const { getByLabelText } = render(
      <MemberSettings
        listId='list-id'
        members={
          new Map([
            [users[0].id, { user: users[0], role: MOCK_ROLE_CAN_VIEW.id }],
            [users[1].id, { user: users[1], role: MOCK_ROLE_CAN_ADMIN.id }]
          ])
        }
        roles={
          new Map([
            [MOCK_ROLE_CAN_VIEW.id, MOCK_ROLE_CAN_VIEW],
            [MOCK_ROLE_CAN_ADMIN.id, MOCK_ROLE_CAN_ADMIN]
          ])
        }
        onMemberEvent={vi.fn()}
      />
    );

    expect(getByLabelText('user1 Role')).toBeVisible();
    expect(getByLabelText('user1 Role')).toHaveTextContent('Viewer');
    expect(getByLabelText('user2 Role')).toBeVisible();
    expect(getByLabelText('user2 Role')).toHaveTextContent('Admin');
  });

  it('Allows member role to be changed', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const onMemberEvent = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText } = render(
      <MemberSettings
        listId='list-id'
        members={
          new Map([
            [users[0].id, { user: users[0], role: MOCK_ROLE_CAN_VIEW.id }],
            [users[1].id, { user: users[1], role: MOCK_ROLE_CAN_VIEW.id }]
          ])
        }
        roles={
          new Map([
            [MOCK_ROLE_CAN_VIEW.id, MOCK_ROLE_CAN_VIEW],
            [MOCK_ROLE_CAN_ADMIN.id, MOCK_ROLE_CAN_ADMIN]
          ])
        }
        onMemberEvent={onMemberEvent}
      />
    );

    await user.click(getByLabelText('user1 Role'));
    await user.click(getByLabelText('Admin'));

    expect(onMemberEvent).toHaveBeenCalledTimes(1);
    expect(onMemberEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UpdateMemberPermissions',
        role: MOCK_ROLE_CAN_ADMIN.id
      })
    );
  });

  it('Does not allow member role being removed', async () => {
    const onMemberEvent = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByRole } = render(
      <MemberSettings
        listId='list-id'
        members={
          new Map([
            [users[0].id, { user: users[0], role: MOCK_ROLE_CAN_VIEW.id }],
            [users[1].id, { user: users[1], role: MOCK_ROLE_CAN_VIEW.id }]
          ])
        }
        roles={
          new Map([
            [MOCK_ROLE_CAN_VIEW.id, MOCK_ROLE_CAN_VIEW],
            [MOCK_ROLE_CAN_ADMIN.id, MOCK_ROLE_CAN_ADMIN]
          ])
        }
        onMemberEvent={onMemberEvent}
      />
    );

    await user.click(getByLabelText('user1 Role'));
    await user.click(getByRole('option', { name: 'Viewer' }));

    expect(onMemberEvent).not.toHaveBeenCalled();
  });
});

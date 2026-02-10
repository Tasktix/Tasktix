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
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addToast, HeroUIProvider } from '@heroui/react';

import ListMember from '@/lib/model/listMember';
import User from '@/lib/model/user';
import api from '@/lib/api';

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
  new User('user1', 'user1@example.com', 'football', new Date(), new Date(), {
    id: 'user1-id',
    color: 'Violet'
  }),
  new User('user2', 'user2@example.com', 'password', new Date(), new Date(), {
    id: 'user2-id',
    color: 'Violet'
  })
];

describe('Adding members', () => {
  it('Allows adding new members by entering their username', async () => {
    const oldMember = new ListMember(users[0], true, true, true, true);
    const newMember = new ListMember(users[1], false, false, false, false);

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: JSON.stringify(newMember)
    });
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByRole, getByText } = render(
      // NOTE: must disable ripple to avoid dynamic import via ESM `import()`
      <HeroUIProvider disableRipple>
        <MemberSettings
          listId='list-id'
          members={[oldMember]}
          setMembers={setMembers}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('Username...')).toBeVisible();
    expect(getByRole('button')).toBeVisible();

    await user.type(getByLabelText('Username...'), 'user2');
    await user.click(getByText('Send Invite'));

    expect(getByLabelText('Username...')).toHaveValue('');
    expect(setMembers).toHaveBeenCalledTimes(1);
    expect(setMembers).toHaveBeenCalledWith(
      expect.arrayContaining([oldMember, newMember])
    );
  });

  it('Displays an error message after adding a member if saving the new member fails', async () => {
    const oldMember = new ListMember(users[0], true, true, true, true);

    vi.mocked(api.post).mockRejectedValue(
      new Error('Server message about failure')
    );
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByRole, getByText } = render(
      // NOTE: must disable ripple to avoid dynamic import via ESM `import()`
      <HeroUIProvider disableRipple>
        <MemberSettings
          listId='list-id'
          members={[oldMember]}
          setMembers={setMembers}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('Username...')).toBeVisible();
    expect(getByRole('button')).toBeVisible();

    await user.type(getByLabelText('Username...'), 'user2');
    await user.click(getByText('Send Invite'));

    expect(getByLabelText('Username...')).toHaveValue('');
    expect(addToast).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({
      color: 'danger',
      title: 'Server message about failure'
    });
    expect(setMembers).not.toHaveBeenCalled();
  });

  it("Displays an error message after adding a member if the server doesn't return the new member", async () => {
    const oldMember = new ListMember(users[0], true, true, true, true);

    vi.mocked(api.post).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, getByRole, getByText } = render(
      // NOTE: must disable ripple to avoid dynamic import via ESM `import()`
      <HeroUIProvider disableRipple>
        <MemberSettings
          listId='list-id'
          members={[oldMember]}
          setMembers={setMembers}
        />
      </HeroUIProvider>
    );

    expect(getByLabelText('Username...')).toBeVisible();
    expect(getByRole('button')).toBeVisible();

    await user.type(getByLabelText('Username...'), 'user2');
    await user.click(getByText('Send Invite'));

    expect(getByLabelText('Username...')).toHaveValue('');
    expect(addToast).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({
      color: 'danger',
      title: 'User added, but unable to display'
    });
    expect(setMembers).not.toHaveBeenCalled();
  });
});

describe('Updating permissions', () => {
  it('Displays current list members', () => {
    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={[
          new ListMember(users[0], true, true, true, true),
          new ListMember(users[1], false, false, false, false)
        ]}
        setMembers={vi.fn()}
      />
    );

    expect(getByText('user1')).toBeVisible();
    expect(getByText('user2')).toBeVisible();
  });

  it("Correctly shows current members' permissions", () => {
    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={[
          new ListMember(users[0], true, true, true, true),
          new ListMember(users[1], false, false, false, false)
        ]}
        setMembers={vi.fn()}
      />
    );

    // Another test already assures the non-null assertion is okay - skipcq: JS-0339
    const user1Row = getByText('user1').closest('tr')!;
    const user1Checkboxes = within(user1Row).getAllByRole('checkbox');

    // Another test already assures the non-null assertion is okay - skipcq: JS-0339
    const user2Row = getByText('user2').closest('tr')!;
    const user2Checkboxes = within(user2Row).getAllByRole('checkbox');

    expect(user1Checkboxes[0]).toBeChecked();
    expect(user1Checkboxes[1]).toBeChecked();
    expect(user1Checkboxes[2]).toBeChecked();
    expect(user1Checkboxes[3]).toBeChecked();

    expect(user2Checkboxes[0]).not.toBeChecked();
    expect(user2Checkboxes[1]).not.toBeChecked();
    expect(user2Checkboxes[2]).not.toBeChecked();
    expect(user2Checkboxes[3]).not.toBeChecked();
  });

  it('Allows member add permission to be changed', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={[
          new ListMember(users[0], true, true, true, true),
          new ListMember(users[1], false, false, false, false)
        ]}
        setMembers={setMembers}
      />
    );

    // Another test already assures the non-null assertion is okay - skipcq: JS-0339
    const user1Row = getByText('user1').closest('tr')!;
    const user1Checkboxes = within(user1Row).getAllByRole('checkbox');

    await user.click(user1Checkboxes[0]);

    expect(setMembers).toHaveBeenCalledTimes(1);
    expect(setMembers).toHaveBeenCalledWith(
      expect.arrayContaining([
        new ListMember(users[0], false, true, true, true)
      ])
    );
  });

  it('Allows member remove permission to be changed', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={[
          new ListMember(users[0], true, true, true, true),
          new ListMember(users[1], false, false, false, false)
        ]}
        setMembers={setMembers}
      />
    );

    // Another test already assures the non-null assertion is okay - skipcq: JS-0339
    const user1Row = getByText('user1').closest('tr')!;
    const user1Checkboxes = within(user1Row).getAllByRole('checkbox');

    await user.click(user1Checkboxes[3]);

    expect(setMembers).toHaveBeenCalledTimes(1);
    expect(setMembers).toHaveBeenCalledWith(
      expect.arrayContaining([
        new ListMember(users[0], true, false, true, true)
      ])
    );
  });

  it('Allows member complete permission to be changed', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={[
          new ListMember(users[0], true, true, true, true),
          new ListMember(users[1], false, false, false, false)
        ]}
        setMembers={setMembers}
      />
    );

    // Another test already assures the non-null assertion is okay - skipcq: JS-0339
    const user1Row = getByText('user1').closest('tr')!;
    const user1Checkboxes = within(user1Row).getAllByRole('checkbox');

    await user.click(user1Checkboxes[2]);

    expect(setMembers).toHaveBeenCalledTimes(1);
    expect(setMembers).toHaveBeenCalledWith(
      expect.arrayContaining([
        new ListMember(users[0], true, true, false, true)
      ])
    );
  });

  it('Allows member assign permission to be changed', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const setMembers = vi.fn();
    const user = userEvent.setup();

    const { getByText } = render(
      <MemberSettings
        listId='list-id'
        members={[
          new ListMember(users[0], true, true, true, true),
          new ListMember(users[1], false, false, false, false)
        ]}
        setMembers={setMembers}
      />
    );

    // Another test already assures the non-null assertion is okay - skipcq: JS-0339
    const user1Row = getByText('user1').closest('tr')!;
    const user1Checkboxes = within(user1Row).getAllByRole('checkbox');

    await user.click(user1Checkboxes[1]);

    expect(setMembers).toHaveBeenCalledTimes(1);
    expect(setMembers).toHaveBeenCalledWith(
      expect.arrayContaining([
        new ListMember(users[0], true, true, true, false)
      ])
    );
  });
});

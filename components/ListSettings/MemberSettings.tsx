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
  addToast,
  Button,
  Input,
  Select,
  SelectItem,
  User
} from '@heroui/react';
import { SendPlus } from 'react-bootstrap-icons';
import { FormEvent, useState } from 'react';

import { getBackgroundColor } from '@/lib/color';
import ListMember from '@/lib/model/listMember';
import Role from '@/lib/model/role';
import api from '@/lib/api';

/**
 * Displays all list members and their permissions. Allows adding new members and updating
 * current members' permissions
 *
 * @param listId The list the members are for
 * @param members All members of the list
 * @param setMembers A callback for updating React state with changes to the members
 */
export default function MemberSettings({
  listId,
  members,
  setMembers
}: Readonly<{
  listId: string;
  members: ListMember[];
  setMembers: (members: ListMember[]) => unknown;
}>) {
  const [newUsername, setNewUsername] = useState('');

  const roles: Pick<Role, 'name' | 'description'>[] = [
    {
      name: 'Admin',
      description: 'Full access, including destructive actions'
    },
    {
      name: 'Manager',
      description: 'Manage tags, tasks, and members; cannot delete list'
    },
    {
      name: 'Product Owner',
      description: 'Manage tags and tasks, including assigning tasks'
    },
    {
      name: 'Collaborator',
      description: 'Add and update tasks, excluding assigning tasks'
    },
    {
      name: 'Stakeholder',
      description: 'Viewer permissions and add tasks'
    },
    { name: 'Viewer', description: 'Can only view current status' }
  ];

  function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewUsername('');

    api
      .post(`/list/${listId}/member`, { username: newUsername })
      .then(res => {
        if (!res.content) throw new Error('User added, but unable to display');

        const listMember = JSON.parse(res.content) as ListMember;

        listMember.user.createdAt = new Date(listMember.user.createdAt);
        listMember.user.updatedAt = new Date(listMember.user.updatedAt);

        setMembers([...members, listMember]);
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  function handleUpdatePermissions(
    userId: string,
    values: {
      canAdd?: boolean;
      canRemove?: boolean;
      canAssign?: boolean;
      canComplete?: boolean;
    }
  ) {
    api
      .patch(`/list/${listId}/member/${userId}`, values)
      .then(() => {
        setMembers(
          members.map(m =>
            m.user.id === userId
              ? new ListMember(
                  m.user,
                  values.canAdd ?? m.canAdd,
                  values.canRemove ?? m.canRemove,
                  values.canComplete ?? m.canComplete,
                  values.canAssign ?? m.canAssign
                )
              : m
          )
        );
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  return (
    <span className='flex flex-col gap-4 shrink overflow-y-auto'>
      <form className='flex gap-2' onSubmit={handleAddMember}>
        <Input
          placeholder='Username...'
          value={newUsername}
          onValueChange={setNewUsername}
        />
        <Button
          className='shrink-0'
          color='primary'
          type='submit'
          variant='ghost'
        >
          <SendPlus />
          Send Invite
        </Button>
      </form>
      {members.map(member => (
        <span key={member.user.id}>
          <User
            avatarProps={{
              classNames: {
                base: getBackgroundColor(member.user.color)
              },
              size: 'sm'
            }}
            name={member.user.username}
          />
          <Select label='Role' onSelectionChange={handleUpdatePermissions}>
            {roles.map(role => (
              <SelectItem key={role.name} description={role.description}>
                {role.name}
              </SelectItem>
            ))}
          </Select>
        </span>
      ))}
    </span>
  );
}

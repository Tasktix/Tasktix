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
  Selection,
  SelectItem,
  User
} from '@heroui/react';
import { SendPlus } from 'react-bootstrap-icons';
import { FormEvent, useState } from 'react';

import { getBackgroundColor } from '@/lib/color';
import ListMember from '@/lib/model/listMember';
import MemberRole from '@/lib/model/memberRole';
import api from '@/lib/api';
import { sortRolesByPermissions } from '@/lib/sort';

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
  roles,
  setMembers
}: Readonly<{
  listId: string;
  members: ListMember[];
  roles: Map<string, MemberRole>;
  setMembers: (members: ListMember[]) => unknown;
}>) {
  const [newUsername, setNewUsername] = useState('');

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

  function handleUpdatePermissions(userId: string, roleId: Selection) {
    let trueRoleId: string;

    if (roleId === 'all') {
      const id = roles.values().next().value?.id;

      if (!id) throw new Error('Unexpected empty set of possible roles');

      trueRoleId = id;
    } else {
      const id = roleId.keys().next().value;

      if (typeof id === 'number') throw new Error('Unexpected numeric key');
      if (!id) return; // User tried to clear selection

      trueRoleId = id;
    }

    api
      .patch(`/list/${listId}/member/${userId}`, { roleId })
      .then(() => {
        const role = roles.get(trueRoleId);

        if (!role) throw new Error(`Unable to find role ${trueRoleId}`);

        setMembers(
          members.map(m =>
            m.user.id === userId ? new ListMember(m.user, role) : m
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
          <Select
            label='Role'
            selectedKeys={[member.role.id]}
            onSelectionChange={handleUpdatePermissions.bind(
              null,
              member.user.id
            )}
          >
            {/* TODO: sort by permission level */}
            {Array.from(roles.values())
              .sort(sortRolesByPermissions)
              .map(role => (
                <SelectItem key={role.id} description={role.description}>
                  {role.name}
                </SelectItem>
              ))}
          </Select>
        </span>
      ))}
    </span>
  );
}

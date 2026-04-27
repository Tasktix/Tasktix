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
  Button,
  Input,
  Select,
  Selection,
  SelectItem,
  useDisclosure,
  User
} from '@heroui/react';
import { PersonPlusFill, PersonXFill } from 'react-bootstrap-icons';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getBackgroundColor } from '@/lib/color';
import ListMember from '@/lib/model/listMember';
import MemberRole from '@/lib/model/memberRole';
import api from '@/lib/api';
import { sortRolesByPermissions } from '@/lib/sort';
import { addToastForError } from '@/lib/error';
import UserModel from '@/lib/model/user';

import ConfirmModal from '../ConfirmModal';
import { FullState, ListMemberState, MemberAction } from '../List/types';
import { useAuth } from '../AuthProvider';

/**
 * Displays all list members and their permissions. Allows adding new members and updating
 * current members' permissions
 *
 * @param listId The list the members are for
 * @param members All members of the list
 * @param onMemberEvent A callback for updating React state with changes to the members
 */
export default function MemberSettings({
  listId,
  members,
  roles,
  onMemberEvent
}: Readonly<{
  listId: string;
  members: FullState['members'];
  roles: Map<string, MemberRole>;
  onMemberEvent: (event: MemberAction) => unknown;
}>) {
  return (
    <span className='flex flex-col gap-4 shrink overflow-y-auto'>
      <NewMember listId={listId} roles={roles} onMemberEvent={onMemberEvent} />

      {members.values().map(member => (
        <Member
          key={member.user.id}
          listId={listId}
          member={member}
          roles={roles}
          onMemberEvent={onMemberEvent}
        />
      ))}
    </span>
  );
}

function NewMember({
  roles,
  listId,
  onMemberEvent
}: Readonly<{
  roles: Map<string, MemberRole>;
  listId: string;
  onMemberEvent: (event: MemberAction) => unknown;
}>) {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newRole, setNewRole] = useState(roles.keys().next().value as string);

  function handleUpdateNewRole(roleId: Selection) {
    // roleId is always `Set<string>`: can't be `"all"` because the `<Select>` is
    // single-select; can't be `Set<number>` because all keys are role IDs, which are
    // strings
    const trueRoleId = (roleId as Set<string>).keys().next().value;

    // Purposeless to clear selection, so prevent to fix type issue
    if (!trueRoleId) return;

    setNewRole(trueRoleId);
  }

  function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewMemberEmail('');
    api
      .post(`/list/${listId}/member`, {
        email: newMemberEmail,
        roleId: newRole
      })
      .then(res => {
        if (!res.content) throw new Error('User added, but unable to display');

        const member = JSON.parse(res.content) as ListMember;

        member.user.createdAt = new Date(member.user.createdAt);
        member.user.updatedAt = new Date(member.user.updatedAt);

        onMemberEvent({
          type: 'AddMember',
          member: { ...member, role: member.role.id }
        });
      })
      .catch(addToastForError);
  }

  return (
    <form className='flex gap-2' onSubmit={handleAddMember}>
      <Input
        aria-label='New member email'
        placeholder='Email...'
        value={newMemberEmail}
        onValueChange={setNewMemberEmail}
      />
      <Select
        aria-label='New member role'
        selectedKeys={[newRole]}
        variant='underlined'
        onSelectionChange={handleUpdateNewRole}
      >
        {Array.from(roles.values())
          .sort(sortRolesByPermissions)
          .map(role => (
            <SelectItem key={role.id} description={role.description}>
              {role.name}
            </SelectItem>
          ))}
      </Select>
      <Button
        className='shrink-0'
        color='primary'
        type='submit'
        variant='ghost'
      >
        <PersonPlusFill />
        Add Member
      </Button>
    </form>
  );
}

function Member({
  listId,
  member,
  roles,
  onMemberEvent
}: Readonly<{
  listId: string;
  member: ListMemberState;
  roles: Map<string, MemberRole>;
  onMemberEvent: (event: MemberAction) => unknown;
}>) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { loggedInUser } = useAuth() as { loggedInUser: UserModel };
  const router = useRouter();

  function handleUpdatePermissions(roleId: Selection) {
    // roleId is always `Set<string>`: can't be `"all"` because the `<Select>` is
    // single-select; can't be `Set<number>` because all keys are role IDs, which are
    // strings
    const trueRoleId = (roleId as Set<string>).keys().next().value;

    if (!trueRoleId) return; // User tried to clear selection

    api
      .patch(`/list/${listId}/member/${member.user.id}`, { roleId: trueRoleId })
      .then(() => {
        // `trueRoleId` guaranteed to be a key in `roles` because the dropdown options, of
        // which `trueRoleId` is one, is generated based on the `roles`
        const role = roles.get(trueRoleId) as MemberRole;

        onMemberEvent({
          type: 'UpdateMemberPermissions',
          id: member.user.id,
          role: role.id
        });
      })
      .catch(addToastForError);
  }

  function handleRemoveMember() {
    api
      .delete(`/list/${listId}/member/${member.user.id}`)
      .then(() => {
        if (member.user.id === loggedInUser.id) {
          router.replace('/list');
        } else {
          onMemberEvent({ type: 'DeleteMember', id: member.user.id });
          onOpenChange(); // Closes the confirmation modal
        }
      })
      .catch(addToastForError);
  }

  return (
    <>
      <div key={member.user.id} className='flex gap-4'>
        <User
          avatarProps={{
            classNames: {
              base: getBackgroundColor(member.user.color)
            },
            size: 'sm'
          }}
          name={member.user.username ?? member.user.name}
        />
        <Select
          aria-label={`${member.user.username ?? member.user.name} Role`}
          selectedKeys={[member.role]}
          variant='underlined'
          onSelectionChange={handleUpdatePermissions}
        >
          {roles
            .values()
            .toArray()
            .sort(sortRolesByPermissions)
            .map(role => (
              <SelectItem key={role.id} description={role.description}>
                {role.name}
              </SelectItem>
            ))}
        </Select>
        <Button isIconOnly color='danger' variant='ghost' onPress={onOpen}>
          <PersonXFill
            aria-label={`Remove ${member.user.username ?? member.user.name}`}
          />
        </Button>
      </div>
      <ConfirmModal
        description='This action will unassign them from all tasks and revoke their access. This cannot be done if it would leave the list without an admin.'
        isOpen={isOpen}
        title={`Permanently remove ${member.user.name}?`}
        onConfirm={handleRemoveMember}
        onOpenChange={onOpenChange}
      />
    </>
  );
}

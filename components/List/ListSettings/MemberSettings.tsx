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

import { Button, Card, CardBody, Checkbox, Input, User } from '@heroui/react';
import { SendPlus } from 'react-bootstrap-icons';

import { getBackgroundColor } from '@/lib/color';
import ListMember from '@/lib/model/listMember';

export default function MemberSettings({ members }: { members: ListMember[] }) {
  return (
    <span className='flex flex-col gap-4 shrink overflow-y-auto'>
      <form className='flex gap-2'>
        <Input placeholder='Username...' />
        <Button className='shrink-0' color='primary' variant='ghost'>
          <SendPlus />
          Send Invite
        </Button>
      </form>
      <Card className='text-xs bg-warning/20 text-warning-600'>
        <CardBody>
          <p className='text-justify'>
            To protect users&apos; privacy and security, confirmation that an
            account is associated with the provided username will only be
            provided if the user accepts your invitation to join the list.{' '}
            <b>
              Double-check that you correctly spell the usernames before sending
              invites.
            </b>
          </p>
        </CardBody>
      </Card>
      <table className='mt-4 w-full overflow-scroll'>
        <tr>
          <th style={{ flexGrow: 2 }}>Member</th>
          <th className='grow font-normal'>Can Add</th>
          <th className='grow font-normal'>Can Assign</th>
          <th className='grow font-normal'>Can Complete</th>
          <th className='grow font-normal'>Can Remove</th>
        </tr>
        {members.map(member => (
          <tr key={member.user.id}>
            <td className='py-2'>
              <User
                avatarProps={{
                  classNames: {
                    base: getBackgroundColor(member.user.color)
                  },
                  size: 'sm'
                }}
                name={member.user.username}
              />
            </td>
            <td className='text-center py-2'>
              <Checkbox isSelected={member.canAdd} />
            </td>
            <td className='text-center py-2'>
              <Checkbox isSelected={member.canAssign} />
            </td>
            <td className='text-center py-2'>
              <Checkbox isSelected={member.canComplete} />
            </td>
            <td className='text-center py-2'>
              <Checkbox isSelected={member.canRemove} />
            </td>
          </tr>
        ))}
      </table>
    </span>
  );
}

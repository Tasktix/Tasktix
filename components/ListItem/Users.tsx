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
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { useState } from 'react';
import { PeopleFill, Plus, X } from 'react-bootstrap-icons';

import Assignee from '@/lib/model/assignee';
import { getBackgroundColor, getTextColor } from '@/lib/color';
import ListMember from '@/lib/model/listMember';
import { default as api } from '@/lib/api';

import { addSnackbar } from '../Snackbar';

export default function Users({
  itemId,
  assignees,
  members,
  isComplete,
  className
}: {
  itemId: string;
  assignees: Assignee[];
  members: ListMember[];
  isComplete: boolean;
  className?: string;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [_assignees, setAssignees] = useState(assignees);

  function addAssignee(userId: string) {
    api
      .post(`/item/${itemId}/assignee/${userId}`, {})
      .then(res => {
        addSnackbar(res.message, 'success');
        const newAssignees = structuredClone(_assignees);

        for (const member of members)
          if (member.user.id === userId)
            newAssignees.push(new Assignee(member.user, ''));
        setAssignees(newAssignees);
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function removeAssignee(userId: string) {
    api
      .delete(`/item/${itemId}/assignee/${userId}`)
      .then(res => {
        addSnackbar(res.message, 'success');
        const newAssignees = structuredClone(_assignees);

        for (let i = 0; i < newAssignees.length; i++)
          if (newAssignees[i].user.id === userId) newAssignees.splice(i, 1);
        setAssignees(newAssignees);
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  return (
    <Popover
      isOpen={isPopoverOpen}
      placement='bottom'
      onOpenChange={open => {
        if (!isComplete) setIsPopoverOpen(open);
      }}
    >
      <PopoverTrigger>
        <Card
          className={`px-4 basis-1/6 grow shrink flex flex-row items-center justify-start overflow-hidden flex-nowrap h-10 shadow-none cursor-pointer ${isComplete ? 'opacity-50 cursor-default' : 'hover:bg-foreground/10 focus:z-10 focus:outline-2 focus:outline-focus focus:outline-offset-2'} ${className}`}
          tabIndex={isComplete ? 1 : 0}
        >
          <PeopleFill className='shrink-0' />
          <AvatarGroup
            className={`ml-4 ${isComplete ? 'opacity-50' : ''}`}
            max={4}
          >
            {_assignees.map(assignee => (
              <Avatar
                key={assignee.user.id}
                classNames={{ base: getBackgroundColor(assignee.user.color) }}
                name={assignee.user.username ?? ''}
                size='sm'
              />
            ))}
          </AvatarGroup>
        </Card>
      </PopoverTrigger>
      <PopoverContent className='w-52'>
        {_assignees.map(assignee => (
          <div
            key={assignee.user.id}
            className={`${assignee.user.color ? getTextColor(assignee.user.color) : null} flex justify-between items-center w-full p-1.5`}
          >
            {assignee.user.username}
            <Button
              isIconOnly
              className='rounded-lg w-8 h-8 min-w-8 min-h-8'
              color='danger'
              variant='flat'
              onPress={removeAssignee.bind(null, assignee.user.id)}
            >
              <X />
            </Button>
          </div>
        ))}
        {members.map(member => {
          if (_assignees.some(assignee => assignee.user.id === member.user.id))
            return null;

          return (
            <div
              key={member.user.id}
              className={`${getTextColor(member.user.color)} flex justify-between items-center w-full p-1.5`}
            >
              {member.user.username}
              <Button
                isIconOnly
                className='rounded-lg w-8 h-8 min-w-8 min-h-8'
                color='primary'
                variant='flat'
                onPress={addAssignee.bind(null, member.user.id)}
              >
                <Plus />
              </Button>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

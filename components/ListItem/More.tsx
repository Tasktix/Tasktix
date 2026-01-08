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
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure
} from '@heroui/react';
import { ThreeDots, TrashFill } from 'react-bootstrap-icons';

import { NamedColor } from '@/lib/model/color';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';
import ListMember from '@/lib/model/listMember';

import DateInput2 from '../DateInput2';
import ConfirmedTextInput from '../ConfirmedTextInput';

import { itemHandlerFactory } from './handlerFactory';
import Priority from './Priority';
import Tags from './Tags';
import Users from './Users';
import ExpectedInput from './ExpectedInput';
import ElapsedInput from './ElapsedInput';
import TimeButton from './TimeButton';
import { SetItem } from './types';

export default function More({
  item,
  tags,
  tagsAvailable,
  members,
  hasDueDates,
  hasTimeTracking,
  elapsedLive,
  set,
  itemHandlers,
  addNewTag
}: {
  item: ListItem;
  tags: Tag[];
  tagsAvailable: Tag[];
  members: ListMember[];
  hasDueDates: boolean;
  hasTimeTracking: boolean;
  elapsedLive: number;
  set: SetItem;
  itemHandlers: ReturnType<typeof itemHandlerFactory>;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}) {
  const isComplete = item.status === 'Completed';

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button isIconOnly variant='ghost' onPress={onOpen}>
        <ThreeDots />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='justify-center'>Details</ModalHeader>

              <ModalBody className='gap-4 py-4'>
                <div className='flex gap-4 items-center'>
                  <Checkbox
                    isSelected={isComplete}
                    tabIndex={0}
                    onChange={e => {
                      if (e.target.checked) itemHandlers.setComplete();
                      else itemHandlers.setIncomplete();
                    }}
                  />
                  <span className='flex grow'>
                    <ConfirmedTextInput
                      showLabel
                      disabled={isComplete}
                      updateValue={itemHandlers.setName}
                      value={item.name}
                      variant='underlined'
                    />
                  </span>
                </div>
                <div className='flex gap-4 items-center'>
                  <Priority
                    className='w-full'
                    isComplete={isComplete}
                    priority={item.priority}
                    setPriority={itemHandlers.setPriority}
                    wrapperClassName='!my-0 w-1/2'
                  />
                  {hasDueDates ? (
                    <DateInput2
                      className='w-1/2'
                      color='primary'
                      disabled={isComplete}
                      label='Due date'
                      value={item.dateDue || undefined}
                      variant='underlined'
                      onValueChange={itemHandlers.setDueDate}
                    />
                  ) : null}
                </div>

                <Tags
                  addNewTag={addNewTag}
                  className='py-2'
                  isComplete={item.status === 'Completed'}
                  linkTag={itemHandlers.linkTag}
                  tags={tags}
                  tagsAvailable={tagsAvailable}
                  unlinkTag={itemHandlers.unlinkTag}
                />

                {members.length > 1 ? (
                  <Users
                    assignees={item.assignees}
                    className='py-2'
                    isComplete={isComplete}
                    itemId={item.id}
                    members={members}
                  />
                ) : null}

                <div className='flex gap-6 justify-end'>
                  {hasTimeTracking ? (
                    <>
                      <span
                        className={`flex gap-6 ${isComplete ? 'opacity-50' : ''}`}
                      >
                        <ExpectedInput
                          disabled={isComplete}
                          ms={item.expectedMs}
                          updateMs={itemHandlers.setExpectedMs}
                        />
                        <span className='border-r-1 border-content3' />
                        <ElapsedInput
                          disabled={isComplete}
                          ms={elapsedLive}
                          resetTime={set.resetTime}
                        />
                      </span>
                      <TimeButton
                        pauseRunning={set.pausedRunning}
                        startRunning={set.startedRunning}
                        status={item.status}
                      />
                    </>
                  ) : null}
                  <Button
                    color='danger'
                    variant='ghost'
                    onPress={() => {
                      onClose();
                      itemHandlers.deleteSelf();
                    }}
                  >
                    <TrashFill />
                    Delete
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

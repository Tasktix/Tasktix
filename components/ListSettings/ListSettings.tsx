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
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure
} from '@heroui/react';
import { GearWideConnected } from 'react-bootstrap-icons';
import { ActionDispatch } from 'react';

import { NamedColor } from '@/lib/model/color';
import {
  ListAction,
  ListState,
  MemberAction,
  TagAction
} from '@/components/List/types';

import GeneralSettings from './GeneralSettings';
import MemberSettings from './MemberSettings';
import TagSettings from './TagSettings';

/**
 * Displays and allows a variety of list-wide settings to be changed, including the list
 * name, whether certain features are enabled, members with access to the list and their
 * permissions, and tags that list items can have.
 *
 * @param list All data for the list
 * @param addNewTag A callback for adding a tag to the list
 * @param onListEvent A callback for updating React state with list events
 * @param onListNameChange A callback for updating React state with a new list name,
 *  including handling the API call
 */
export default function ListSettings({
  list,
  addNewTag,
  onListEvent,
  onListNameChange
}: Readonly<{
  list: Omit<ListState, 'items' | 'sections'>;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
  onListEvent: ActionDispatch<[action: ListAction | MemberAction | TagAction]>;
  onListNameChange: (name: string) => unknown;
}>) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        isIconOnly
        className='bg-content1 shadow-lg shadow-content2'
        size='lg'
        variant='ghost'
        onPress={onOpen}
      >
        <GearWideConnected aria-label='Settings' size={20} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className='h-1/2'>
          <ModalHeader className='justify-center pb-0'>
            List Settings
          </ModalHeader>
          <ModalBody className='overflow-clip'>
            <Tabs aria-label='Options' variant='underlined'>
              <Tab
                className='flex flex-col gap-4 grow justify-between'
                title='General'
              >
                <GeneralSettings
                  hasDueDates={list.hasDueDates}
                  hasTimeTracking={list.hasTimeTracking}
                  isAutoOrdered={list.isAutoOrdered}
                  listColor={list.color}
                  listId={list.id}
                  listName={list.name}
                  setListName={onListNameChange}
                />
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Members'
              >
                <MemberSettings
                  listId={list.id}
                  members={list.members}
                  onMemberEvent={onListEvent}
                />
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Tags'
              >
                <TagSettings
                  addNewTag={addNewTag}
                  listId={list.id}
                  tags={list.tags}
                  onTagEvent={onListEvent}
                />
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

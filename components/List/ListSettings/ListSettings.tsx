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

import Tag from '@/lib/model/tag';
import { NamedColor } from '@/lib/model/color';
import ListMember from '@/lib/model/listMember';

import GeneralSettings from './GeneralSettings';
import MemberSettings from './MemberSettings';
import TagSettings from './TagSettings';

export default function ListSettings({
  listId,
  members,
  listName,
  listColor,
  tagsAvailable,
  hasTimeTracking,
  isAutoOrdered,
  hasDueDates,
  setListName,
  setListColor,
  setTagsAvailable,
  setHasTimeTracking,
  setHasDueDates,
  setIsAutoOrdered,
  addNewTag
}: {
  listId: string;
  members: ListMember[];
  listName: string;
  listColor: NamedColor;
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  setListName: (name: string) => unknown;
  setListColor: (color: NamedColor) => unknown;
  setTagsAvailable: (value: Tag[]) => unknown;
  setHasTimeTracking: (value: boolean) => unknown;
  setHasDueDates: (value: boolean) => unknown;
  setIsAutoOrdered: (value: boolean) => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}) {
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
                  hasDueDates={hasDueDates}
                  hasTimeTracking={hasTimeTracking}
                  isAutoOrdered={isAutoOrdered}
                  listColor={listColor}
                  listId={listId}
                  listName={listName}
                  setHasDueDates={setHasDueDates}
                  setHasTimeTracking={setHasTimeTracking}
                  setIsAutoOrdered={setIsAutoOrdered}
                  setListColor={setListColor}
                  setListName={setListName}
                />
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Members'
              >
                <MemberSettings members={members} />
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Tags'
              >
                <TagSettings
                  addNewTag={addNewTag}
                  listId={listId}
                  setTagsAvailable={setTagsAvailable}
                  tagsAvailable={tagsAvailable}
                />
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

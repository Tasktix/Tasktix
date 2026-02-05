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

import Tag from '@/lib/model/tag';
import { NamedColor } from '@/lib/model/color';
import ListMember from '@/lib/model/listMember';
import { ListAction } from '@/components/List/types';

import GeneralSettings from './GeneralSettings';
import MemberSettings from './MemberSettings';
import TagSettings from './TagSettings';

/**
 * Displays and allows a variety of list-wide settings to be changed, including the list
 * name, whether certain features are enabled, members with access to the list and their
 * permissions, and tags that list items can have.
 *
 * @param listId The list the settings are for
 * @param members All members of the list
 * @param listName The list's current name
 * @param listColor The list's current color
 * @param tagsAvailable All tags currently part of the list
 * @param hasTimeTracking Whether time tracking is currently enabled for the list
 * @param isAutoOrdered Whether auto-ordering is currently enabled for the list
 * @param hasDueDates Whether due dates are currently enabled for the list
 * @param setListName A callback for updating React state with a new list name
 * @param setListColor A callback for updating React state with a new list color
 * @param setTagsAvailable A callback for updating React state with changes to the tags
 * @param setHasTimeTracking A callback for updating React state when time tracking is
 *  toggled
 * @param setHasDueDates A callback for updating React state when due dates are toggled
 * @param setIsAutoOrdered A callback for updating React state when auto-ordering is
 *  toggled
 * @param setMembers A callback for updating React state with changes to the members
 * @param addNewTag A callback for adding a tag to the list
 */
export default function ListSettings({
  listId,
  members,
  listName,
  listColor,
  tagsAvailable,
  hasTimeTracking,
  isAutoOrdered,
  hasDueDates,
  dispatchList,
  addNewTag,
  setListName
}: Readonly<{
  listId: string;
  members: ListMember[];
  listName: string;
  listColor: NamedColor;
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  dispatchList: ActionDispatch<[action: ListAction]>;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
  setListName: (name: string) => unknown;
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
                  dispatchList={dispatchList}
                  hasDueDates={hasDueDates}
                  hasTimeTracking={hasTimeTracking}
                  isAutoOrdered={isAutoOrdered}
                  listColor={listColor}
                  listId={listId}
                  listName={listName}
                  setListName={setListName}
                />
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Members'
              >
                <MemberSettings
                  listId={listId}
                  members={members}
                  setMembers={members =>
                    dispatchList({ type: 'SetMembers', members })
                  }
                />
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Tags'
              >
                <TagSettings
                  addNewTag={addNewTag}
                  listId={listId}
                  setTagsAvailable={tags =>
                    dispatchList({ type: 'SetTagsAvailable', tags })
                  }
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

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

import { ActionDispatch, useState } from 'react';
import {
  ChevronContract,
  ChevronExpand,
  ThreeDots,
  TrashFill
} from 'react-bootstrap-icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';

import AddItem from '@/components/ListSection/AddItem';
import { NamedColor } from '@/lib/model/color';
import Tag from '@/lib/model/tag';
import ListMember from '@/lib/model/listMember';

import { ItemAction, ListSectionState, SectionAction } from '../List';
import { Filters } from '../SearchBar/types';
import ConfirmedTextInput from '../ConfirmedTextInput';

import SectionBody from './SectionBody';
import sectionHandlerFactory from './handlerFactory';

/**
 * Provides the container for a section of the list, grouping items & allowing items to be
 * added specifically to this section
 *
 * @param listId The ID of the list this section belongs to
 * @param filters The filters currently active on the list that should limit which items
 *  are rendered
 * @param members The users who have access to the list
 * @param tagsAvailable The tags that belong to the list
 * @param hasTimeTracking Whether time tracking is enabled in the list's settings
 * @param hasDueDates Whether due dates are enabled in the list's settings
 * @param isAutoOrdered Whether auto-ordering is enabled in the list's settings
 * @param section All data for the section to render
 * @param dispatchSectionChange Callback to propagate state changes for the list section
 * @param dispatchItemChange Callback to propagate state changes for an item in the list
 *  section
 * @param onTagCreate Callback to propagate state changes when a new tag is created from
 *  the "add tag" menu
 */
export default function ListSection({
  listId,
  filters,
  members,
  tagsAvailable,
  hasTimeTracking,
  hasDueDates,
  isAutoOrdered,
  section,
  dispatchSectionChange,
  dispatchItemChange,
  onTagCreate
}: {
  listId: string;
  filters: Filters;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  section: ListSectionState;
  dispatchSectionChange: ActionDispatch<[action: SectionAction]>;
  dispatchItemChange: ActionDispatch<[action: ItemAction]>;
  onTagCreate: (name: string, color: NamedColor) => Promise<string>;
}) {
  const [isCollapsed, setIsCollapsed] = useState(
    !section.items
      .values()
      .reduce((prev, curr) => prev || curr.status !== 'Completed', false)
  );

  const sectionHandlers = sectionHandlerFactory(
    listId,
    section.id,
    dispatchSectionChange
  );

  return (
    <div className='rounded-md w-full overflow-hidden border-2 border-content3 box-border shrink-0 shadow-lg shadow-content2'>
      <div className='bg-content3 font-bold p-4 h-16 flex items-center justify-between'>
        <span className='min-w-fit shrink-0 flex'>
          <Button
            isIconOnly
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            className='hover:bg-foreground/10 -ml-2 mr-2'
            onPress={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronExpand /> : <ChevronContract />}
          </Button>
          <ConfirmedTextInput
            className='mt-0.5'
            classNames={{ input: 'text-md' }}
            updateValue={() => null}
            value={section.name}
            variant='underlined'
          />
        </span>
        <span className='flex gap-4'>
          <AddItem
            addItem={item => {
              setIsCollapsed(false);
              dispatchSectionChange({
                type: 'AddItemToSection',
                sectionId: section.id,
                item
              });
            }}
            hasDueDates={hasDueDates}
            hasTimeTracking={hasTimeTracking}
            nextIndex={section.items.size}
            sectionId={section.id}
          />
          <Dropdown placement='bottom'>
            <DropdownTrigger>
              <Button
                isIconOnly
                aria-label='Show section actions'
                className='border-2 border-content4 hover:bg-content4!'
                variant='light'
              >
                <ThreeDots />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              onAction={() =>
                dispatchSectionChange({ type: 'DeleteSection', id: section.id })
              }
            >
              <DropdownItem
                key='delete'
                aria-label='Delete section'
                className='text-danger'
                color='danger'
                startContent={<TrashFill />}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </span>
      </div>
      <AnimatePresence initial={isCollapsed}>
        {isCollapsed || (
          <motion.section
            key='content'
            animate='open'
            exit='collapsed'
            initial='collapsed'
            transition={{ duration: 0.25 }}
            variants={{
              open: { height: 'auto' },
              collapsed: { height: 0 }
            }}
          >
            <SectionBody
              addNewTag={onTagCreate}
              dispatchItemChange={dispatchItemChange}
              filters={filters}
              hasDueDates={hasDueDates}
              hasTimeTracking={hasTimeTracking}
              isAutoOrdered={isAutoOrdered}
              items={section.items}
              members={members}
              reorderItem={sectionHandlers.reorderItem}
              sectionId={section.id}
              tagsAvailable={tagsAvailable}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

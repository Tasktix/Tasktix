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

import { useReducer } from 'react';
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
import ListItemModel from '@/lib/model/listItem';
import { NamedColor } from '@/lib/model/color';
import Tag from '@/lib/model/tag';
import ListMember from '@/lib/model/listMember';
import { sortItemsByCompleted, sortItemsByIndex } from '@/lib/sortItems';

import { Filters } from '../SearchBar/types';
import ConfirmedTextInput from '../ConfirmedTextInput';

import SectionBody from './SectionBody';
import { Item } from './types';
import sectionReducer from './sectionReducer';
import sectionHandlerFactory from './handlerFactory';

/**
 * Provides the container for a section of the list, grouping items & allowing items to be
 * added specifically to this section
 *
 * @param id This section's ID
 * @param listId The ID of the list this section belongs to
 * @param name The section's name
 * @param startingItems The items that belong to this section when the page first loads
 * @param filters The filters currently active on the list that should limit which items
 *  are rendered
 * @param members The users who have access to the list
 * @param tagsAvailable The tags that belong to the list
 * @param hasTimeTracking Whether time tracking is enabled in the list's settings
 * @param hasDueDates Whether due dates are enabled in the list's settings
 * @param isAutoOrdered Whether auto-ordering is enabled in the list's settings
 * @param currentSection The section this item is currently associated with
 * @param totalSections A total list of sections in the larger list
 * @param onDelete Callback to delete a section and remove it from React's state
 * @param onTagCreate Callback to propagate state changes when a new tag is created from
 *  the "add tag" menu
 */
export default function ListSection({
  id,
  listId,
  name,
  startingItems,
  filters,
  members,
  tagsAvailable,
  hasTimeTracking,
  hasDueDates,
  isAutoOrdered,
  currentSection,
  totalSections,
  onDelete,
  onTagCreate
}: {
  id: string;
  listId: string;
  name: string;
  startingItems: ListItemModel[];
  filters: Filters;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  currentSection: string;
  totalSections: string[];
  onDelete: () => unknown;
  onTagCreate: (name: string, color: NamedColor) => Promise<string>;
}) {
  const [{ items, isCollapsed }, dispatchSection] = useReducer(sectionReducer, {
    items: itemsToMap(
      startingItems.sort(sortItemsByIndex).sort(sortItemsByCompleted)
    ),
    isCollapsed: !startingItems.reduce(
      (prev, curr) => prev || curr.status !== 'Completed',
      false
    )
  });

  const sectionHandlers = sectionHandlerFactory(
    listId,
    id,
    items,
    dispatchSection
  );

  return (
    <div className='rounded-md w-full overflow-hidden border-2 border-content3 box-border shrink-0 shadow-lg shadow-content2'>
      <div className='bg-content3 font-bold p-4 h-16 flex items-center justify-between'>
        <span className='min-w-fit shrink-0 flex'>
          <Button
            isIconOnly
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            className='hover:bg-foreground/10 -ml-2 mr-2'
            onPress={() =>
              dispatchSection({
                type: 'SetIsCollapsed',
                isCollapsed: !isCollapsed
              })
            }
          >
            {isCollapsed ? <ChevronExpand /> : <ChevronContract />}
          </Button>
          <ConfirmedTextInput
            className='mt-0.5'
            classNames={{ input: 'text-md' }}
            updateValue={() => null}
            value={name}
            variant='underlined'
          />
        </span>
        <span className='flex gap-4'>
          <AddItem
            addItem={item => dispatchSection({ type: 'AddItem', item })}
            hasDueDates={hasDueDates}
            hasTimeTracking={hasTimeTracking}
            nextIndex={items.size}
            sectionId={id}
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
            <DropdownMenu onAction={onDelete}>
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
              currentSection={currentSection}
              dispatchSection={dispatchSection}
              filters={filters}
              hasDueDates={hasDueDates}
              hasTimeTracking={hasTimeTracking}
              isAutoOrdered={isAutoOrdered}
              items={items}
              members={members}
              reorderItem={sectionHandlers.reorderItem}
              setItems={items => dispatchSection({ type: 'SetItems', items: itemsToMap(items) })}
              tagsAvailable={tagsAvailable}         
              totalSections={totalSections}   />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Converts a list of items to a map of items for easy access via the item's ID. Also adds
 * the `visualIndex` property as documented on `interface Item`
 *
 * @param items The list of items to convert to a map
 */
function itemsToMap(items: ListItemModel[]): Map<string, Item> {
  return new Map(
    items.map((item, i) => [
      item.id,
      { ...structuredClone(item), visualIndex: i }
    ])
  );
}

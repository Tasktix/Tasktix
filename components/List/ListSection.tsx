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

import { useState } from 'react';
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
} from '@nextui-org/react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';

import { ListItem, StaticListItem } from '@/components/ListItem';
import AddItem from '@/components/List/AddItem';
import ListItemModel from '@/lib/model/listItem';
import { NamedColor } from '@/lib/model/color';
import Tag from '@/lib/model/tag';
import {
  sortItems,
  sortItemsByCompleted,
  sortItemsByIndex
} from '@/lib/sortItems';
import ListMember from '@/lib/model/listMember';
import { default as api } from '@/lib/api';

import { addSnackbar } from '../Snackbar';
import { Filters } from '../SearchBar/types';
import ConfirmedTextInput from '../ConfirmedTextInput';

interface Item extends ListItemModel {
  visualIndex?: number;
}

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
  deleteSection,
  addNewTag
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
  deleteSection: () => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}) {
  // TODO: Update to use hashmap: don't iterate over every value when finding the right one to modify
  const [items, setItems] = useState<Item[]>(
    startingItems
      .sort(sortItemsByIndex)
      .sort(sortItemsByCompleted)
      .map((item, i) => {
        const newItem: Item = structuredClone(item);

        newItem.visualIndex = i;

        return newItem;
      })
  );

  const [isCollapsed, setIsCollapsed] = useState(
    !items.reduce((prev, curr) => prev || curr.status !== 'Completed', false)
  );

  function setStatus(
    id: string,
    status: ListItemModel['status'],
    dateCompleted?: ListItemModel['dateCompleted']
  ) {
    const newItems = structuredClone(items);

    for (const item of newItems)
      if (item.id === id) {
        item.status = status;
        if (dateCompleted !== undefined) item.dateCompleted = dateCompleted;
      }
    setItems(newItems);
  }

  function updateExpectedMs(id: string, ms: number) {
    const newItems = structuredClone(items);

    for (const item of newItems) if (item.id === id) item.expectedMs = ms;
    setItems(newItems);
  }

  function updatePriority(id: string, priority: ListItemModel['priority']) {
    const newItems = structuredClone(items);

    for (const item of newItems) if (item.id === id) item.priority = priority;
    setItems(newItems);
  }

  function updateDueDate(id: string, date: Date) {
    const newItems = structuredClone(items);

    for (const item of newItems) if (item.id === id) item.dateDue = date;
    setItems(newItems);
  }

  function addItem(item: ListItemModel) {
    const newItems = structuredClone(items);

    newItems.push(item);
    setItems(newItems);
    setIsCollapsed(false);
  }

  function reorderItem(item: ListItemModel, lastVisualIndex: number) {
    const index = items.findIndex(i => i.id === item.id);

    if (index === lastVisualIndex) return;

    const oldIndex = item.sectionIndex;
    const newIndex =
      index > lastVisualIndex
        ? items[index - 1].sectionIndex
        : items[index + 1].sectionIndex;

    if (newIndex === oldIndex) return;

    api
      .patch(`/list/${listId}/section/${id}/item`, {
        itemId: item.id,
        index: newIndex,
        oldIndex: oldIndex
      })
      .then(res => {
        addSnackbar(res.message, 'success');

        const index1 = Math.min(newIndex, oldIndex);
        const index2 = Math.max(newIndex, oldIndex);
        const newItems = structuredClone(items);

        for (let i = 0; i < newItems.length; i++) {
          newItems[i].visualIndex = i;
          if (
            newItems[i].sectionIndex >= index1 &&
            newItems[i].sectionIndex <= index2
          )
            newItems[i].sectionIndex += oldIndex > newIndex ? 1 : -1;
          if (newItems[i].id === item.id) newItems[i].sectionIndex = newIndex;
        }
        setItems(newItems);
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function deleteItem(id: string) {
    const newItems = structuredClone(items);

    for (let i = 0; i < newItems.length; i++)
      if (newItems[i].id === id) newItems.splice(i, 1);
    setItems(newItems);
  }

  return (
    <div className='rounded-md w-100 overflow-hidden border-2 border-content3 box-border shrink-0 shadow-lg shadow-content2'>
      <div className='bg-content3 font-bold p-4 h-16 flex items-center justify-between'>
        <span className='min-w-fit shrink-0 flex'>
          <Button
            isIconOnly
            className='hover:bg-foreground/10 -ml-2 mr-2'
            onPress={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronExpand /> : <ChevronContract />}
          </Button>
          <ConfirmedTextInput
            className='mt-0.5'
            classNames={{ input: 'text-md' }}
            name={name}
            updateName={() => null}
            variant='underlined'
          />
        </span>
        <span className='flex gap-4'>
          <AddItem
            addItem={addItem}
            hasDueDates={hasDueDates}
            hasTimeTracking={hasTimeTracking}
            nextIndex={items.length}
            sectionId={id}
          />
          <Dropdown placement='bottom'>
            <DropdownTrigger>
              <Button
                isIconOnly
                className='border-2 border-content4 hover:!bg-content4'
                variant='light'
              >
                <ThreeDots />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              onAction={key => {
                if (key === 'delete') deleteSection();
              }}
            >
              <DropdownItem
                key='delete'
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
            {isAutoOrdered ? (
              items
                .filter(item => checkItemFilter(item, filters))
                .sort(sortItems.bind(null, hasTimeTracking, hasDueDates))
                .map(item => (
                  <StaticListItem
                    key={item.id}
                    addNewTag={addNewTag}
                    deleteItem={deleteItem.bind(null, item.id)}
                    hasDueDates={hasDueDates}
                    hasTimeTracking={hasTimeTracking}
                    item={item}
                    members={members}
                    setCompleted={setStatus.bind(null, item.id, 'Completed')}
                    setPaused={() => setStatus(item.id, 'Paused')}
                    setStatus={setStatus.bind(null, item.id)}
                    tagsAvailable={tagsAvailable}
                    updateDueDate={updateDueDate.bind(null, item.id)}
                    updateExpectedMs={updateExpectedMs.bind(null, item.id)}
                    updatePriority={updatePriority.bind(null, item.id)}
                  />
                ))
            ) : (
              <Reorder.Group
                axis='y'
                values={items}
                onReorder={items => setItems(items.sort(sortItemsByCompleted))}
              >
                {items
                  .filter(item => checkItemFilter(item, filters))
                  .map(item => (
                    <ListItem
                      key={item.id}
                      addNewTag={addNewTag}
                      deleteItem={deleteItem.bind(null, item.id)}
                      hasDueDates={hasDueDates}
                      hasTimeTracking={hasTimeTracking}
                      item={item}
                      members={members}
                      reorder={reorderItem.bind(
                        null,
                        item,
                        item.visualIndex || 0
                      )}
                      setCompleted={setStatus.bind(null, item.id, 'Completed')}
                      setPaused={() => setStatus(item.id, 'Paused')}
                      setStatus={setStatus.bind(null, item.id)}
                      tagsAvailable={tagsAvailable}
                      updateDueDate={updateDueDate.bind(null, item.id)}
                      updateExpectedMs={updateExpectedMs.bind(null, item.id)}
                      updatePriority={updatePriority.bind(null, item.id)}
                    />
                  ))}
              </Reorder.Group>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function checkItemFilter(item: ListItemModel, filters: Filters): boolean {
  for (const key in filters)
    if (!compareFilter(item, key, filters[key])) return false;

  return true;
}

function compareFilter(
  item: ListItemModel,
  key: string,
  value: unknown
): boolean {
  if (value === undefined) return false;

  switch (key) {
    case 'name':
      return value === item.name;

    case 'priority':
      return value instanceof Set && value.has(item.priority);

    case 'tag':
      return (
        value instanceof Set &&
        item.tags
          .map(curr => value.has(curr.name))
          .reduce((prev: boolean, curr: boolean) => prev || curr, false)
      );

    case 'user':
      return (
        value instanceof Set &&
        item.assignees
          .map(curr => value.has(curr.user.username))
          .reduce((prev: boolean, curr: boolean) => prev || curr, false)
      );

    case 'status':
      return value instanceof Set && value.has(item.status);

    case 'completedBefore':
      if (value instanceof Date) value.setHours(0, 0, 0, 0);

      return (
        item.dateCompleted !== null &&
        value instanceof Date &&
        value.getTime() > item.dateCompleted.getTime()
      );
    case 'completedOn':
      if (!(value instanceof Date)) return false;

      const start = structuredClone(value);
      const end = structuredClone(value);

      if (start && end && value instanceof Date) {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        end.setDate(value.getDate() + 1);
      }

      return (
        item.dateCompleted !== null &&
        start.getTime() <= item.dateCompleted.getTime() &&
        end.getTime() > item.dateCompleted.getTime()
      );
    case 'completedAfter':
      if (value instanceof Date) value.setHours(23, 59, 59, 999);

      return (
        item.dateCompleted !== null &&
        value instanceof Date &&
        value.getTime() < item.dateCompleted.getTime()
      );

    case 'dueBefore':
      return (
        item.dateDue !== null &&
        value instanceof Date &&
        value.getTime() > item.dateDue.getTime()
      );
    case 'dueOn':
      return (
        item.dateDue !== null &&
        value instanceof Date &&
        value.getTime() === item.dateDue.getTime()
      );
    case 'dueAfter':
      return (
        item.dateDue !== null &&
        value instanceof Date &&
        value.getTime() < item.dateDue.getTime()
      );

    case 'expectedTimeBelow':
      return (
        item.expectedMs !== null &&
        typeof value === 'number' &&
        item.expectedMs < value
      );
    case 'expectedTimeAt':
      return item.expectedMs !== null && item.expectedMs === value;
    case 'expectedTimeAbove':
      return (
        item.expectedMs !== null &&
        typeof value === 'number' &&
        item.expectedMs > value
      );

    case 'elapsedTimeBelow':
      return typeof value === 'number' && item.elapsedMs < value;
    case 'elapsedTimeAt':
      return item.elapsedMs === value;
    case 'elapsedTimeAbove':
      return typeof value === 'number' && item.elapsedMs > value;

    default:
      throw new Error(`Invalid option ${key}`);
  }
}

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

import { Reorder, useDragControls } from 'framer-motion';
import { ActionDispatch } from 'react';

import ListItemModel from '@/lib/model/listItem';
import ListMember from '@/lib/model/listMember';
import Tag from '@/lib/model/tag';
import ListItem from '@/components/ListItem';
import { Filters } from '@/components/SearchBar/types';
import { NamedColor } from '@/lib/model/color';
import { sortItems, sortItemsByCompleted } from '@/lib/sortItems';

import { Item, SectionAction } from './types';

export default function SectionBody({
  items,
  filters,
  members,
  tagsAvailable,
  hasTimeTracking,
  hasDueDates,
  isAutoOrdered,
  setItems,
  dispatchSection,
  reorderItem,
  addNewTag
}: {
  items: Map<string, Item>;
  filters: Filters;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  setItems: (items: Item[]) => unknown;
  dispatchSection: ActionDispatch<[action: SectionAction]>;
  reorderItem: (item: ListItemModel) => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}) {
  const controls = useDragControls();

  const filteredItems = [
    ...items.values().filter(item => checkItemFilter(item, filters))
  ];

  return isAutoOrdered ? (
    filteredItems
      .sort(sortItems.bind(null, hasTimeTracking, hasDueDates))
      .map(item => (
        <ListItem
          key={item.id}
          addNewTag={addNewTag}
          deleteItem={() =>
            dispatchSection({ type: 'DeleteItem', itemId: item.id })
          }
          hasDueDates={hasDueDates}
          hasTimeTracking={hasTimeTracking}
          item={item}
          members={members}
          resetTime={status =>
            dispatchSection({ type: 'ResetItemTime', itemId: item.id, status })
          }
          setCompleted={dateCompleted =>
            dispatchSection({
              type: 'SetItemComplete',
              itemId: item.id,
              dateCompleted
            })
          }
          setPaused={() =>
            dispatchSection({ type: 'PauseItemTime', itemId: item.id })
          }
          setRunning={() =>
            dispatchSection({ type: 'StartItemTime', itemId: item.id })
          }
          tagsAvailable={tagsAvailable}
          updateDueDate={date =>
            dispatchSection({ type: 'SetItemDueDate', itemId: item.id, date })
          }
          updateExpectedMs={expectedMs =>
            dispatchSection({
              type: 'SetItemExpectedMs',
              itemId: item.id,
              expectedMs
            })
          }
          updatePriority={priority =>
            dispatchSection({
              type: 'SetItemPriority',
              itemId: item.id,
              priority
            })
          }
        />
      ))
  ) : (
    <Reorder.Group
      axis='y'
      values={filteredItems}
      onReorder={items => setItems(items.sort(sortItemsByCompleted))}
    >
      {filteredItems.map(item => (
        <Reorder.Item
          key={item.id}
          className='border-b-1 border-content3 last:border-b-0'
          dragControls={controls}
          dragListener={false}
          value={item}
          onDragEnd={reorderItem.bind(null, item)}
        >
          <ListItem
            key={item.id}
            addNewTag={addNewTag}
            deleteItem={() =>
              dispatchSection({ type: 'DeleteItem', itemId: item.id })
            }
            hasDueDates={hasDueDates}
            hasTimeTracking={hasTimeTracking}
            item={item}
            members={members}
            resetTime={status =>
              dispatchSection({
                type: 'ResetItemTime',
                itemId: item.id,
                status
              })
            }
            setCompleted={dateCompleted =>
              dispatchSection({
                type: 'SetItemComplete',
                itemId: item.id,
                dateCompleted
              })
            }
            setPaused={() =>
              dispatchSection({ type: 'PauseItemTime', itemId: item.id })
            }
            setRunning={() =>
              dispatchSection({ type: 'StartItemTime', itemId: item.id })
            }
            tagsAvailable={tagsAvailable}
            updateDueDate={date =>
              dispatchSection({ type: 'SetItemDueDate', itemId: item.id, date })
            }
            updateExpectedMs={expectedMs =>
              dispatchSection({
                type: 'SetItemExpectedMs',
                itemId: item.id,
                expectedMs
              })
            }
            updatePriority={priority =>
              dispatchSection({
                type: 'SetItemPriority',
                itemId: item.id,
                priority
              })
            }
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
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

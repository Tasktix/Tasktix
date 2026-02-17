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

import { Reorder } from 'framer-motion';
import { ActionDispatch, useState } from 'react';

import ListItemModel from '@/lib/model/listItem';
import ListMember from '@/lib/model/listMember';
import Tag from '@/lib/model/tag';
import {
  ListItem,
  ReorderableListItem,
  ListItemParams
} from '@/components/ListItem';
import { Filters } from '@/components/SearchBar/types';
import { NamedColor } from '@/lib/model/color';
import {
  sortItems,
  sortItemsByCompleted,
  sortItemsByOrder
} from '@/lib/sortItems';

import { ItemAction } from '../List';

/**
 * A component that provides the body of the list section - i.e. just the items in it,
 * not the header. This provides the wrapping component needed for dragging list
 * items to reorder them when enabled in list settings. It also handles the logic for
 * excluding list items that don't match the current filters.
 *
 * @param sectionId The ID of the section this body belongs to
 * @param items The items that currently belong to this section
 * @param filters The filters currently active on the list that should limit which items
 *  are rendered
 * @param members The users who have access to the list
 * @param tagsAvailable The tags that belong to the list
 * @param hasTimeTracking Whether time tracking is enabled in the list's settings
 * @param hasDueDates Whether due dates are enabled in the list's settings
 * @param isAutoOrdered Whether auto-ordering is enabled in the list's settings
 * @param dispatchItemChange Callback for updating an item's state
 * @param reorderItem Callback for finalizing the new order of items and updating React
 *  state
 * @param addNewTag Callback to propagate state changes when a new tag is created from the
 *  "add tag" menu
 */
export default function SectionBody({
  sectionId,
  items,
  filters,
  members,
  tagsAvailable,
  hasTimeTracking,
  hasDueDates,
  isAutoOrdered,
  dispatchItemChange,
  reorderItem,
  addNewTag
}: {
  sectionId: string;
  items: Map<string, ListItemModel>;
  filters: Filters;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  dispatchItemChange: ActionDispatch<[action: ItemAction]>;
  reorderItem: (item: ListItemModel, newIndex: number) => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}) {
  /**
   * Provides a visual index for each list item for use with dragging. This number
   * indicates the item's index within the list, allowing the item to switch places with
   * other items when dragged past them. This is kept separate from the sectionIndex
   * property so that only 1 API call is needed (when the dragging interaction is
   * completed) to update the index of the list item in the database.
   */
  const [itemOrder, setItemOrder] = useState<Map<string, number>>(
    new Map(items.values().map(item => [item.id, item.sectionIndex]))
  );

  /**
   * When the list of items changes, the itemOrder map needs to be updated to include any
   * changed items' indices. To detect this change (without an effect), we need to track
   * previous items here. This is more efficient than an effect; see React's "You May Not
   * Need an Effect" for details.
   */
  const [prevItems, setPrevItems] = useState(items);

  if (prevItems !== items) {
    setPrevItems(items);
    setItemOrder(
      new Map(items.values().map(item => [item.id, item.sectionIndex]))
    );

    // The state is currently out of sync, so don't render anything (sortItemsByOrder may
    // throw an error if rendering attempted). React will throw away this render result
    // and immediately rerender the component, anyway, since its state changed.
    return null;
  }

  const filteredItems = [
    ...items.values().filter(item => checkItemFilter(item, filters))
  ];

  const components: ListItemParams[] = (
    isAutoOrdered
      ? filteredItems.sort(sortItems.bind(null, hasTimeTracking, hasDueDates))
      : filteredItems.sort(sortItemsByOrder.bind(null, itemOrder))
  ).map(item => ({
    addNewTag,
    hasDueDates,
    hasTimeTracking,
    item,
    members,
    sectionId,
    tagsAvailable,
    dispatchItemChange
  }));

  return isAutoOrdered ? (
    components.map(params => <ListItem key={params.item.id} {...params} />)
  ) : (
    <Reorder.Group
      axis='y'
      values={filteredItems}
      // Since items are stored in a hashmap now, setItems will update each item's
      // `.visualIndex` with its current index in the list
      onReorder={items => {
        setItemOrder(
          new Map(
            items.sort(sortItemsByCompleted).map((item, i) => [item.id, i])
          )
        );
      }}
    >
      {components.map(params => (
        <ReorderableListItem
          {...params}
          key={params.item.id}
          onDragEnd={() => {
            const index = itemOrder.get(params.item.id);

            if (index === undefined)
              throw new Error(
                `Unable to find index for item with ID ${params.item.id}`
              );
            reorderItem(params.item, index);
          }}
        />
      ))}
    </Reorder.Group>
  );
}

/**
 * Checks whether a given item should be rendered, given the list's current filters
 *
 * @param item The item to check
 * @param filters The filters to apply
 * @returns Whether the item should be rendered
 */
function checkItemFilter(item: ListItemModel, filters: Filters): boolean {
  for (const key in filters)
    if (!compareFilter(item, key, filters[key])) return false;

  return true;
}

/**
 * Checks whether a given filter includes the given item
 *
 * @param item The item to check
 * @param key The name of the filter
 * @param value The filter value to compare the item against
 * @returns True if the filter allows the item to be rendered; false if not
 */
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
    case 'completedOn': {
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
    }
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

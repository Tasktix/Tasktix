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
import { NamedColor } from '@/lib/model/color';
import { sortItems, sortItemsByCompleted, sortItemsByOrder } from '@/lib/sort';

import { ItemAction } from '../List';
import { Filter, FilterGroup } from '../Filter';
import {
  compareDate,
  compareMultiOption,
  compareOption,
  compareText,
  compareTime
} from '../Filter/comparators';
import {
  DateFilter,
  MultiOptionFilter,
  OptionFilter,
  TextFilter,
  TimeFilter
} from '../Filter/types';

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
  filters: FilterGroup;
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
function checkItemFilter(item: ListItemModel, filters: FilterGroup): boolean {
  function _checkResults(operator: 'And' | 'Or', results: boolean[]) {
    if (operator === 'And') return results.every(Boolean);
    else return results.some(Boolean);
  }

  function _checkFilter(filter: FilterGroup | Filter): boolean {
    if ('label' in filter) {
      // Actual Filter, not nested FilterGroup
      return compareFilter(item, filter);
    }

    const result = filter.filters.map(_checkFilter);

    return _checkResults(filter.operator, result);
  }

  const result = filters.filters.map(_checkFilter);

  return _checkResults(filters.operator, result);
}

/**
 * Checks whether a given filter includes the given item
 *
 * @param item The item to check
 * @param key The name of the filter
 * @param value The filter value to compare the item against
 * @returns True if the filter allows the item to be rendered; false if not
 */
function compareFilter(item: ListItemModel, filter: Filter): boolean {
  switch (filter.label) {
    case 'name':
      return compareText(filter as TextFilter, item.name);

    case 'priority':
      return compareOption(filter as OptionFilter, item.priority);

    case 'tag':
      return compareMultiOption(
        filter as MultiOptionFilter,
        item.tags.map(t => t.name)
      );

    case 'user':
      return compareMultiOption(
        filter as MultiOptionFilter,
        item.assignees.map(a => a.user.username).filter(Boolean) as string[]
      );

    case 'status':
      return compareOption(filter as OptionFilter, item.status);

    case 'completed':
      return compareDate(filter as DateFilter, item.dateCompleted);

    case 'dueDate':
      return compareDate(filter as DateFilter, item.dateDue);

    case 'expectedTime':
      return compareTime(filter as TimeFilter, item.expectedMs);

    case 'elapsedTime':
      return compareTime(filter as TimeFilter, item.elapsedMs);

    default:
      throw new Error(`Invalid option ${filter.label}`);
  }
}

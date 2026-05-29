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

'use client';

import { ActionDispatch, useEffect, useReducer } from 'react';

import List from '@/lib/model/list';
import { itemGroupReducer } from '@/lib/transformations/list/stateToState';
import {
  generateItemAssigneesState,
  generateItemsState,
  generateItemTagsState,
  generateListMembersState,
  generateListSectionsState,
  generateListsState,
  generateListTagsState,
  generateMembersState,
  generateSectionItemsState,
  generateSectionsState,
  generateTagsState
} from '@/lib/transformations/list/toState';
import { mergeMaps } from '@/lib/util';
import { subscribe } from '@/lib/sse/client';
import { sortItems } from '@/lib/sort';
import {
  itemGroupStateToMembers,
  itemGroupStateToTags,
  listStateToItem
} from '@/lib/transformations/list/fromState';
import MemberRole from '@/lib/model/memberRole';
import {
  ItemAction,
  ItemGroupState,
  ListItemState
} from '@/lib/transformations/list/types';

import { ListItem } from '../ListItem';

import { itemGroupHandlerFactory } from './handlerFactory';

/**
 * Displays the top list items from several lists, all in a single section.
 *
 * @param startingLists All lists with all data that displayed items may come from
 * @param startingRoles All roles list members may have when the list is loaded
 * @param alternateText The text to display if there are no incomplete items to display
 */
export default function ListItemGroup({
  startingLists,
  startingRoles,
  alternateText
}: {
  startingLists: string;
  startingRoles: string;
  alternateText: string;
}) {
  const builtLists = JSON.parse(startingLists) as List[];
  const builtRoles = new Map(
    (JSON.parse(startingRoles) as MemberRole[]).map(role => [role.id, role])
  );

  const [itemGroup, dispatchItemGroup] = useReducer(itemGroupReducer, {
    lists: generateListsState(builtLists),
    listSections: generateListSectionsState(builtLists),
    listMembers: generateListMembersState(builtLists),
    listTags: generateListTagsState(builtLists),
    members: mergeMaps(builtLists.map(generateMembersState)),
    tags: mergeMaps(builtLists.map(generateTagsState)),
    sections: mergeMaps(builtLists.map(generateSectionsState)),
    sectionItems: mergeMaps(builtLists.map(generateSectionItemsState)),
    items: mergeMaps(builtLists.map(generateItemsState)),
    itemAssignees: mergeMaps(builtLists.map(generateItemAssigneesState)),
    itemTags: mergeMaps(builtLists.map(generateItemTagsState))
  });

  const groupHandlers = itemGroupHandlerFactory(dispatchItemGroup);

  useEffect(
    () =>
      subscribe(
        itemGroup.lists
          .values()
          .map(l => l.id)
          .toArray(),
        dispatchItemGroup
      ),
    [itemGroup.lists]
  );

  const displayItems = itemGroup.items
    .values()
    .toArray()
    .filter(item => item.status !== 'Completed')
    .sort(sortItems.bind(null, false, false))
    .filter((_, idx) => idx < 10);

  return (
    <div className='rounded-md w-full border-2 border-content3 box-border shadow-lg shadow-content2'>
      {displayItems.length ? (
        displayItems.map(item => (
          <ListItemWrapper
            key={item.id}
            dispatchItemGroup={dispatchItemGroup}
            groupHandlers={groupHandlers}
            item={item}
            itemGroup={itemGroup}
            roles={builtRoles}
          />
        ))
      ) : (
        <div className='h-16 flex items-center justify-center bg-content2'>
          {alternateText}
        </div>
      )}
    </div>
  );
}

/**
 * Component that simplifies the list item interface for <ListItemGroup> (i.e. handles
 * conversion from flat React state to nested JS objects).
 *
 * @param item The flat item state
 * @param itemGroup All React state (for pulling tag, member, etc. data)
 * @param roles All roles a list member could have
 * @param groupHandlers Callback functions that handle API calls and state updates for the
 *  item group
 * @param dispatchItemGroup Callback functions for updating an item's React state (without
 *  API calls)
 */
function ListItemWrapper({
  item,
  itemGroup,
  roles,
  groupHandlers,
  dispatchItemGroup
}: {
  item: ListItemState;
  groupHandlers: ReturnType<typeof itemGroupHandlerFactory>;
  itemGroup: ItemGroupState;
  roles: Map<string, MemberRole>;
  dispatchItemGroup: ActionDispatch<
    [action: ItemAction | { type: 'DeleteItem'; sectionId: string; id: string }]
  >;
}) {
  return (
    <ListItem
      addNewTag={groupHandlers.addNewTag.bind(null, item.listId!)}
      hasDueDates={itemGroup.lists.get(item.listId!)?.hasDueDates || false}
      hasTimeTracking={
        itemGroup.lists.get(item.listId!)?.hasTimeTracking || false
      }
      item={listStateToItem(
        itemGroup.itemAssignees,
        itemGroup.itemTags,
        itemGroup.members,
        itemGroup.tags,
        item
      )}
      list={itemGroup.lists.get(item.listId!)}
      members={itemGroupStateToMembers(
        itemGroup.listMembers,
        itemGroup.members,
        roles,
        item.listId!
      )}
      sectionId='unknown'
      tags={itemGroupStateToTags(
        itemGroup.listTags,
        itemGroup.tags,
        item.listId!
      )}
      onItemEvent={dispatchItemGroup}
    />
  );
}

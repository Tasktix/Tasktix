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

import { useEffect, useReducer, useState } from 'react';

import AddListSection from '@/components/AddListSection';
import Filter, { FilterGroup } from '@/components/Filter';
import ListSettings from '@/components/ListSettings';
import ListModel from '@/lib/model/list';
import { subscribe } from '@/lib/sse/client';
import MemberRole from '@/lib/model/memberRole';
import ListSection from '@/components/ListSection/ListSection';
import {
  generateItemAssigneesState,
  generateItemsState,
  generateItemTagsState,
  generateMembersState,
  generateSectionItemsState,
  generateSectionsState,
  generateTagsState
} from '@/lib/transformations/list/toState';
import {
  listStateToMembers,
  listStateToItems
} from '@/lib/transformations/list/fromState';
import { listReducer } from '@/lib/transformations/list/stateToState';

import { listHandlerFactory } from './handlerFactory';
import { getFilterConfig } from './filters';
import { useKanbanPref } from './useKanbanPref';

/**
 * This component provides the full list GUI: filters, settings, each section and its
 * items, and an input for adding new sections. Intended to be the outermost client
 * component on the page (i.e. the component above it in the component tree is a server
 * component that pulls the necessary data from the database).
 *
 * @param startingList A JSON-stringified version of the list state when the page is first
 *  loaded (type List). Must be manually JSON stringified to cross the server/client
 *  component boundary because Next.js doesn't automatically convert Date objects or
 *  classes
 */
export default function List({
  startingList,
  startingRoles
}: {
  startingList: string;
  startingRoles: string;
}) {
  const builtList = JSON.parse(startingList) as ListModel;
  const builtRoles = new Map(
    (JSON.parse(startingRoles) as MemberRole[]).map(role => [role.id, role])
  );

  const [list, dispatchList] = useReducer(listReducer, {
    ...builtList,
    members: generateMembersState(builtList),
    tags: generateTagsState(builtList),
    sections: generateSectionsState(builtList),
    sectionItems: generateSectionItemsState(builtList),
    items: generateItemsState(builtList),
    itemAssignees: generateItemAssigneesState(builtList),
    itemTags: generateItemTagsState(builtList)
  });

  const filterConfig = getFilterConfig(list);
  const [filterState, setFilterState] = useState<FilterGroup>({
    operator: 'And',
    filters: []
  });

  const listHandlers = listHandlerFactory(list.id, dispatchList);

  useEffect(() => subscribe([list.id], dispatchList), [list.id]);

  const [isKanban, setIsKanban] = useKanbanPref(list.id);

  return (
    <>
      <span className='flex gap-4 items-center'>
        <Filter
          currentFilters={filterState}
          filterConfig={filterConfig}
          onFilterSave={setFilterState}
        />
        <ListSettings
          addNewTag={listHandlers.addNewTag}
          isKanban={isKanban}
          list={list}
          roles={builtRoles}
          onKanbanToggle={setIsKanban}
          onListEvent={dispatchList}
          onListNameChange={listHandlers.setName}
        />
      </span>

      <span
        className={`flex ${isKanban ? 'gap-4 items-start overflow-x-auto' : 'flex-col gap-8'}`}
        data-testid={isKanban ? 'kanban-list-format' : 'vertical-list-format'}
      >
        {Array.from(list.sections.values()).map(section => (
          <ListSection
            key={section.id}
            filters={filterState}
            hasDueDates={list.hasDueDates}
            hasTimeTracking={list.hasTimeTracking}
            isAutoOrdered={list.isAutoOrdered}
            isKanban={isKanban}
            items={listStateToItems(
              list.sectionItems.get(section.id),
              list.itemAssignees,
              list.itemTags,
              list.items,
              list.members,
              list.tags
            )}
            listId={list.id}
            members={listStateToMembers(list.members, builtRoles)}
            section={section}
            tags={list.tags.values().toArray()}
            totalSections={
              new Map(
                list.sections
                  .values()
                  .map(section => [section.id, section.name])
              )
            }
            onItemChange={dispatchList}
            onSectionChange={dispatchList}
            onTagCreate={listHandlers.addNewTag}
          />
        ))}
        <span>
          <AddListSection
            listId={list.id}
            onSectionAdded={section =>
              dispatchList({ type: 'AddSection', listId: list.id, section })
            }
          />
        </span>
      </span>
    </>
  );
}

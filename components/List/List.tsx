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
import SearchBar from '@/components/SearchBar';
import { Filters } from '@/components/SearchBar/types';
import ListSettings from '@/components/ListSettings';
import ListModel from '@/lib/model/list';
import { subscribe } from '@/lib/sse/client';

import ListSection from '../ListSection/ListSection';

import { getFilterOptions } from './filters';
import listReducer from './listReducer';
import { listHandlerFactory } from './handlerFactory';
import { ListState } from './types';

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
export default function List({ startingList }: { startingList: string }) {
  const builtList = JSON.parse(startingList) as ListModel;

  // Rebuild Date objects turned to JSON strings & convert arrays to Maps
  const builtMembers: ListState['members'] = new Map(
    builtList.members.map(member => [member.user.id, member])
  );
  const builtSections: ListState['sections'] = new Map(
    builtList.sections.map(section => [
      section.id,
      {
        ...section,
        items: section.items.map(item => item.id)
      }
    ])
  );
  const builtItems: ListState['items'] = new Map(
    builtList.sections.flatMap(section =>
      section.items.map(item => [
        item.id,
        {
          ...item,
          dateCreated: new Date(item.dateCreated),
          dateDue: item.dateDue ? new Date(item.dateDue) : null,
          dateStarted: item.dateStarted ? new Date(item.dateStarted) : null,
          dateCompleted: item.dateCompleted
            ? new Date(item.dateCompleted)
            : null,
          tags: item.tags.map(tag => tag.id),
          assignees: item.assignees.map(assignee => [
            assignee.user.id,
            assignee.role
          ])
        }
      ])
    )
  );
  const builtTags: ListState['tags'] = new Map(
    builtList.tags.map(tag => [tag.id, tag])
  );

  const [list, dispatchList] = useReducer(listReducer, {
    ...builtList,
    items: builtItems,
    members: builtMembers,
    sections: builtSections,
    tags: builtTags
  });

  const [filters, setFilters] = useState<Filters>({});
  const filterOptions = getFilterOptions(list);

  const listHandlers = listHandlerFactory(list.id, dispatchList);

  useEffect(() => subscribe([list.id], dispatchList), [list.id]);

  return (
    <>
      <span className='flex gap-4 items-center'>
        <SearchBar inputOptions={filterOptions} onValueChange={setFilters} />
        <ListSettings
          addNewTag={listHandlers.addNewTag}
          list={list}
          onListEvent={dispatchList}
          onListNameChange={listHandlers.setName}
        />
      </span>

      {Array.from(list.sections.values()).map(section => (
        <ListSection
          key={section.id}
          filters={filters}
          hasDueDates={list.hasDueDates}
          hasTimeTracking={list.hasTimeTracking}
          isAutoOrdered={list.isAutoOrdered}
          items={section.items
            .map(id => list.items.get(id))
            .filter(e => e !== undefined)}
          listId={list.id}
          members={list.members}
          section={section}
          tags={list.tags}
          onItemChange={dispatchList}
          onSectionChange={dispatchList}
          onTagCreate={listHandlers.addNewTag}
        />
      ))}

      <AddListSection
        listId={list.id}
        onSectionAdded={section =>
          dispatchList({ type: 'AddSection', section })
        }
      />
    </>
  );
}

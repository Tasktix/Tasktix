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

import { useReducer, useState } from 'react';

import AddListSection from '@/components/AddListSection';
import SearchBar from '@/components/SearchBar';
import { Filters } from '@/components/SearchBar/types';
import ListSettings from '@/components/ListSettings';
import ListModel from '@/lib/model/list';
import Tag from '@/lib/model/tag';

import ListSection from '../ListSection/ListSection';

import { getFilterOptions } from './filters';
import listReducer from './listReducer';
import { listHandlerFactory } from './handlerFactory';

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
 * @param startingTagsAvailable A JSON-stringified version of the list's tags when the
 *  page is first loaded (type Tag[]). Must be manually JSON stringified to cross the
 *  server/client component boundary because Next.js doesn't automatically convert classes
 */
export default function List({
  startingList,
  startingTagsAvailable
}: {
  startingList: string;
  startingTagsAvailable: string;
}) {
  const builtList = JSON.parse(startingList) as ListModel;

  // Rebuild Date objects turned to JSON strings
  for (const section of builtList.sections) {
    for (const item of section.items) {
      item.dateCreated = new Date(item.dateCreated);
      item.dateDue = item.dateDue ? new Date(item.dateDue) : null;
      item.dateStarted = item.dateStarted ? new Date(item.dateStarted) : null;
      item.dateCompleted = item.dateCompleted
        ? new Date(item.dateCompleted)
        : null;
    }
  }

  const [{ list, tagsAvailable }, dispatchList] = useReducer(listReducer, {
    list: builtList,
    tagsAvailable: JSON.parse(startingTagsAvailable) as Tag[]
  });

  const [filters, setFilters] = useState<Filters>({});
  const filterOptions = getFilterOptions(list, tagsAvailable);

  const listHandlers = listHandlerFactory(list.id, dispatchList);

  return (
    <>
      <span className='flex gap-4 items-center'>
        <SearchBar inputOptions={filterOptions} onValueChange={setFilters} />
        <ListSettings
          addNewTag={listHandlers.addNewTag}
          dispatchList={dispatchList}
          hasDueDates={list.hasDueDates}
          hasTimeTracking={list.hasTimeTracking}
          isAutoOrdered={list.isAutoOrdered}
          listColor={list.color}
          listId={list.id}
          listName={list.name}
          members={list.members}
          setListName={listHandlers.setName}
          tagsAvailable={tagsAvailable}
        />
      </span>

      {list.sections.map(section => (
        <ListSection
          key={section.id}
          filters={filters}
          hasDueDates={list.hasDueDates}
          hasTimeTracking={list.hasTimeTracking}
          id={section.id}
          isAutoOrdered={list.isAutoOrdered}
          listId={list.id}
          members={list.members}
          name={section.name}
          startingItems={section.items}
          tagsAvailable={tagsAvailable}
          onDelete={listHandlers.deleteListSection.bind(null, section.id)}
          onTagCreate={listHandlers.addNewTag}
        />
      ))}

      <AddListSection
        addListSection={section =>
          dispatchList({ type: 'AddSection', section })
        }
        listId={list.id}
      />
    </>
  );
}

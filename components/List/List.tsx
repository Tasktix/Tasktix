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
          hasDueDates={list.hasDueDates}
          hasTimeTracking={list.hasTimeTracking}
          isAutoOrdered={list.isAutoOrdered}
          listColor={list.color}
          listId={list.id}
          listName={list.name}
          members={list.members}
          setHasDueDates={hasDueDates =>
            dispatchList({ type: 'SetHasDueDates', hasDueDates })
          }
          setHasTimeTracking={hasTimeTracking =>
            dispatchList({ type: 'SetHasTimeTracking', hasTimeTracking })
          }
          setIsAutoOrdered={isAutoOrdered =>
            dispatchList({ type: 'SetIsAutoOrdered', isAutoOrdered })
          }
          setListColor={color => dispatchList({ type: 'SetListColor', color })}
          setListName={name => {
            dispatchList({ type: 'SetListName', name });
            window.location.reload();
          }}
          setMembers={members => dispatchList({ type: 'SetMembers', members })}
          setTagsAvailable={tags =>
            dispatchList({ type: 'SetTagsAvailable', tags })
          }
          tagsAvailable={tagsAvailable}
        />
      </span>

      {list.sections.map(section => (
        <ListSection
          key={section.id}
          addNewTag={listHandlers.addNewTag}
          deleteSection={listHandlers.deleteListSection.bind(null, section.id)}
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

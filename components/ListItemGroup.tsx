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

import { useState } from 'react';

import { ListItem } from '@/components/ListItem';
import { sortItems } from '@/lib/sortItems';
import { default as api } from '@/lib/api';
import ListItemModel from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';
import ListMember from '@/lib/model/listMember';
import { NamedColor } from '@/lib/model/color';
import List from '@/lib/model/list';

/**
 * An alternative container than `<List />` for displaying a collection of list items.
 * Unlike `<List />`, this component allows items from multiple different lists to be
 * displayed. Intended for use with the "Today" view and potentially custom views that
 * highlight items from several different lists.
 *
 * @param startingLists The lists that items might belong to, JSON-stringified
 * @param startingItems The initial state of items to display, JSON-stringified. Items may
 *  be interacted with and their state may change from this point
 * @param startingTags The initial tags that each list has, JSON-stringified. Object where
 *  keys are list IDs and values are an array of tags belonging to that list. Tags may be
 *  created on a list to change state from this point
 * @param members The members each list has, JSON-stringified. Object where keys are list
 *  IDs and values are an array of members of that list.
 * @param alternate The fallback text to display if there are no items to render
 */
export default function ListItemGroup({
  startingLists,
  startingItems,
  startingTags,
  members,
  alternate
}: {
  startingLists: string;
  startingItems: string;
  startingTags: string;
  members: string;
  alternate: string;
}) {
  const builtLists = (JSON.parse(startingLists) as List[]) || [];
  const builtItems = (JSON.parse(startingItems) as ListItemModel[]) || [];

  for (const item of builtItems) {
    item.dateCreated = new Date(item.dateCreated);
    item.dateDue = item.dateDue ? new Date(item.dateDue) : null;
    item.dateStarted = item.dateStarted ? new Date(item.dateStarted) : null;
    item.dateCompleted = item.dateCompleted
      ? new Date(item.dateCompleted)
      : null;
  }

  const [items, setItems] = useState<ListItemModel[]>(builtItems);
  const [tags, setTags] = useState(
    JSON.parse(startingTags) as { [id: string]: Tag[] }
  );
  const parsedMembers = JSON.parse(members) as { [id: string]: ListMember[] };

  function setStatus(
    index: number,
    status: ListItemModel['status'],
    dateCompleted?: ListItemModel['dateCompleted']
  ) {
    const newItems = structuredClone(items);

    newItems[index].status = status;
    if (dateCompleted !== undefined)
      newItems[index].dateCompleted = dateCompleted;
    setItems(newItems);
  }

  function updateExpectedMs(index: number, ms: number) {
    const newItems = structuredClone(items);

    newItems[index].expectedMs = ms;
    setItems(newItems);
  }

  function updatePriority(index: number, priority: ListItemModel['priority']) {
    const newItems = structuredClone(items);

    newItems[index].priority = priority;
    setItems(newItems);
  }

  function updateDueDate(index: number, date: ListItemModel['dateDue']) {
    const newItems = structuredClone(items);

    newItems[index].dateDue = date;
    setItems(newItems);
  }

  function deleteItem(index: number) {
    const newItems = structuredClone(items);

    newItems.splice(index, 1);
    setItems(newItems);
  }

  function addNewTag(
    listId: string | undefined,
    name: string,
    color: NamedColor
  ): Promise<string> {
    if (!listId) return new Promise((_, reject) => reject(Error('No list ID')));

    return new Promise((resolve, reject) => {
      api
        .post(`/list/${listId}/tag`, { name, color })
        .then(res => {
          const id = res.content?.split('/').at(-1) || '';

          const newTags = structuredClone(tags);

          newTags[listId].push(new Tag(name, color, id));
          setTags(newTags);

          resolve(id);
        })
        .catch((err: Error) => reject(err));
    });
  }

  return (
    <div className='rounded-md w-full border-2 border-content3 box-border shadow-lg shadow-content2'>
      {items && items.length ? (
        items
          .sort(sortItems.bind(null, false, false))
          .filter((item, idx) => item.status !== 'Completed' && idx < 10)
          .map((item, idx) => (
            <ListItem
              key={item.id}
              addNewTag={addNewTag.bind(null, item.listId)}
              deleteItem={deleteItem.bind(null, idx)}
              hasDueDates={
                builtLists.find(list => list.id === item.listId)?.hasDueDates ||
                false
              }
              hasTimeTracking={
                builtLists.find(list => list.id === item.listId)
                  ?.hasTimeTracking || false
              }
              item={item}
              list={builtLists.find(list => list.id === item.listId)}
              members={item.listId ? parsedMembers[item.listId] : []}
              resetTime={setStatus.bind(null, idx)}
              setCompleted={setStatus.bind(null, idx, 'Completed')}
              setPaused={() => setStatus(idx, 'Paused', null)}
              setRunning={setStatus.bind(null, idx, 'In_Progress')}
              tagsAvailable={item.listId ? tags[item.listId] : []}
              updateDueDate={updateDueDate.bind(null, idx)}
              updateExpectedMs={updateExpectedMs.bind(null, idx)}
              updatePriority={updatePriority.bind(null, idx)}
            />
          ))
      ) : (
        <div className='h-16 flex items-center justify-center bg-content2'>
          {alternate}
        </div>
      )}
    </div>
  );
}

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
import { sortItems } from '@/lib/sort';
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

  const [items] = useState<ListItemModel[]>(builtItems);
  const [tags, setTags] = useState(
    JSON.parse(startingTags) as { [id: string]: Tag[] }
  );
  const parsedMembers = JSON.parse(members) as { [id: string]: ListMember[] };

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
          .map(item => (
            <ListItem
              key={item.id}
              addNewTag={addNewTag.bind(null, item.listId)}
              dispatchItemChange={() => null}
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
              sectionId='unknown'
              tagsAvailable={item.listId ? tags[item.listId] : []}
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

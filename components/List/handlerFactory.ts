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

import { addToast } from '@heroui/react';
import { ActionDispatch } from 'react';

import api from '@/lib/api';
import { NamedColor } from '@/lib/model/color';
import Tag from '@/lib/model/tag';
import { addToastForError } from '@/lib/error';

import { ListAction, SectionAction } from './types';

/**
 * Produces all functions for interacting with a specific list and its data. These
 * functions make API requests to persist changes and updates React's state when the API
 * requests succeed. These functions live here to avoid polluting <List />'s
 * definition.
 *
 * @param listId The ID of the list to generate functions for
 * @param dispatchList Callback to update the list's state
 */
export function listHandlerFactory(
  listId: string,
  dispatchList: ActionDispatch<[action: ListAction | SectionAction]>
) {
  /**
   * @param name The new list name
   */
  function setName(name: string) {
    api
      .patch(`/list/${listId}`, { name })
      .then(() => {
        dispatchList({ type: 'SetListName', name });
        window.location.reload();
      })
      .catch(addToastForError);
  }

  /**
   * Creates a new tag to make available for any items in the list
   *
   * @param name The new tag's name
   * @param color The new tag's color
   * @returns The new tag's ID, or an error if one occurs
   */
  function addNewTag(name: string, color: NamedColor): Promise<string> {
    return new Promise((resolve, reject) => {
      api
        .post(`/list/${listId}/tag`, { name, color })
        .then(res => {
          const id = res.content?.split('/').at(-1) || '';

          dispatchList({ type: 'AddTag', tag: new Tag(name, color, id) });

          resolve(id);
        })
        .catch((err: Error) => reject(err));
    });
  }

  /**
   * @param id The ID of the section to delete
   */
  function deleteListSection(id: string) {
    if (
      !confirm(
        'Are you sure you want to delete this section? This action is irreversible.'
      )
    )
      return;

    api
      .delete(`/list/${listId}/section/${id}`)
      .then(res => {
        addToast({
          title: res.message,
          color: 'success'
        });

        dispatchList({ type: 'DeleteSection', id });
      })
      .catch(addToastForError);
  }

  return {
    setName,
    addNewTag,
    deleteListSection
  };
}

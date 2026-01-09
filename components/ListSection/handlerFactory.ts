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
import ListItem from '@/lib/model/listItem';

import { Item, SectionAction } from './types';

export default function sectionHandlerFactory(
  listId: string,
  id: string,
  items: Map<string, Item>,
  dispatchSection: ActionDispatch<[action: SectionAction]>
) {
  function reorderItem(item: ListItem) {
    const newIndex = items.get(item.id)?.visualIndex;
    const oldIndex = item.sectionIndex;

    if (!newIndex) throw new Error(`Item with ID ${item.id} not found`);

    // `newIndex` gets updated every time the item visually swaps with another. `oldIndex`
    // is the index from before dragging started. If they're the same, the item is still
    // in the same position as before it was dragged, so nothing further needs to happen
    if (newIndex === oldIndex) return;

    api
      .patch(`/list/${listId}/section/${id}/item`, {
        itemId: item.id,
        index: newIndex,
        oldIndex
      })
      .then(res => {
        addToast({ title: res.message, color: 'success' });

        dispatchSection({ type: 'ReorderItem', oldIndex, newIndex });
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  return {
    reorderItem
  };
}

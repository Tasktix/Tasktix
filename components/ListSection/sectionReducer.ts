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

import { SectionAction, State } from './types';

/**
 * The reducer for managing <ListSection />'s state
 *
 * @param state The current state (passed in by React)
 * @param action The action to take for mutating state
 */
export default function sectionReducer(
  state: State,
  action: SectionAction
): State {
  const newState = structuredClone(state);
  const item =
    'itemId' in action ? newState.items.get(action.itemId) : undefined;

  switch (action.type) {
    case 'SetIsCollapsed':
      newState.isCollapsed = !action.isCollapsed;
      break;

    case 'SetItems':
      newState.items = action.items;
      break;

    case 'AddItem':
      newState.items.set(action.item.id, action.item);
      newState.isCollapsed = false;
      break;

    case 'ReorderItem':
      const wasShiftedUp = action.oldIndex > action.newIndex;
      const lowIndex = Math.min(action.newIndex, action.oldIndex);
      const highIndex = Math.max(action.newIndex, action.oldIndex);

      for (const item of newState.items.values()) {
        if (item.sectionIndex === action.oldIndex)
          item.sectionIndex = action.newIndex;
        else {
          if (item.sectionIndex >= lowIndex && item.sectionIndex <= highIndex) {
            item.sectionIndex += wasShiftedUp ? 1 : -1;
          }
        }
      }
      break;

    case 'SetItemDueDate':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.dateDue = action.date;
      break;

    case 'SetItemPriority':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.priority = action.priority;
      break;

    case 'SetItemComplete':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.status = 'Completed';
      item.dateCompleted = action.dateCompleted;
      break;

    case 'SetItemExpectedMs':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.expectedMs = action.expectedMs;
      break;

    case 'StartItemTime':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.status = 'In_Progress';
      break;

    case 'PauseItemTime':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.status = 'Paused';
      break;

    case 'ResetItemTime':
      if (!item) throw new Error(`No item with id ${action.itemId} found`);

      item.status = action.status;
      break;

    case 'DeleteItem':
      newState.items.delete(action.itemId);
  }

  return newState;
}

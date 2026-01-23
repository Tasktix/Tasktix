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

import { ListAction, ListState } from './types';

/**
 * The reducer for managing <List />'s state
 *
 * @param state The current state (passed in by React)
 * @param action The action to take for mutating state
 */
export default function listReducer(
  state: ListState,
  action: ListAction
): ListState {
  const newState = structuredClone(state);

  switch (action.type) {
    case 'SetHasDueDates':
      newState.list.hasDueDates = !action.hasDueDates;
      break;

    case 'SetHasTimeTracking':
      newState.list.hasTimeTracking = !action.hasTimeTracking;
      break;

    case 'SetIsAutoOrdered':
      newState.list.isAutoOrdered = !action.isAutoOrdered;
      break;

    case 'SetListColor':
      newState.list.color = action.color;
      break;

    case 'SetListName':
      newState.list.name = action.name;
      break;

    case 'SetMembers':
      newState.list.members = action.members;
      break;

    case 'SetTagsAvailable':
      newState.tagsAvailable = action.tags;
      break;

    case 'AddTag':
      newState.tagsAvailable.push(action.tag);
      break;

    case 'AddSection':
      newState.list.sections.push(action.section);
      break;

    case 'DeleteSection':
      for (let i = 0; i < newState.list.sections.length; i++)
        if (newState.list.sections[i].id === action.id)
          newState.list.sections.splice(i, 1);
      break;
  }

  return newState;
}

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

import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';

import { ItemAction } from './types';

export default function itemReducer(
  state: ListItem,
  action: ItemAction
): ListItem {
  const newState = structuredClone(state);

  switch (action.type) {
    case 'SetName':
      newState.name = action.name;
      break;

    case 'SetDueDate':
      newState.dateDue = action.date;
      break;

    case 'SetPriority':
      newState.priority = action.priority;
      break;

    case 'SetIncomplete':
      newState.status = 'Paused';
      newState.dateCompleted = null;
      break;

    case 'SetComplete':
      newState.status = 'Completed';
      newState.dateCompleted = action.dateCompleted;
      break;

    case 'SetExpectedMs':
      newState.expectedMs = action.expectedMs;
      break;

    case 'StartTime':
      newState.status = 'In_Progress';
      break;

    case 'PauseTime':
      newState.status = 'Paused';
      break;

    case 'ResetTime':
      newState.status = action.status;
      break;

    case 'LinkTag':
      const tag = action.tagsAvailable?.find(tag => tag.id === action.id);

      if (!tag) throw new Error(`Could not find tag with id ${action.id}`);
      newState.tags.push(new Tag(tag.name, tag.color, action.id));
      break;

    case 'LinkNewTag':
      newState.tags.push(new Tag(action.name, action.color, action.id));
      break;

    case 'UnlinkTag':
      for (let i = 0; i < newState.tags.length; i++)
        if (newState.tags[i].id === action.id) newState.tags.splice(i, 1);
      break;
  }

  return newState;
}

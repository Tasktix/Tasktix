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

import Tag from '@/lib/model/tag';

import { ItemAction, ListAction, ListState, SectionAction } from './types';

/**
 * The reducer for managing <List />'s state
 *
 * @param state The current state (passed in by React)
 * @param action The action to take for mutating state
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the Color type was expanded). All VALID code paths (based on the
 * Color type) do return - skipcq: JS-0045
 */
export default function listReducer(
  state: ListState,
  action: ListAction | SectionAction | ItemAction
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
      newState.list.sections.set(action.section.id, {
        ...action.section,
        items: new Map()
      });
      break;

    case 'DeleteSection':
      newState.list.sections.delete(action.id);
      break;

    case 'AddItemToSection': {
      const section = newState.list.sections.get(action.sectionId);

      if (!section)
        throw new Error(`Unable to find section with ID ${action.sectionId}`);

      section.items.set(action.item.id, action.item);
      break;
    }

    case 'ReorderItem': {
      const section = newState.list.sections.get(action.sectionId);

      if (!section)
        throw new Error(`Unable to find section with ID ${action.sectionId}`);

      const wasShiftedUp = action.oldIndex > action.newIndex;
      const lowIndex = Math.min(action.newIndex, action.oldIndex);
      const highIndex = Math.max(action.newIndex, action.oldIndex);

      for (const item of section.items.values()) {
        if (item.sectionIndex === action.oldIndex)
          item.sectionIndex = action.newIndex;
        else {
          if (item.sectionIndex >= lowIndex && item.sectionIndex <= highIndex) {
            item.sectionIndex += wasShiftedUp ? 1 : -1;
          }
        }
      }
      break;
    }

    case 'SetItemName':
      getItem(newState, action.sectionId, action.id).name = action.name;
      break;

    case 'SetItemDueDate':
      getItem(newState, action.sectionId, action.id).dateDue = action.date;
      break;

    case 'SetItemPriority':
      getItem(newState, action.sectionId, action.id).priority = action.priority;
      break;

    case 'SetItemIncomplete': {
      const item = getItem(newState, action.sectionId, action.id);

      item.status = 'Paused';
      item.dateCompleted = null;
      break;
    }

    case 'SetItemComplete': {
      const item = getItem(newState, action.sectionId, action.id);

      item.status = 'Completed';
      item.dateCompleted = action.dateCompleted;
      break;
    }

    case 'SetItemExpectedMs':
      getItem(newState, action.sectionId, action.id).expectedMs =
        action.expectedMs;
      break;

    case 'StartItemTime':
      getItem(newState, action.sectionId, action.id).status = 'In_Progress';
      break;

    case 'PauseItemTime':
      getItem(newState, action.sectionId, action.id).status = 'Paused';
      break;

    case 'ResetItemTime':
      getItem(newState, action.sectionId, action.id).status = action.status;
      break;

    case 'LinkTagToItem': {
      const tag = action.tagsAvailable?.find(tag => tag.id === action.tagId);

      if (!tag) throw new Error(`Could not find tag with id ${action.tagId}`);

      newState.list.sections
        .get(action.sectionId)
        ?.items.get(action.itemId)
        ?.tags.push(new Tag(tag.name, tag.color, action.tagId));
      break;
    }

    case 'LinkNewTagToItem':
      getItem(newState, action.sectionId, action.itemId).tags.push(action.tag);
      break;

    case 'UnlinkTagFromItem': {
      const item = getItem(newState, action.sectionId, action.itemId);

      for (let i = 0; i < item.tags.length; i++)
        if (item.tags[i].id === action.tagId) item.tags.splice(i, 1);
      break;
    }

    case 'DeleteItem':
      newState.list.sections.get(action.sectionId)?.items.delete(action.id);
      break;
  }

  return newState;
}

function getItem(state: ListState, sectionId: string, itemId: string) {
  const item = state.list.sections.get(sectionId)?.items.get(itemId);

  if (!item)
    throw new Error(
      `Unable to find item with ID ${itemId} in section ${sectionId}`
    );

  return item;
}

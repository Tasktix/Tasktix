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

import {
  ItemAction,
  ListAction,
  ListState,
  MemberAction,
  SectionAction,
  TagAction
} from './types';

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
  action: ListAction | MemberAction | TagAction | SectionAction | ItemAction
): ListState {
  const newState = structuredClone(state);

  switch (action.type) {
    case 'SetHasDueDates':
      newState.hasDueDates = action.hasDueDates;
      break;

    case 'SetHasTimeTracking':
      newState.hasTimeTracking = action.hasTimeTracking;
      break;

    case 'SetIsAutoOrdered':
      newState.isAutoOrdered = action.isAutoOrdered;
      break;

    case 'SetListColor':
      newState.color = action.color;
      break;

    case 'SetListName':
      newState.name = action.name;
      break;

    case 'AddMember':
      newState.members.set(action.member.user.id, action.member);
      break;

    case 'UpdateMemberPermissions': {
      const member = newState.members.get(action.id);

      if (!member)
        throw new Error(`Cannot find member with user ID ${action.id}`);

      member.role = action.role;
      break;
    }

    case 'AddTag':
      newState.tags.set(action.tag.id, action.tag);
      break;

    case 'UpdateTagName': {
      const tag = newState.tags.get(action.id);

      if (!tag) throw new Error(`Unable to find tag with ID ${action.id}`);

      tag.name = action.name;
      break;
    }

    case 'UpdateTagColor': {
      const tag = newState.tags.get(action.id);

      if (!tag) throw new Error(`Unable to find tag with ID ${action.id}`);

      tag.color = action.color;
      break;
    }

    case 'DeleteTag':
      newState.tags.delete(action.id);
      break;

    case 'AddSection':
      newState.sections.set(action.section.id, {
        ...action.section,
        items: []
      });
      break;

    case 'DeleteSection':
      newState.sections.delete(action.id);
      break;

    case 'AddItemToSection': {
      const section = newState.sections.get(action.id);

      if (!section)
        throw new Error(`Unable to find section with ID ${action.id}`);

      section.items.push(action.item.id);
      newState.items.set(action.item.id, {
        ...action.item,
        assignees: [],
        tags: []
      });
      break;
    }

    case 'ReorderItem': {
      const section = newState.sections.get(action.sectionId);

      if (!section)
        throw new Error(`Unable to find section with ID ${action.sectionId}`);

      const wasShiftedUp = action.oldIndex > action.newIndex;
      const lowIndex = Math.min(action.newIndex, action.oldIndex);
      const highIndex = Math.max(action.newIndex, action.oldIndex);

      for (const itemId of section.items) {
        const item = getItem(newState, itemId);

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
      getItem(newState, action.id).name = action.name;
      break;

    case 'SetItemDueDate':
      getItem(newState, action.id).dateDue = action.date;
      break;

    case 'SetItemPriority':
      getItem(newState, action.id).priority = action.priority;
      break;

    case 'SetItemIncomplete': {
      const item = getItem(newState, action.id);

      item.status = 'Paused';
      item.dateCompleted = null;
      break;
    }

    case 'SetItemComplete': {
      const item = getItem(newState, action.id);

      item.status = 'Completed';
      item.dateCompleted = action.dateCompleted;
      break;
    }

    case 'SetItemExpectedMs':
      getItem(newState, action.id).expectedMs = action.expectedMs;
      break;

    case 'StartItemTime':
      getItem(newState, action.id).status = 'In_Progress';
      break;

    case 'PauseItemTime':
      getItem(newState, action.id).status = 'Paused';
      break;

    case 'ResetItemTime':
      getItem(newState, action.id).status = 'Unstarted';
      break;

    case 'LinkTagToItem':
      newState.items.get(action.itemId)?.tags.push(action.tagId);
      break;

    case 'UnlinkTagFromItem': {
      const item = getItem(newState, action.itemId);

      item.tags = item.tags.filter(tag => tag !== action.tagId);
      break;
    }

    case 'DeleteItem': {
      const section = newState.sections.get(action.sectionId);

      if (!section)
        // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
        throw new Error(`Unable to find section with ID ${action.sectionId}`);

      section.items = section.items.filter(item => item === action.id);
      newState.items.delete(action.id);
      break;
    }
  }

  return newState;
}

/**
 * Helper function to find a list item that's expected to exist, throwing an error if not
 * found
 *
 * @param state The state to look for the item in
 * @param itemId The ID of the item to look for
 *
 * @returns The item that was looked for
 */
function getItem(state: ListState, itemId: string) {
  const item = state.items.get(itemId);

  if (!item) throw new Error(`Unable to find item with ID ${itemId}`);

  return item;
}

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
  FullState,
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
 * Color type) do return. Also, cyclomatic complexity of this function is high, but each
 * individual case is simple and there have to be this many cases for the `switch`
 * statement
 */
export default function listReducer( // skipcq: JS-0045, JS-R1005
  state: FullState,
  action: ListAction | MemberAction | TagAction | SectionAction | ItemAction
): FullState {
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

      // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
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

      // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
      if (!tag) throw new Error(`Unable to find tag with ID ${action.id}`);

      tag.name = action.name;
      break;
    }

    case 'UpdateTagColor': {
      const tag = newState.tags.get(action.id);

      // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
      if (!tag) throw new Error(`Unable to find tag with ID ${action.id}`);

      tag.color = action.color;
      break;
    }

    case 'DeleteTag':
      newState.tags.delete(action.id);
      break;

    case 'AddSection':
      newState.sections.set(action.section.id, action.section);
      newState.sectionItems.set(action.section.id, []);
      break;

    case 'DeleteSection':
      newState.sections.delete(action.id);
      break;

    case 'AddItemToSection': {
      const sectionItems = newState.sectionItems.get(action.id);

      // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
      if (!sectionItems)
        throw new Error(`Unable to find items for section ${action.id}`);

      sectionItems.push(action.item.id);
      newState.items.set(action.item.id, action.item);
      newState.itemAssignees.set(action.item.id, []);
      newState.itemTags.set(action.item.id, []);
      break;
    }

    case 'ReorderItem': {
      const sectionItems = newState.sectionItems.get(action.sectionId);

      if (!sectionItems)
        throw new Error(`Unable to find items for section ${action.sectionId}`);

      const wasShiftedUp = action.oldIndex > action.newIndex;
      const lowIndex = Math.min(action.newIndex, action.oldIndex);
      const highIndex = Math.max(action.newIndex, action.oldIndex);

      for (const itemId of sectionItems) {
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

    case 'SetItemDescription':
      getItem(newState, action.id).description = action.description;
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
      newState.itemTags.get(action.itemId)?.push(action.tagId);
      break;

    case 'UnlinkTagFromItem': {
      const itemTags = newState.itemTags.get(action.itemId);

      // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
      if (!itemTags)
        throw new Error(`Unable to find tags for item ${action.itemId}`);

      newState.itemTags.set(
        action.itemId,
        itemTags.filter(tag => tag !== action.tagId)
      );
      break;
    }

    case 'DeleteItem': {
      const sectionItems = newState.sectionItems.get(action.sectionId);

      // Should be impossible to trigger this, hence the runtime error - skipcq: TCV-001
      if (!sectionItems)
        throw new Error(`Unable to find items for section ${action.sectionId}`);

      newState.sectionItems.set(
        action.sectionId,
        sectionItems.filter(item => item === action.id)
      );

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
function getItem(state: FullState, itemId: string) {
  const item = state.items.get(itemId);

  if (!item) throw new Error(`Unable to find item with ID ${itemId}`);

  return item;
}

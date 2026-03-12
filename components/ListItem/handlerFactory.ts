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
import { ActionDispatch, Dispatch, RefObject, SetStateAction } from 'react';

import api from '@/lib/api';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';
import { NamedColor } from '@/lib/model/color';
import { ItemAction } from '@/components/List';
import { addToastForError } from '@/lib/error';

/**
 * Produces all functions for interacting with a specific list item and its data. These
 * functions make API requests to persist changes and updates React's state when the API
 * requests succeed. These functions live here to avoid polluting <ListItem />'s
 * definition.
 *
 * @param itemId The ID for the item that the functions are for
 * @param sectionId The ID for the section that the item belongs to
 * @param timerData All data and callbacks needed to interact with the ListItem
 *  component's internal timer state
 * @param tagsAvailable All tags associated with the list the item belongs to
 * @param dispatchItemChange Callback to propagate state changes to the item
 */
export function itemHandlerFactory(
  itemId: string,
  sectionId: string,
  timerData: {
    timer: RefObject<NodeJS.Timeout | undefined>;
    lastTime: RefObject<Date>;
    setElapsedLive: Dispatch<SetStateAction<number>>;
    stopRunning: () => unknown;
  },
  tagsAvailable: Tag[],
  dispatchItemChange: ActionDispatch<[action: ItemAction]>
) {
  /**
   * @param name The item's new name
   */
  function setName(name: ListItem['name']) {
    api
      .patch(`/item/${itemId}`, { name })
      .then(() =>
        dispatchItemChange({ type: 'SetItemName', sectionId, id: itemId, name })
      )
      .catch(addToastForError);
  }

  /**
   * @param date The item's new due date
   */
  function setDueDate(date: ListItem['dateDue']) {
    api
      .patch(`/item/${itemId}`, { dateDue: date })
      .then(() => {
        dispatchItemChange({
          type: 'SetItemDueDate',
          sectionId,
          id: itemId,
          date
        });
      })
      .catch(addToastForError);
  }

  /**
   * @param priority The item's new priority
   */
  function setPriority(priority: ListItem['priority']) {
    api
      .patch(`/item/${itemId}`, { priority })
      .then(() => {
        dispatchItemChange({
          type: 'SetItemPriority',
          sectionId,
          id: itemId,
          priority
        });
      })
      .catch(addToastForError);
  }

  /**
   * Updates the list item's status
   */
  function setIncomplete() {
    api
      .patch(`/item/${itemId}`, { status: 'Paused', dateCompleted: null })
      .then(() => {
        dispatchItemChange({
          type: 'SetItemIncomplete',
          sectionId,
          id: itemId
        });
      })
      .catch(addToastForError);
  }

  /**
   * Updates the list item's status
   *
   * @param elapsedLive The number of milliseconds the item's timer has been running
   */
  function setComplete(elapsedLive: number) {
    // Store time before starting POST request to ensure it's accurate
    const dateCompleted = new Date();
    const newElapsed = timerData.timer.current
      ? elapsedLive + (Date.now() - timerData.lastTime.current.getTime())
      : 0;

    api
      .patch(`/item/${itemId}`, {
        status: 'Completed',
        dateCompleted,
        dateStarted: null,
        elapsedMs: newElapsed
      })
      .then(() => {
        timerData.stopRunning();
        // Ensure time is accurate since user stopped time before POST request
        if (newElapsed) timerData.setElapsedLive(newElapsed);

        // Update the internal state
        dispatchItemChange({
          type: 'SetItemComplete',
          sectionId,
          id: itemId,
          dateCompleted
        });
      })
      .catch(addToastForError);
  }

  /**
   * @param expectedMs The new expected time to complete
   */
  function setExpectedMs(expectedMs: number) {
    api
      .patch(`/item/${itemId}`, { expectedMs })
      .then(() => {
        dispatchItemChange({
          type: 'SetItemExpectedMs',
          sectionId,
          id: itemId,
          expectedMs
        });
      })
      .catch(addToastForError);
  }

  /**
   * Adds one of the list's tags to the item
   *
   * @param id The tag ID to add
   */
  function linkTag(id: string) {
    api
      .post(`/item/${itemId}/tag/${id}`, {})
      .then(() => {
        dispatchItemChange({
          type: 'LinkTagToItem',
          sectionId,
          itemId,
          tagId: id,
          tagsAvailable
        });
      })
      .catch(addToastForError);
  }

  /**
   * Removes one of the item's tags (but doesn't delete it from the list entirely)
   *
   * @param id The tag ID to remove
   */
  function unlinkTag(id: string) {
    api
      .delete(`/item/${itemId}/tag/${id}`)
      .then(() =>
        dispatchItemChange({
          type: 'UnlinkTagFromItem',
          sectionId,
          itemId,
          tagId: id
        })
      )
      .catch(addToastForError);
  }

  /**
   * Adds a just-created tag to the item. Handled separately from `linkTag` because the
   * React state doesn't necessarily include the new tag yet, so it has to be created from
   * its name and color instead of just being looked up in the list's tags.
   *
   * Note: does **not** make an API request to create the new tag, just to link it to this
   * item. That API request should succeed before this function is called.
   *
   * @param id The new tag's ID
   * @param name The new tag's name
   * @param color The new tag's display color
   */
  function linkNewTag(
    id: string,
    name: string,
    color: NamedColor
  ): Promise<unknown> {
    return api
      .post(`/item/${itemId}/tag/${id}`, {})
      .then(() => {
        dispatchItemChange({
          type: 'LinkNewTagToItem',
          sectionId,
          itemId,
          tag: new Tag(name, color, id)
        });
      })
      .catch(addToastForError);
  }

  /**
   * Removes the item
   */
  function deleteSelf() {
    api
      .delete(`/item/${itemId}`)
      .then(res => {
        dispatchItemChange({ type: 'DeleteItem', sectionId, id: itemId }); // Send parent the update to remove this component

        // Let the user know we succeeded
        addToast({ title: res.message, color: 'success' });
      })
      .catch(addToastForError);
  }

  return {
    setName,
    setDueDate,
    setPriority,
    setIncomplete,
    setComplete,
    setExpectedMs,
    linkTag,
    unlinkTag,
    linkNewTag,
    deleteSelf
  };
}

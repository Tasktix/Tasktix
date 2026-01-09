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

import { ItemAction } from './types';

/**
 * Produces all functions for interacting with a specific list item and its data. These
 * functions make API requests to persist changes and updates React's state when the API
 * requests succeed. These functions live here to avoid polluting <ListItem />'s
 * definition.
 *
 * @param itemId The ID for the item that the functions are for
 * @param tagsAvailable All tags associated with the list the item belongs to
 * @param dispatchItem Callback for updating the item's useReducer state
 * @param updateDueDate Callback to propagate state changes for the item's due date
 * @param updatePriority Callback to propagate state changes for the item's priority
 * @param setPaused Callback to propagate state changes for the item's status
 * @param setCompleted Callback to propagate state changes for the item's status
 * @param updateExpectedMs Callback to propagate state changes for the item's expected
 *  completion time
 * @param deleteItem Callback to propagate state changes to delete the item
 */
export function itemHandlerFactory(
  itemId: string,
  tagsAvailable: Tag[],
  dispatchItem: ActionDispatch<[action: ItemAction]>,
  updateDueDate: (date: ListItem['dateDue']) => unknown,
  updatePriority: (priority: ListItem['priority']) => unknown,
  setPaused: () => unknown,
  setCompleted: (date: ListItem['dateCompleted']) => unknown,
  updateExpectedMs: (ms: number) => unknown,
  deleteItem: () => unknown
) {
  /**
   * @param name The item's new name
   */
  function setName(name: ListItem['name']) {
    api
      .patch(`/item/${itemId}`, { name })
      .then(() => dispatchItem({ type: 'SetName', name }))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * @param date The item's new due date
   */
  function setDueDate(date: ListItem['dateDue']) {
    api
      .patch(`/item/${itemId}`, { dateDue: date })
      .then(() => {
        dispatchItem({ type: 'SetDueDate', date });

        updateDueDate(date); // Send parent the update for reordering items
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * @param priority The item's new priority
   */
  function setPriority(priority: ListItem['priority']) {
    api
      .patch(`/item/${itemId}`, { priority })
      .then(() => {
        dispatchItem({ type: 'SetPriority', priority });

        updatePriority(priority); // Send parent the update for reordering items
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * Updates the list item's status
   */
  function setIncomplete() {
    api
      .patch(`/item/${itemId}`, { status: 'Paused', dateCompleted: null })
      .then(() => {
        dispatchItem({ type: 'SetIncomplete' });

        setPaused(); // Send parent the update for reordering items
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * Updates the list item's status
   *
   * @param timerData All data and callbacks needed to interact with the ListItem
   *  component's internal timer state
   */
  function setComplete(timerData: {
    timer: RefObject<NodeJS.Timeout | undefined>;
    lastTime: RefObject<Date>;
    elapsedLive: number;
    setElapsedLive: Dispatch<SetStateAction<number>>;
    stopRunning: () => unknown;
  }) {
    // Store time before starting POST request to ensure it's accurate
    const dateCompleted = new Date();
    const newElapsed = timerData.timer.current
      ? timerData.elapsedLive +
        (Date.now() - timerData.lastTime.current.getTime())
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
        dispatchItem({ type: 'SetComplete', dateCompleted });

        setCompleted(dateCompleted); // Send parent the update for reordering items
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * @param expectedMs The new expected time to complete
   */
  function setExpectedMs(expectedMs: number) {
    api
      .patch(`/item/${itemId}`, { expectedMs })
      .then(() => {
        dispatchItem({ type: 'SetExpectedMs', expectedMs });

        updateExpectedMs(expectedMs); // Send parent the update for reordering items
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
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
        dispatchItem({ type: 'LinkTag', id, tagsAvailable });
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * Removes one of the item's tags (but doesn't delete it from the list entirely)
   *
   * @param id The tag ID to remove
   */
  function unlinkTag(id: string) {
    api
      .delete(`/item/${itemId}/tag/${id}`)
      .then(() => dispatchItem({ type: 'UnlinkTag', id }))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  /**
   * Removes the item
   */
  function deleteSelf() {
    api
      .delete(`/item/${itemId}`)
      .then(res => {
        deleteItem(); // Send parent the update to remove this component

        // Let the user know we succeeded
        addToast({ title: res.message, color: 'success' });
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
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
    deleteSelf
  };
}

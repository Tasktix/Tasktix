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

'use client';
import { useSyncExternalStore, useCallback } from 'react';

/**
 * Defines snapshot of localStorage for useSyncExternalStore
 */
const getSnapshot = () => localStorage.getItem('KanbanPreference') ?? '[]';

/**
 * Defines subscribe parameter for useSyncExternalStore
 *
 * @param callback The callback which will rerender the component
 */
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-update', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-update', callback);
  };
};

/**
 * Returns the current kanban preference for the list, and also returns a function to update the kanban preference
 *
 * @param listId The list ID of the kanban preference
 */
export function useKanbanPref(listId: string) {
  const kanbanPref = useSyncExternalStore(subscribe, getSnapshot, () => '[]');
  const kanbanPrefParsed = JSON.parse(kanbanPref) as [string, boolean][];
  const kanbanPrefMap = new Map<string, boolean>(kanbanPrefParsed);
  const isKanban = kanbanPrefMap.get(listId) ?? false;

  /**
   * Sets the kanban preference in localStorage and updates the state
   *
   * @param value Value that the localStorage kanban preference will set to
   */
  const setIsKanban = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const kanbanPref = getSnapshot();
      const kanbanPrefParsed = JSON.parse(kanbanPref) as [string, boolean][];
      const kanbanPrefMap = new Map<string, boolean>(kanbanPrefParsed);

      const newValue =
        typeof value === 'function'
          ? value(kanbanPrefMap.get(listId) ?? false)
          : value;

      kanbanPrefMap.set(listId, newValue);
      localStorage.setItem(
        'KanbanPreference',
        JSON.stringify(Array.from(kanbanPrefMap.entries()))
      );
      window.dispatchEvent(new Event('local-storage-update'));
    },
    [listId]
  );

  return [isKanban, setIsKanban] as const;
}

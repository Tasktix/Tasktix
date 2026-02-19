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

import { addToast, closeToast } from '@heroui/react';

import { ListAction } from '@/components/List/types';

/**
 * Subscribes to Server-Sent Events for updates to the given lists' state, calling the
 * given callback whenever an event is received
 *
 * @param lists IDs of the lists to subscribe to for updates
 * @param onEvent Callback to handle received events (e.g. to update local state to match
 *  changes made by other users)
 * @returns A cleanup function to unsubscribe from updates
 *
 * @example
 * // Can be used to update state until the component unmounts like this:
 * import { subscribe } from '@/lib/sse/client';
 * ...
 *   useEffect(() => subscribe([list.id], dispatchList), [list.id]);
 */
export function subscribe(
  lists: string[],
  onEvent: (event: ListAction) => unknown
): () => void {
  const params = new URLSearchParams(lists.map(list => ['list', list]));
  const es = new EventSource(`/api/events?${params.toString()}`);

  /**
   * These variables used to display a toast to the user when reconnecting & when
   * reconnected
   */
  let expectClose = false;
  let hasOpened = false;
  const setState = pendingFactory();

  es.onopen = () => {
    if (hasOpened)
      setState(addToast({ title: 'Reconnected', color: 'success' }));
    else hasOpened = true;
  };

  es.onmessage = event => {
    onEvent(JSON.parse(event.data as string) as ListAction);
  };

  es.onerror = () => {
    if (es.readyState === es.CLOSED && !expectClose)
      setState(
        addToast({
          title: 'Unable to connect for live updates',
          color: 'danger'
        })
      );
    if (es.readyState === es.CONNECTING) {
      let resolve;
      const toast = addToast({
        title: 'Reconnecting for live updates',
        color: 'warning',
        promise: new Promise(r => (resolve = r))
      });

      setState(toast, resolve);
    }
  };

  return () => {
    expectClose = true;
    es.close();
  };
}

/**
 * Tracks the pending state for a promise and toast that can be cleaned up and replaced
 * with a new pending state via the returned function
 *
 * @returns A function that cleans up pending state (i.e. resolves the promise and clears
 *  the toast) and sets a new pending state
 */
function pendingFactory() {
  let resolve: ((v?: unknown) => void) | undefined;
  let toast: string | null = null;

  /**
   * Resolves the promise if a resolving function is set, then clears the resolving
   * function
   */
  const tryResolve = () => {
    if (resolve) {
      resolve();
      resolve = undefined;
    }
  };

  /**
   * Closes the toast if there is a saved ID for one, then clears the ID
   */
  const tryCloseToast = () => {
    if (toast) {
      closeToast(toast);
      toast = null;
    }
  };

  return (t: typeof toast, r?: typeof resolve) => {
    tryResolve();
    tryCloseToast();
    toast = t;
    resolve = r;
  };
}

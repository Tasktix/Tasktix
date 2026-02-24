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

/* eslint-disable no-console */

import { ListAction } from '@/components/List/types';

// This file's logic ensures only 1 copy of the clients object is created, even when the
// development server hot reloads. Based on Prisma Next.js best practices:
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help#best-practices-for-using-prisma-client-in-development
const globalForClients = globalThis as unknown as {
  clients: {
    controllersByList: Map<
      string,
      Map<symbol, ReadableStreamDefaultController>
    >;
    listsByController: Map<symbol, string[]>;
  };
};

const clients = globalForClients.clients || {
  controllersByList: new Map(),
  listsByController: new Map()
};

if (process.env.NODE_ENV !== 'production') globalForClients.clients = clients;

/**
 * Subscribes a client for broadcast messages via the given stream
 *
 * @param controller The stream controller for pushing messages to the client
 * @param lists The IDs of the lists to subscribe to events on
 * @returns The client ID for gracefully handling their disconnection
 */
export function addClient(
  controller: ReadableStreamDefaultController,
  lists: string[]
): symbol {
  const id = Symbol('controller');

  for (const listId of lists) {
    console.log(clients);
    console.log(listId);
    const list = clients.controllersByList.get(listId);

    console.log(list);

    if (list) list.set(id, controller);
    else clients.controllersByList.set(listId, new Map([[id, controller]]));
  }

  clients.listsByController.set(id, lists);

  console.log(`Client subscribed to lists ${JSON.stringify(lists)}`);
  console.log(clients);

  return id;
}

/**
 * Unsubscribes a client from broadcast messages (e.g. because they disconnected).
 *
 * @param id The client to unsubscribe
 */
export function removeClient(id: symbol) {
  console.log(
    `Client unsubscribed from lists ${JSON.stringify(
      clients.listsByController.get(id) ?? []
    )}`
  );
  for (const listId of clients.listsByController.get(id) ?? [])
    clients.controllersByList.get(listId)?.delete(id);

  clients.listsByController.delete(id);
}

/**
 * Broadcasts the given data to all currently-connected clients that are subscribed to the
 * given list's messages
 *
 * @param list The ID of the list the message is about
 * @param message The message to broadcast
 */
export function broadcastEvent(list: string, message: ListAction) {
  console.log(
    `Sending events for list ${list} to ${
      clients.controllersByList.get(list)?.size
    } clients`
  );
  clients.controllersByList
    .get(list)
    ?.values()
    .forEach(controller =>
      controller.enqueue(`data: ${JSON.stringify(message)}\n\n`)
    );
}

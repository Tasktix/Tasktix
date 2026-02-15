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

interface Client {
  controller: ReadableStreamDefaultController;
}

const clients: Map<number, Client> = new Map();
let nextId = 0;

/**
 * Subscribes a client for broadcast messages via the given stream
 *
 * @param controller The stream controller for pushing messages to the client
 * @returns The client ID for gracefully handling their disconnection
 */
export function addClient(controller: Client['controller']): number {
  const id = nextId++;

  clients.set(id, { controller });

  return id;
}

/**
 * Unsubscribes a client from broadcast messages (e.g. because they disconnected).
 *
 * @param id The client to unsubscribe
 */
export function removeClient(id: number) {
  clients.delete(id);
}

/**
 * Broadcasts the given data to all currently-connected clients
 *
 * @param data The data to broadcast
 */
export function broadcast(data: string) {
  clients.forEach(client => {
    client.controller.enqueue(`data: ${data}\n\n`);
  });
}

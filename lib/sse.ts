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

export function addClient(controller: Client['controller']): number {
  const id = nextId++;

  clients.set(id, { controller });

  return id;
}

export function removeClient(id: number) {
  clients.delete(id);
}

export function broadcast(data: string) {
  clients.forEach(client => {
    client.controller.enqueue(`data: ${data}\n\n`);
  });
}

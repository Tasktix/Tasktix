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

import { NextRequest } from 'next/server';

import { addClient, removeClient } from '@/lib/sse/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API endpoint for subscribing to list state update events from clients.
 * Should be accessed using the SSE client like this:
 * ```ts
 * import { subscribe } from '@/lib/sse/client';
 * ...
 *   useEffect(() => subscribe(dispatchList), [dispatchList]);
 * ```
 *
 * @param req The client's request
 * @param req.list The ID of lists to subscribe to state update events on (this parameter
 *  can be specified more than 1 time given)
 * @returns A response stream that will include every event until the client disconnects
 */
export function GET(req: NextRequest) {
  const lists = req.nextUrl.searchParams.getAll('list');

  const stream = new ReadableStream({
    start(controller) {
      const id = addClient(controller, lists);

      req.signal.addEventListener('abort', () => removeClient(id));
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}

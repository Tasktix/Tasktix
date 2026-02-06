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

import { addClient, removeClient } from '@/lib/sse';

// Don't need to test 'cause this is just a demo - skipcq: TCV-001
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API endpoint for subscribing to state update events from clients on the `/count` page.
 * Should be accessed like this:
 * ```ts
 * useEffect(() => {
 *   const es = new EventSource('/api/events');
 *
 *   es.onmessage = event => {
 *     const data = JSON.parse(event.data as string) as { count: number };
 *     setCount(data.count);
 *   };
 *
 *   es.onerror = () => {
 *     addToast({ title: 'Error connecting for live updates', color: 'danger' });
 *     es.close();
 *   };
 *
 *    return () => es.close();
 * }, []);
 * ```
 *
 * @param req The client's request
 * @returns A response stream that will include every event until the client disconnects
 */
export function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const id = addClient(controller);

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

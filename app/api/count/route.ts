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

import { OK } from '@/lib/Response/Success';
import { broadcast } from '@/lib/sse';

/**
 * API endpoint for updating the `count` state across all clients. Calling this endpoint
 * triggers a broadcast of the new `count` to all clients connected to the `/count` page.
 *
 * @param req The client's request
 * @returns An HTTP response indicating the API request was processed
 */
export async function POST(req: Request) {
  // Don't need to test 'cause this is just a demo - skipcq: TCV-001

  const body = (await req.json()) as { count: number };

  broadcast(`{ "count": ${body.count} }`);

  return OK('Broadcast');
}

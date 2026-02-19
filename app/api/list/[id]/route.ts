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

import { ClientError, ServerError, Success } from '@/lib/Response';
import {
  deleteList,
  getIsListAssignee,
  getListById,
  updateList
} from '@/lib/database/list';
import { ZodList } from '@/lib/model/list';
import { getUser } from '@/lib/session';
import { broadcastEvent } from '@/lib/sse/server';

const PatchBody = ZodList.omit({ id: true }).partial();

/**
 * Updates the specified parts of a list's metadata and triggers an SSE broadcast to
 * clients subscribed to this list's changes
 *
 * @param params.id The list to modify
 * @param request.name [optional] The new list name
 * @param request.color [optional] The new list color
 * @param request.hasTimeTracking [optional] Whether the list now has time tracking
 * @param request.hasDueDates [optional] Whether the list now has due dates
 * @param request.isAutoOrdered [optional] Whether the list is now auto-ordered
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const list = await getListById(id);

  if (!list) return ClientError.NotFound('List not found');

  const isMember = await getIsListAssignee(user.id, id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const parseResult = PatchBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  if (requestBody.name) list.name = requestBody.name;
  if (requestBody.hasTimeTracking !== undefined)
    list.hasTimeTracking = requestBody.hasTimeTracking;
  if (requestBody.hasDueDates !== undefined)
    list.hasDueDates = requestBody.hasDueDates;
  if (requestBody.isAutoOrdered !== undefined)
    list.isAutoOrdered = requestBody.isAutoOrdered;
  if (requestBody.color !== undefined) list.color = requestBody.color;

  const result = await updateList(list);

  if (!result) return ServerError.Internal('Could not update list');

  if (requestBody.name)
    broadcastEvent(list.id, { type: 'SetListName', name: list.name });
  if (requestBody.hasTimeTracking !== undefined)
    broadcastEvent(list.id, {
      type: 'SetHasTimeTracking',
      hasTimeTracking: list.hasTimeTracking
    });
  if (requestBody.hasDueDates !== undefined)
    broadcastEvent(list.id, {
      type: 'SetHasDueDates',
      hasDueDates: list.hasDueDates
    });
  if (requestBody.isAutoOrdered !== undefined)
    broadcastEvent(list.id, {
      type: 'SetIsAutoOrdered',
      isAutoOrdered: list.isAutoOrdered
    });
  if (requestBody.color)
    broadcastEvent(list.id, { type: 'SetListColor', color: list.color });

  return Success.OK('List updated');
}

/**
 * Deletes the given list and all associated data
 *
 * @param params.id The list to delete
 */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListAssignee(user.id, id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const result = await deleteList(id);

  if (!result) return ServerError.Internal('Could not delete list');

  return Success.OK('List deleted');
}

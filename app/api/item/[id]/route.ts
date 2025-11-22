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
import { getListMemberByItem } from '@/lib/database/list';
import {
  deleteListItem,
  getListItemById,
  updateListItem
} from '@/lib/database/listItem';
import { getUser } from '@/lib/session';
import { ZodListItem } from '@/lib/model/listItem';

const PatchBody = ZodListItem.omit({
  id: true,
  sectionIndex: true,
  sectionId: true
}).partial();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const item = await getListItemById(params.id);

  if (!item) return ClientError.NotFound('List item not found');

  const member = await getListMemberByItem(user.id, params.id);

  if (!member) return ClientError.BadRequest('List item not found');

  const parseResult = PatchBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  if (requestBody.name) item.name = requestBody.name;
  if (requestBody.status) {
    if (requestBody.status === 'Completed' && !member.canComplete)
      return ClientError.BadRequest(
        'Insufficient permissions to complete item'
      );
    item.status = requestBody.status;
  }
  if (requestBody.priority) item.priority = requestBody.priority;
  if (requestBody.dateDue) item.dateDue = new Date(requestBody.dateDue);
  if (requestBody.expectedMs) item.expectedMs = requestBody.expectedMs;
  if (requestBody.elapsedMs !== undefined)
    item.elapsedMs = requestBody.elapsedMs;
  if (requestBody.dateStarted !== undefined)
    item.dateStarted = requestBody.dateStarted
      ? new Date(requestBody.dateStarted)
      : null;
  if (requestBody.dateCompleted !== undefined)
    item.dateCompleted = requestBody.dateCompleted
      ? new Date(requestBody.dateCompleted)
      : null;

  const result = await updateListItem(item);

  if (!result) return ServerError.Internal('Could not update item');

  return Success.OK('Item updated');
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const member = await getListMemberByItem(user.id, params.id);

  if (!member) return ClientError.BadRequest('List not found');
  if (!member.canRemove)
    return ClientError.BadRequest('Insufficient permissions to remove item');

  const result = await deleteListItem(params.id);

  if (!result) return ServerError.Internal('Could not delete item');

  return Success.OK('Item deleted');
}

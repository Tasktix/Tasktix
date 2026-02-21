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
  getIsListMember,
  getListById,
  updateList
} from '@/lib/database/list';
import { ZodList } from '@/lib/model/list';
import { getUser } from '@/lib/session';

const PatchBody = ZodList.omit({ id: true }).partial();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const list = await getListById(id);

  if (!list) return ClientError.NotFound('List not found');

  const isMember = await getIsListMember(user.id, id);

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

  return Success.OK('List updated');
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListMember(user.id, id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const result = await deleteList(id);

  if (!result) return ServerError.Internal('Could not delete list');

  return Success.OK('List deleted');
}

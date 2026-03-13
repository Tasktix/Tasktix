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

import z from 'zod';

import { ClientError, ServerError, Success } from '@/lib/Response';
import { getRoleByList } from '@/lib/database/user';
import { updateSectionIndices } from '@/lib/database/listItem';
import { getUser } from '@/lib/session';
import { ZodListItem } from '@/lib/model/listItem';

const PatchBody = z.strictObject({
  itemId: ZodListItem.shape.id,
  index: ZodListItem.shape.sectionIndex,
  oldIndex: ZodListItem.shape.sectionIndex
});

/**
 * Reorders a list item within its section
 *
 * @param request.itemId The item to move
 * @param request.index The new index to move the item to (within the section)
 * @param request.oldIndex The index to move the item from (within the section)
 * @param params.id The list that the section and item belong to
 * @param params.sectionId The section that item belongs to
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const { id, sectionId } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const role = await getRoleByList(user.id, id);

  if (!role) return ClientError.NotFound('List not found');
  if (!role.canUpdateList)
    return ClientError.Forbidden('Insufficient permissions to reorder items');

  const parseResult = PatchBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  const itemId = requestBody.itemId;
  const index = requestBody.index;
  const oldIndex = requestBody.oldIndex;

  const result = await updateSectionIndices(sectionId, itemId, index, oldIndex);

  if (!result) return ServerError.Internal('Could not reorder items');

  return Success.OK('Items reordered');
}

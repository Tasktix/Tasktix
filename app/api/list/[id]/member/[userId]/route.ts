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

import { getIsListAssignee, updateListMember } from '@/lib/database/list';
import { getRoleByList } from '@/lib/database/user';
import { ZodListMember } from '@/lib/model/listMember';
import { ClientError, ServerError, Success } from '@/lib/Response';
import { getUser } from '@/lib/session';

const PatchBody = ZodListMember.omit({ listId: true, userId: true });

/**
 * Update a member's permissions for a specific list
 *
 * @param params.id The list to modify the member for
 * @param params.userId The user to modify membership data for
 * @param request.canAdd [optional] Whether the user can add items to the list
 * @param request.canRemove [optional] Whether the user can delete items from the list
 * @param request.canComplete [optional] Whether the user can mark items as completed
 * @param request.canAssign [optional] Whether the user can assign items to other users
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const role = await getRoleByList(user.id, id);

  if (!role) return ClientError.NotFound('List not found');
  if (!role.canManageMembers)
    return ClientError.Forbidden('Insufficient permissions to update member');

  const isMember = await getIsListAssignee(userId, id);

  if (!isMember) return ClientError.NotFound('Member not found');

  const parseResult = PatchBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  // TODO: don't allow last Admin to have role downgraded

  const result = await updateListMember(id, userId, requestBody.roleId);

  if (!result) return ServerError.Internal('Could not update member');

  return Success.OK('Member updated');
}

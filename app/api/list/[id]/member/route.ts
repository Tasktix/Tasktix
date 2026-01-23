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
import { createListMember, getIsListAssignee } from '@/lib/database/list';
import { getUserByUsername } from '@/lib/database/user';
import ListMember from '@/lib/model/listMember';
import { getUser } from '@/lib/session';
import { ZodUser } from '@/lib/model/user';

const PostBody = ZodUser.pick({ username: true });

/**
 * Add a user as a member of the list so they can view it and be assigned items to
 * complete. When first added, members will have no permissions & must be granted them
 * after
 *
 * @param params.id The list to add the member to
 * @param request.username The username of the member to add to the list
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListAssignee(user.id, id);

  if (!isMember) return ClientError.NotFound('List not found');

  // TODO: Should add permission & authorization for adding users

  const parseResult = PostBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  const newUser = await getUserByUsername(requestBody.username);

  if (!newUser) return ClientError.NotFound('User not found');

  if (await getIsListAssignee(newUser.id, id))
    return ClientError.Conflict('User is already a member');

  const listMember = new ListMember(newUser);

  const result = await createListMember(id, listMember);

  if (!result) return ServerError.Internal('Could not add member');

  return Success.OK('Member added', JSON.stringify(listMember));
}

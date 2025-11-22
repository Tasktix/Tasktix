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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListAssignee(user.id, params.id);

  if (!isMember) return ClientError.NotFound('List not found');

  // TODO: Should add permission & authorization for adding users

  const parseResult = PostBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  const newUser = await getUserByUsername(requestBody.username);

  if (!newUser) return ClientError.NotFound('User not found');

  if (await getIsListAssignee(newUser.id, params.id))
    return ClientError.Conflict('User is already a member');

  const listMember = new ListMember(newUser);

  const result = await createListMember(params.id, listMember);

  if (!result) return ServerError.Internal('Could not add member');

  return Success.OK('Member added', JSON.stringify(listMember));
}

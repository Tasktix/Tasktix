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
import { createList } from '@/lib/database/list';
import { getCreatorRole } from '@/lib/database/user';
import List, { ZodList } from '@/lib/model/list';
import ListMember from '@/lib/model/listMember';
import { getUser } from '@/lib/session';

const PostBody = ZodList.pick({ name: true, color: true });

export async function POST(request: Request) {
  const session = await getUser();

  if (!session) return ClientError.Unauthenticated('Not logged in');

  const parseResult = PostBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  const name = requestBody.name;
  const color = requestBody.color;
  const role = await getCreatorRole();

  const listMember = new ListMember(session, role);
  const list = new List(name, color, [listMember], [], true, true, true);

  const result = await createList(list);

  if (!result) return ServerError.Internal('Could not create list');

  return Success.Created('List created', `/list/${list.id}`);
}

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
import { createTag, getIsListAssignee } from '@/lib/database/list';
import Tag, { ZodTag } from '@/lib/model/tag';
import { getUser } from '@/lib/session';

const PostBody = ZodTag.omit({ id: true });

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListAssignee(user.id, params.id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const parseResult = PostBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  const name = requestBody.name;
  const color = requestBody.color;

  const tag = new Tag(name, color);

  const result = await createTag(params.id, tag);

  if (!result) return ServerError.Internal('Could not create tag');

  return Success.Created('Tag created', `/item/${params.id}/tag/${tag.id}`);
}

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
  deleteTag,
  getIsListMember,
  getTagById,
  updateTag
} from '@/lib/database/list';
import { ZodTag } from '@/lib/model/tag';
import { getUser } from '@/lib/session';

const PatchBody = ZodTag.omit({ id: true }).partial();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const { id, tagId } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListMember(user.id, id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const tag = await getTagById(tagId);

  // TODO: need to handle security gap: editing someone else's tag
  if (!tag) return ClientError.BadRequest('Tag not found');

  const parseResult = PatchBody.safeParse(await request.json());

  if (!parseResult.success)
    return ClientError.BadRequest('Invalid request data');

  const requestBody = parseResult.data;

  if (requestBody.name) tag.name = requestBody.name;
  if (requestBody.color) tag.color = requestBody.color;

  const result = await updateTag(tag);

  if (!result) return ServerError.Internal('Could not add tag');

  return Success.OK('Tag added');
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const { id, tagId } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListMember(user.id, id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const result = await deleteTag(tagId);

  if (!result) return ServerError.Internal('Could not remove tag');

  return Success.OK('Tag removed');
}

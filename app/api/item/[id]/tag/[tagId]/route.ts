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
import { getIsListMemberByItem } from '@/lib/database/list';
import { linkTag, unlinkTag } from '@/lib/database/listItem';
import { getUser } from '@/lib/session';

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const { id, tagId } = await params;
  const user = await getUser();

  if (!user) return ClientError.Unauthenticated('Not logged in');

  const isMember = await getIsListMemberByItem(user.id, id);

  if (!isMember) return ClientError.BadRequest('List item not found');

  const result = await linkTag(id, tagId);

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

  const isMember = await getIsListMemberByItem(user.id, id);

  if (!isMember) return ClientError.BadRequest('List not found');

  const result = await unlinkTag(id, tagId);

  if (!result) return ServerError.Internal('Could not remove tag');

  return Success.OK('Tag removed');
}

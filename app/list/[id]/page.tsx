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

import { redirect } from 'next/navigation';

import {
  getIsListAssignee,
  getListById,
  getTagsByListId
} from '@/lib/database/list';
import List from '@/components/List';
import { getUser } from '@/lib/session';
import { getMemberRoles } from '@/lib/database/user';

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getListById(id);
  const tagsAvailable = await getTagsByListId(id);
  const roles = await getMemberRoles();

  const user = await getUser();

  if (!list || !user) redirect('/list');

  const isMember = await getIsListAssignee(user.id, list.id);

  if (!isMember) redirect('/list');

  return (
    <main className='p-8 w-full flex grow flex-col gap-8 overflow-y-scroll'>
      {list && (
        <List
          startingList={JSON.stringify(list)}
          startingRoles={JSON.stringify(roles || [])}
          startingTagsAvailable={JSON.stringify(tagsAvailable || [])}
        />
      )}
    </main>
  );
}

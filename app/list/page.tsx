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

import ListItemGroup from '@/components/ListItemGroup';
import {
  getListMembersByUser,
  getListsByUser,
  getTagsByUser
} from '@/lib/database/list';
import { getListItemsByUser } from '@/lib/database/listItem';
import { getUser } from '@/lib/session';

export default async function Page() {
  const user = await getUser();

  const lists = await getListsByUser(user ? user.id : '');
  const items = await getListItemsByUser(user ? user.id : '');
  const tags = await getTagsByUser(user ? user.id : '');
  const members = await getListMembersByUser(user ? user.id : '');

  return (
    <main className='w-full min-w-0 grow overflow-x-hidden overflow-y-scroll p-4 md:p-8 flex flex-col gap-8'>
      <ListItemGroup
        alternate="You're all caught up!"
        members={JSON.stringify(members)}
        startingItems={JSON.stringify(items)}
        startingLists={JSON.stringify(lists)}
        startingTags={JSON.stringify(tags)}
      />
    </main>
  );
}

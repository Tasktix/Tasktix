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
import { getRichListsByUser } from '@/lib/database/list';
import { getAvailableRoles } from '@/lib/database/user';
import { getUser } from '@/lib/session';

export default async function Page() {
  // No logic to test - skipcq: TCV-001
  const user = await getUser();

  const lists = await getRichListsByUser(user ? user.id : '');
  const roles = await getAvailableRoles();

  return (
    <main className='p-8 w-full flex grow flex-col gap-8 overflow-y-scroll'>
      <ListItemGroup
        alternateText="Great work, you're all caught up!"
        startingLists={JSON.stringify(lists)}
        startingRoles={JSON.stringify(roles)}
      />
    </main>
  );
}

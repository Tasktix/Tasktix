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

import { getUser } from '@/lib/session';

import SetUserProps from './components/SetUserProps';

/**
 * Gets current user information and sends it to SetUserProps
 *
 */
export default async function Page() {
  const userDetails = await getUser();

  return (
    <main className='flex p-6 justify-center'>
      <div className='bg-content1 w-1/3 m-4 rounded-lg px-4 h-full'>
        <h1 className='text-2xl p-4'>Profile</h1>
        <div>
          <SetUserProps user={JSON.stringify(userDetails)} />
        </div>
      </div>
    </main>
  );
}
